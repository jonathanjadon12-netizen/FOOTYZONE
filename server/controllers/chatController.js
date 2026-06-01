const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatMessage = require('../config/models/ChatMessage');
const SearchHistory = require('../config/models/SearchHistory');
const Match = require('../config/models/Match');
const sportsService = require('../utils/sportsService');
const logger = require('../utils/logger');

// Local simple rate limiter cache
const rateLimitCache = {};
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

// Dynamic data Cache to prevent database/API hammering
let cachedLiveScores = null;
let cachedFixtures = null;
let cachedStandings = {};
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache TTL

function checkRateLimit(identifier) {
  const now = Date.now();
  if (!rateLimitCache[identifier]) {
    rateLimitCache[identifier] = [];
  }
  // Filter out timestamps outside window
  rateLimitCache[identifier] = rateLimitCache[identifier].filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (rateLimitCache[identifier].length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  rateLimitCache[identifier].push(now);
  return true;
}

// 1. Conversational Chat Session with Gemini AI & Grounding DB
exports.chatWithAI = async (req, res, next) => {
  try {
    const { message, guestId, profileId } = req.body;
    if (!message) {
      return res.status(400).json({ status: 'fail', message: 'Message is required.' });
    }

    const userId = req.user ? req.user._id : null;
    const identifier = userId ? userId.toString() : (guestId || req.ip);

    // Rate Limit Guard
    if (!checkRateLimit(identifier)) {
      return res.status(429).json({ 
        status: 'fail', 
        message: 'Rate limit exceeded. Please wait a moment before sending more messages.' 
      });
    }

    // A. Persist User Message to MongoDB
    const userMessageDoc = await ChatMessage.create({
      userId,
      guestId,
      profileId,
      role: 'user',
      content: message,
      queryType: 'general'
    });

    // B. Retrieve Chat History from MongoDB to provide conversation memory (last 15 messages)
    const dbHistory = await ChatMessage.find({
      $or: [
        { userId: userId ? userId : undefined },
        { guestId: guestId ? guestId : undefined }
      ].filter(cond => cond !== undefined)
    })
    .sort({ createdAt: -1 })
    .limit(15);

    // Reverse history to chronological order
    const chronologicalHistory = dbHistory.reverse();

    // C. Compile Grounded High-Fidelity Stats
    const groundingStats = sportsService.getGroundingStatsPrompt();

    // D. Fetch Matches Catalog streamable on Footyzone
    const streamableMatches = await Match.find().select('title genres isVIP releaseYear');
    const catalogSnippet = streamableMatches.map(m => `- "${m.title}" [Genres: ${m.genres.join(', ')}]`).join('\n');

    // System prompt with Indian audience optimizations & detailed instructions
    const systemInstruction = `You are FootyBot, the ultimate, highly knowledgeable official AI Football Assistant on FootyZone (India's premier streaming and football platform).
    
Your goal is to answer football-related questions for both registered and guest users.
You are 100% FREE for all users with NO paywalls, premium tiers, or feature locks.

==================================================
INDIAN AUDIENCE OPTIMIZATION (CRITICAL RULES)
==================================================
1. CURRENCY CONVERSION:
   Whenever discussing transfer fees, club values, player salaries, revenues, or prize money in Euros (€), Dollars ($), or Pounds (£), you MUST convert it to Indian Rupees (₹) in Lakhs/Crores.
   Formula: €1 Million ≈ ₹9 Crore. €100 Million ≈ ₹900+ Crore.
   Example style: "€100 Million (approx. ₹900 Crore)" or "€80 Million (≈ ₹720 Crore)".
   
2. TIME ZONES:
   Always state match times in Indian Standard Time (IST).
   
3. INDIAN FOOTBALL PRIORITIZATION:
   Prominently support and highlight Indian football leagues and competitions:
   - Indian Super League (ISL)
   - I-League
   - Indian National Team (Blue Tigers)
   - AFC Competitions (Champions League, AFC Cup, etc.)
   Provide enthusiastic and proud coverage of Indian football players, especially legends:
   - Sunil Chhetri (Captain Fantastic)
   - Gurpreet Singh Sandhu
   - Sandesh Jhingan
   - Liston Colaco
   - Lallianzuala Chhangte

==================================================
FEATURES & CAPABILITIES
==================================================
You are an expert on:
- Player, Club, National Team, and League stats (Goals, Assists, Trophies, Standings, Squads).
- Live Scores, Fixtures, and Results (use the grounded data below!).
- Transfer information, historical trivia, news summaries, and predictions.
- Tactical explanations (Formations like 4-3-3, 3-5-2, or concepts like Gegenpressing).
- Guiding fans to watch games on Footyzone (Watch parties with friends, custom user profiles).

Use the following real-time ground-truth football database for your answers:
${groundingStats}

Footyzone Streamable Titles:
${catalogSnippet}

==================================================
RULES FOR RESPONSES
==================================================
1. Be enthusiastic, clear, and highly professional yet friendly. Use emojis like ⚽, 🏆, 🏟️, 🇮🇳, ⚡, 🔥, 🥅.
2. Use markdown formatting: bold headers, clean bullet points, tables, and short paragraphs for readability.
3. If asked about a player/club/national team not in the grounded stats, provide the accurate real-world football facts with currency in INR.
4. Keep the context of past conversations in mind.`;

    const apiKey = process.env.GEMINI_API_KEY;
    let assistantReply = '';
    let isMock = true;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          systemInstruction: systemInstruction
        });

        // Convert db history to Gemini API format (exclude the newly created user message which will be passed in sendMessage)
        const formattedHistoryForSDK = chronologicalHistory
          .filter(h => h._id.toString() !== userMessageDoc._id.toString())
          .map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          }));

        const chatSession = model.startChat({
          history: formattedHistoryForSDK,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
          }
        });

        const result = await chatSession.sendMessage(message);
        assistantReply = result.response.text();
        isMock = false;
      } catch (geminiError) {
        logger.error(`Gemini SDK error, falling back to local engine: ${geminiError.message}`);
      }
    }

    // Mock Offline Engine Fallback if Gemini key is missing or errors out
    if (!assistantReply) {
      assistantReply = await generateOfflineReply(message);
    }

    // E. Save Assistant Reply to MongoDB
    const assistantMessageDoc = await ChatMessage.create({
      userId,
      guestId,
      profileId,
      role: 'assistant',
      content: assistantReply,
      queryType: 'general'
    });

    res.status(200).json({
      status: 'success',
      data: {
        reply: assistantReply,
        isMock,
        messageId: assistantMessageDoc._id
      }
    });

  } catch (err) {
    next(err);
  }
};

// 2. Fetch Chat History Endpoint
exports.getChatHistory = async (req, res, next) => {
  try {
    const { guestId } = req.query;
    const userId = req.user ? req.user._id : null;

    if (!userId && !guestId) {
      return res.status(200).json({ status: 'success', data: [] });
    }

    const messages = await ChatMessage.find({
      $or: [
        { userId: userId ? userId : undefined },
        { guestId: guestId ? guestId : undefined }
      ].filter(cond => cond !== undefined)
    })
    .sort({ createdAt: 1 }) // Chronological order
    .limit(50);

    res.status(200).json({
      status: 'success',
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

// 3. Live Scores, Standings, & Fixtures cached API
exports.getLiveSportsData = async (req, res, next) => {
  try {
    const { league } = req.query;
    const now = Date.now();

    // Check Cache freshness
    if (now - lastCacheTime > CACHE_TTL_MS) {
      cachedLiveScores = await sportsService.getLiveScores();
      cachedFixtures = await sportsService.getFixtures();
      
      const leagues = ['isl', 'premier league', 'la liga'];
      for (const lg of leagues) {
        cachedStandings[lg] = {
          table: await sportsService.getStandings(lg),
          topScorers: await sportsService.getTopScorers(lg)
        };
      }
      lastCacheTime = now;
      logger.info('Football live sports cache refreshed.');
    }

    let responseData = {
      liveScores: cachedLiveScores,
      fixtures: cachedFixtures
    };

    if (league) {
      const lgKey = league.toLowerCase();
      responseData.standings = cachedStandings[lgKey]?.table || cachedStandings['isl'].table;
      responseData.topScorers = cachedStandings[lgKey]?.topScorers || cachedStandings['isl'].topScorers;
    } else {
      responseData.standings = cachedStandings['isl'].table;
      responseData.topScorers = cachedStandings['isl'].topScorers;
    }

    res.status(200).json({
      status: 'success',
      data: responseData
    });
  } catch (err) {
    next(err);
  }
};

// 4. Log search history & return instant grounding statistics
exports.logSearchHistory = async (req, res, next) => {
  try {
    const { query, category, guestId } = req.body;
    if (!query) {
      return res.status(400).json({ status: 'fail', message: 'Search query is required.' });
    }

    const userId = req.user ? req.user._id : null;

    // Log query in MongoDB
    await SearchHistory.create({
      userId,
      guestId,
      query,
      category: category || 'general'
    });

    // Check for immediate football intelligence database match
    const pSearch = await sportsService.findPlayerStats(query);
    if (pSearch.found) {
      return res.status(200).json({ status: 'success', data: pSearch });
    }

    const cSearch = await sportsService.findClubStats(query);
    if (cSearch.found) {
      return res.status(200).json({ status: 'success', data: cSearch });
    }

    const coSearch = await sportsService.findCountryStats(query);
    if (coSearch.found) {
      return res.status(200).json({ status: 'success', data: coSearch });
    }

    res.status(200).json({
      status: 'success',
      data: { found: false, message: 'Log registered. No direct match found in quick-data.' }
    });
  } catch (err) {
    next(err);
  }
};

// Local fallback AI generator with currency INR converters and IST kickoffs
async function generateOfflineReply(message) {
  const query = message.toLowerCase();

  // 1. Direct Player stats matches
  const pCheck = await sportsService.findPlayerStats(query);
  if (pCheck.found) {
    const p = pCheck.data;
    return `⚽ **Player Profile: ${p.name}** ⚽\n\n` +
      `👤 **Position:** ${p.position}\n` +
      `🎂 **Age:** ${p.age} years | 🌍 **Country:** ${p.country}\n` +
      `🏃 **Club:** ${p.club} | 🪙 **Market Value:** ${p.inrMarketValue}\n\n` +
      `📈 **Career Stats:**\n` +
      `• Appearances: **${p.appearances}**\n` +
      `• Goals: **${p.goals}** | Assists: **${p.assists}**\n` +
      `• Discipline: 🟨 **${p.yellowCards || 0}** | 🟥 **${p.redCards || 0}**\n\n` +
      `🏆 **Trophies & Honours:**\n${p.trophies.map(t => `• ${t}`).join('\n')}\n\n` +
      `📖 **Biography:** ${p.careerStats}\n\n` +
      `*(Note: Set \`GEMINI_API_KEY\` in your server configuration to enable full conversational AI chats!)*`;
  }

  // 2. Direct Club stats matches
  const cCheck = await sportsService.findClubStats(query);
  if (cCheck.found) {
    const c = cCheck.data;
    return `🏟️ **Club Report: ${c.name}** 🏟️\n\n` +
      `💼 **Manager:** ${c.manager} | 🏟️ **Stadium:** ${c.stadium}\n` +
      `📊 **Wins/Draws/Losses:** ${c.stats.wins}W / ${c.stats.draws}D / ${c.stats.losses}L\n` +
      `⚽ **Goals:** ${c.stats.goalsScored} scored | ${c.stats.goalsConceded} conceded\n` +
      `🪙 **Estimated Valuation:** ${c.valuation}\n\n` +
      `👥 **Star Players:** ${c.squad.join(', ')}\n\n` +
      `📈 **Form Guide:** \`${c.form}\`\n\n` +
      `🏆 **Trophy Cabinets:** ${c.trophies}\n\n` +
      `📖 **Club History:** ${c.history}`;
  }

  // 3. National Team
  const coCheck = await sportsService.findCountryStats(query);
  if (coCheck.found) {
    const co = coCheck.data;
    return `🌍 **National Team Profile: ${co.name}** 🌍\n\n` +
      `🔝 **FIFA Ranking:** #${co.fifaRanking}\n` +
      `💼 **Head Coach:** ${co.coach}\n` +
      `📈 **Match Record:** ${co.wins} Wins | ${co.draws} Draws | ${co.losses} Losses\n` +
      `⚽ **Goals Count:** ${co.goals}\n\n` +
      `👥 **Key Squad Members:** ${co.currentSquad.join(', ')}\n\n` +
      `🏆 **Major Titles:** ${co.majorTrophies}\n\n` +
      `💡 **Did You Know?** ${co.trivia}`;
  }

  // 4. Live scores queries
  if (query.includes('score') || query.includes('live') || query.includes('results')) {
    const scores = await sportsService.getLiveScores();
    const formattedScores = scores.map(s => 
      `🥅 **${s.home} ${s.homeScore} - ${s.awayScore} ${s.away}** (${s.minute})\n` +
      `   *League:* ${s.league} | *Status:* ${s.status}\n` +
      (s.events.length > 0 ? `   *Timeline:* ${s.events.join(', ')}` : '')
    ).join('\n\n');
    return `🔥 **Live Matchday Scores (IST Timings)** 🔥\n\n${formattedScores}`;
  }

  // 5. Fixtures queries
  if (query.includes('fixture') || query.includes('upcoming') || query.includes('schedule') || query.includes('next match')) {
    const fixtures = await sportsService.getFixtures();
    const formattedFixtures = fixtures.map(f => 
      `📅 **${f.home} vs ${f.away}**\n` +
      `   *Kickoff:* ${f.formattedDate}\n` +
      `   *League:* ${f.league} | *Venue:* ${f.venue}`
    ).join('\n\n');
    return `📅 **Upcoming Match Fixtures (Indian Standard Time)** 📅\n\n${formattedFixtures}`;
  }

  // 6. Standings & League Table queries
  if (query.includes('standing') || query.includes('table') || query.includes('leaderboard')) {
    let key = 'isl';
    if (query.includes('premier') || query.includes('epl')) key = 'premier league';
    if (query.includes('la liga') || query.includes('liga')) key = 'la liga';

    const table = await sportsService.getStandings(key);
    const topScorers = await sportsService.getTopScorers(key);

    const formattedTable = table.map(t => 
      `\`#${t.pos}\` **${t.team}** | P: ${t.played} | W: ${t.wins} | D: ${t.draws} | L: ${t.losses} | **Pts: ${t.points}** (GF: ${t.goalsFor}/GA: ${t.goalsAgainst})`
    ).join('\n');

    const scorersStr = topScorers.map(s => `⚽ **${s.name}** (${s.team}) — **${s.goals} Goals** / ${s.assists} Assists`).join('\n');

    return `🏆 **Standings: ${key.toUpperCase()} Table** 🏆\n\n${formattedTable}\n\n🔥 **Top Goalscorers:**\n${scorersStr}`;
  }

  // 7. Tactical / Formations
  if (query.includes('formation') || query.includes('4-3-3') || query.includes('3-5-2') || query.includes('tactics') || query.includes('gegenpress')) {
    return `🧠 **FootyBot Tactical Corner** 🧠\n\n` +
      `⚽ **Gegenpressing (Counter-Pressing):**\n` +
      `Popularized by Jurgen Klopp. The core tactic relies on pressing the opposition immediately upon losing possession, rather than dropping back into defensive blocks. The goal is to catch opponents when they are transitionally vulnerable and out of shape.\n\n` +
      `📋 **The 4-3-3 Formation:**\n` +
      `A highly balanced attacking structure featuring four defenders, one holding midfielder (pivot), two dynamic box-to-box central midfielders, two explosive wide wingers, and a central striker. Prominently deployed by FC Barcelona and Liverpool to exploit half-spaces and maintain wing width.\n\n` +
      `📋 **The 3-5-2 Formation:**\n` +
      `Relies on solid central backline protection with two highly active wingbacks covering the flanks. It overloads the midfield with a 3-man triangle and partners two central forwards, striking a great balance between solid defence and robust counterattacks. Deployed successfully by Antonio Conte.`;
  }

  // 8. Default fallback welcome
  return `👋 **Hello Football Fan!** I am **FootyBot**, your dedicated AI football assistant.\n\n` +
    `I can answer player stats, team rankings, live scores, IST kickoffs, and transfer costs in Indian Rupees (₹ Crores)!\n\n` +
    `💡 **Try asking me:**\n` +
    `• "Who is Sunil Chhetri?"\n` +
    `• "Compare Lionel Messi and Cristiano Ronaldo stats"\n` +
    `• "Show Indian Super League (ISL) standings"\n` +
    `• "Show live matchday scores"\n` +
    `• "Explain counter-pressing (gegenpressing)"\n\n` +
    `*(Note: Set \`GEMINI_API_KEY\` in your server configuration to enable full conversational AI chats!)*`;
}
