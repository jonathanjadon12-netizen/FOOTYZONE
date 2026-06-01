const logger = require('./logger');

// High-fidelity football intelligence database
const playersData = {
  'lionel messi': {
    name: 'Lionel Messi',
    age: 38,
    club: 'Inter Miami CF',
    country: 'Argentina',
    position: 'Forward / Playmaker',
    appearances: 1092,
    goals: 843,
    assists: 375,
    yellowCards: 92,
    redCards: 3,
    minutesPlayed: 89400,
    trophies: [
      '1x FIFA World Cup (2022)',
      '2x Copa América (2021, 2024)',
      '10x La Liga (Barcelona)',
      '4x UEFA Champions League (Barcelona)',
      '8x Ballon d\'Or'
    ],
    careerStats: 'One of the greatest players in football history. Spent 17 glorious seasons at FC Barcelona before moving to PSG and later Inter Miami CF. Guided Argentina to World Cup glory in Qatar 2022.',
    marketValue: '€35 Million',
    transferFeeInfo: 'Transferred to PSG on a Free Transfer (2021), salary was €40 Million (≈ ₹360 Crore) per year. Currently signed with Inter Miami with compensation around $60 Million per year (≈ ₹500 Crore).'
  },
  'cristiano ronaldo': {
    name: 'Cristiano Ronaldo',
    age: 41,
    club: 'Al-Nassr FC',
    country: 'Portugal',
    position: 'Forward / Striker',
    appearances: 1220,
    goals: 895,
    assists: 251,
    yellowCards: 124,
    redCards: 11,
    minutesPlayed: 98100,
    trophies: [
      '1x UEFA European Championship (2016)',
      '5x UEFA Champions League (4x Real Madrid, 1x Man Utd)',
      '3x Premier League (Man Utd)',
      '2x La Liga (Real Madrid)',
      '2x Serie A (Juventus)',
      '5x Ballon d\'Or'
    ],
    careerStats: 'All-time leading goal scorer in professional football. Renowned for his supreme athleticism, elite goalscoring records at Manchester United, Real Madrid, Juventus, and Portugal.',
    marketValue: '€15 Million',
    transferFeeInfo: 'Transferred from Real Madrid to Juventus for €117 Million (≈ ₹1,053 Crore) in 2018. Currently earns a record salary of €200 Million (≈ ₹1,800 Crore) per year at Al-Nassr.'
  },
  'erling haaland': {
    name: 'Erling Haaland',
    age: 25,
    club: 'Manchester City FC',
    country: 'Norway',
    position: 'Striker',
    appearances: 312,
    goals: 265,
    assists: 49,
    yellowCards: 18,
    redCards: 0,
    minutesPlayed: 23900,
    trophies: [
      '1x UEFA Champions League (2023)',
      '2x Premier League (2023, 2024)',
      '1x FA Cup (2023)',
      '2x Premier League Golden Boot'
    ],
    careerStats: 'A goalscoring phenom known for his blistering pace, raw strength, and lethal finishing. Smashed the Premier League single-season scoring record with 36 goals in his debut season.',
    marketValue: '€180 Million',
    transferFeeInfo: 'Transferred from Borussia Dortmund to Manchester City for €60 Million release clause (≈ ₹540 Crore) in 2022. Estimated market value is €180 Million (≈ ₹1,620 Crore).'
  },
  'kylian mbappe': {
    name: 'Kylian Mbappé',
    age: 27,
    club: 'Real Madrid CF',
    country: 'France',
    position: 'Forward / Winger',
    appearances: 440,
    goals: 335,
    assists: 155,
    yellowCards: 42,
    redCards: 3,
    minutesPlayed: 34800,
    trophies: [
      '1x FIFA World Cup (2018)',
      '6x Ligue 1 (5x PSG, 1x Monaco)',
      '1x UEFA Nations League (2021)',
      '1x World Cup Golden Boot (2022)'
    ],
    careerStats: 'World Cup winner at age 19. Famous for world-class acceleration, dribbling, and prolific scoring. Scored a historic hat-trick in the 2022 FIFA World Cup Final.',
    marketValue: '€180 Million',
    transferFeeInfo: 'Transferred from Monaco to PSG for €180 Million (≈ ₹1,620 Crore) in 2018. Signed with Real Madrid as a free agent in 2024 with a signing-on bonus of €150 Million (≈ ₹1,350 Crore).'
  },
  'sunil chhetri': {
    name: 'Sunil Chhetri',
    age: 41,
    club: 'Bengaluru FC',
    country: 'India',
    position: 'Striker / Captain Fantastic',
    appearances: 151, // For National Team
    goals: 94,
    assists: 16,
    yellowCards: 12,
    redCards: 0,
    minutesPlayed: 12800,
    trophies: [
      '1x AFC Challenge Cup (2008)',
      '4x SAFF Championship (2011, 2015, 2021, 2023)',
      '2x Nehru Cup (2007, 2009)',
      '1x Indian Super League (BFC - 2019)',
      '7x AIFF Player of the Year'
    ],
    careerStats: 'The absolute icon of modern Indian Football. One of the highest active international goalscorers of all time, standing alongside Cristiano Ronaldo and Lionel Messi. Renowned for his leader qualities and brilliant headers.',
    marketValue: '₹80 Lakh',
    transferFeeInfo: 'Valued at approx ₹80 Lakh to ₹1 Crore. Represents the peak of domestic football salary contracts in the Indian Super League (ISL) history.'
  },
  'gurpreet singh sandhu': {
    name: 'Gurpreet Singh Sandhu',
    age: 34,
    club: 'Bengaluru FC',
    country: 'India',
    position: 'Goalkeeper',
    appearances: 72,
    goals: 0,
    cleanSheets: 28,
    yellowCards: 4,
    redCards: 1,
    minutesPlayed: 6480,
    trophies: [
      '2x SAFF Championship (2015, 2023)',
      '1x Indian Super League (BFC - 2019)',
      '1x Super Cup (2018)',
      'First Indian to play in UEFA Europa League (Stabæk - 2016)'
    ],
    careerStats: 'India\'s undisputed number one goalkeeper. Became the first Indian player to feature in a competitive UEFA Europa League match for Norwegian club Stabæk.',
    marketValue: '₹4.5 Crore',
    transferFeeInfo: 'Current market value is approximately €350,000 (≈ ₹3.1 Crore). One of the highest-earning Indian defensive players.'
  },
  'sandesh jhingan': {
    name: 'Sandesh Jhingan',
    age: 32,
    club: 'FC Goa',
    country: 'India',
    position: 'Centre-Back',
    appearances: 60,
    goals: 5,
    assists: 2,
    yellowCards: 15,
    redCards: 0,
    minutesPlayed: 5400,
    trophies: [
      '1x SAFF Championship (2015)',
      '1x Tri-Nation Series (2023)',
      '1x Intercontinental Cup (2018, 2023)',
      'AIFF Emerging Player of the Year (2014)',
      'Arjuna Award Winner (2020)'
    ],
    careerStats: 'A towering and fearless centre-back, Jhingan is the defensive wall of the Indian National Team. Had successful stints with Kerala Blasters, ATK Mohun Bagan, Bengaluru FC, and Croatian club HNK Šibenik.',
    marketValue: '₹3 Crore',
    transferFeeInfo: 'Valued at €250,000 (≈ ₹2.25 Crore). Famous for robust sliding tackles and high-impact physical aerial dominance.'
  },
  'liston colaco': {
    name: 'Liston Colaco',
    age: 27,
    club: 'Mohun Bagan Super Giant',
    country: 'India',
    position: 'Winger / Left Midfielder',
    appearances: 95,
    goals: 28,
    assists: 21,
    yellowCards: 8,
    redCards: 0,
    minutesPlayed: 7100,
    trophies: [
      '1x Indian Super League Cup (2023)',
      '1x ISL League Shield (2024)',
      '1x Durand Cup (2023)',
      '1x SAFF Championship (2021)'
    ],
    careerStats: 'An incredibly explosive and creative winger known for his mesmerizing long-range stunners, quick dribbling, and dynamic flair on the left wing.',
    marketValue: '₹3.5 Crore',
    transferFeeInfo: 'Transferred from Hyderabad FC to Mohun Bagan for a record domestic fee of ₹1 Crore+ in 2021. Current market value is €300,000 (≈ ₹2.7 Crore).'
  },
  'lallianzuala chhangte': {
    name: 'Lallianzuala Chhangte',
    age: 28,
    club: 'Mumbai City FC',
    country: 'India',
    position: 'Winger / Right Midfielder',
    appearances: 42,
    goals: 8,
    assists: 7,
    yellowCards: 3,
    redCards: 0,
    minutesPlayed: 3200,
    trophies: [
      '1x ISL Cup (2024)',
      '1x ISL League Shield (2023)',
      '1x Tri-Nation Series (2023)',
      '1x Intercontinental Cup (2023)',
      'AIFF Men\'s Player of the Year (2022-23)'
    ],
    careerStats: 'Known as the "Mizo Flash" for his blistering speed. Chhangte is one of the most prolific wingers in the ISL, winning the Hero of the League award for his remarkable 10-goal and 6-assist campaign in 2022-23.',
    marketValue: '₹4 Crore',
    transferFeeInfo: 'Signed a marquee extension with Mumbai City FC, making him one of the highest-paid Indian footballers, earning around ₹1.8 Crore per season.'
  }
};

const clubsData = {
  'real madrid': {
    name: 'Real Madrid CF',
    history: 'Founded in 1902, Real Madrid is officially recognized by FIFA as the Greatest Club of the 20th Century. Renowned for its "Galácticos" transfer policy and supreme dominance in European football.',
    trophies: '15x UEFA Champions League, 36x La Liga, 20x Copa del Rey, 5x FIFA Club World Cup',
    squad: ['Kylian Mbappé', 'Jude Bellingham', 'Vinícius Júnior', 'Rodrygo', 'Federico Valverde', 'Thibaut Courtois', 'Luka Modrić'],
    stadium: 'Santiago Bernabéu (Capacity: 85,000)',
    manager: 'Carlo Ancelotti (Italy)',
    form: 'W-W-D-W-W',
    stats: { wins: 29, draws: 8, losses: 1, goalsScored: 87, goalsConceded: 26 },
    valuation: '€6.07 Billion (≈ ₹54,630 Crore)'
  },
  'fc barcelona': {
    name: 'FC Barcelona',
    history: 'Founded in 1899 by Joan Gamper. Famously represented by their motto "Més que un club" (More than a club). World-renowned for its legendary La Masia academy, possession-oriented "tiki-taka" playstyle, and era of dominance under Pep Guardiola.',
    trophies: '5x UEFA Champions League, 27x La Liga, 31x Copa del Rey, 3x FIFA Club World Cup',
    squad: ['Robert Lewandowski', 'Lamine Yamal', 'Pedri', 'Gavi', 'Frenkie de Jong', 'Marc-André ter Stegen', 'Ronald Araújo'],
    stadium: 'Spotify Camp Nou (Capacity: 99,354)',
    manager: 'Hansi Flick (Germany)',
    form: 'W-W-L-W-W',
    stats: { wins: 26, draws: 7, losses: 5, goalsScored: 79, goalsConceded: 44 },
    valuation: '€5.6 Billion (≈ ₹50,400 Crore)'
  },
  'manchester united': {
    name: 'Manchester United FC',
    history: 'Founded in 1878 as Newton Heath LYR. Rebranded in 1902. Iconic club that enjoyed historic success under Sir Matt Busby and Sir Alex Ferguson, becoming the first English team to win the European Cup and achieving a historic Treble in 1999.',
    trophies: '3x UEFA Champions League, 20x English League Champions, 13x FA Cup, 1x UEFA Europa League',
    squad: ['Bruno Fernandes', 'Marcus Rashford', 'Rasmus Højlund', 'Alejandro Garnacho', 'Kobbie Mainoo', 'André Onana'],
    stadium: 'Old Trafford (Capacity: 74,310)',
    manager: 'Rúben Amorim (Portugal)',
    form: 'D-W-L-W-W',
    stats: { wins: 18, draws: 6, losses: 14, goalsScored: 57, goalsConceded: 58 },
    valuation: '€5.95 Billion (≈ ₹53,550 Crore)'
  },
  'bengaluru fc': {
    name: 'Bengaluru FC (BFC)',
    history: 'Founded in 2013, Bengaluru FC is one of India\'s most successful and professionally run football clubs. They won the I-League in their debut season, reached the AFC Cup Final in 2016 (a historic milestone for Indian football), and won the ISL in 2019.',
    trophies: '1x Indian Super League (2019), 2x I-League (2014, 2016), 2x Federation Cup, 1x Durand Cup (2022), 1x Super Cup (2018)',
    squad: ['Sunil Chhetri', 'Gurpreet Singh Sandhu', 'Naorem Roshan Singh', 'Ryan Williams', 'Suresh Singh Wangjam'],
    stadium: 'Sree Kanteerava Stadium (Capacity: 25,800)',
    manager: 'Gerard Zaragoza (Spain)',
    form: 'W-D-W-L-W',
    stats: { wins: 11, draws: 7, losses: 4, goalsScored: 34, goalsConceded: 21 },
    valuation: '₹40 Crore (approx)'
  },
  'mohun bagan': {
    name: 'Mohun Bagan Super Giant',
    history: 'Established in 1889, Mohun Bagan is one of the oldest and most culturally significant football clubs in Asia. Famous for defeating East Yorkshire Regiment in 1911 to win the IFA Shield, a pivotal moment in Indian history. Merged with ATK in 2020.',
    trophies: '1x ISL Cup (2023), 1x ISL League Shield (2024), 5x National Football League/I-League, 14x Federation Cup, 17x Durand Cup',
    squad: ['Liston Colaco', 'Manvir Singh', 'Jason Cummings', 'Subhasish Bose', 'Dimitri Petratos', 'Anirudh Thapa'],
    stadium: 'Salt Lake Stadium / Vivekananda Yuba Bharati Krirangan (Capacity: 85,000)',
    manager: 'Jose Molina (Spain)',
    form: 'W-W-W-D-L',
    stats: { wins: 15, draws: 3, losses: 4, goalsScored: 47, goalsConceded: 26 },
    valuation: '₹80 Crore (approx)'
  }
};

const countriesData = {
  'india': {
    name: 'India (Blue Tigers)',
    fifaRanking: 121,
    matchesPlayed: 480,
    wins: 172,
    draws: 105,
    losses: 203,
    goals: '624 scored, 742 conceded',
    majorTrophies: '2x Asian Games Gold Medal (1951, 1962), 9x SAFF Championship, 4x Nehru Cup',
    currentSquad: ['Gurpreet Singh Sandhu (GK)', 'Sandesh Jhingan', 'Lallianzuala Chhangte', 'Liston Colaco', 'Anirudh Thapa', 'Brandon Fernandes', 'Manvir Singh'],
    coach: 'Manolo Márquez (Spain)',
    trivia: 'India qualified for the 1950 FIFA World Cup in Brazil but did not participate. They achieved their greatest era in the 1950s-60s under legendary coach Syed Abdul Rahim.'
  },
  'brazil': {
    name: 'Brazil (Seleção)',
    fifaRanking: 5,
    matchesPlayed: 1010,
    wins: 650,
    draws: 205,
    losses: 155,
    goals: '2280 scored, 890 conceded',
    majorTrophies: '5x FIFA World Cup (1958, 1962, 1970, 1994, 2002), 9x Copa América, 4x FIFA Confederations Cup',
    currentSquad: ['Neymar Jr', 'Vinícius Júnior', 'Rodrygo', 'Bruno Guimarães', 'Alisson Becker', 'Marquinhos'],
    coach: 'Dorival Júnior (Brazil)',
    trivia: 'The only nation to participate in every single FIFA World Cup tournament. Celebrated globally for their "Jogo Bonito" (beautiful game) playstyle.'
  },
  'argentina': {
    name: 'Argentina (La Albiceleste)',
    fifaRanking: 1,
    matchesPlayed: 1050,
    wins: 590,
    draws: 250,
    losses: 210,
    goals: '2150 scored, 1020 conceded',
    majorTrophies: '3x FIFA World Cup (1978, 1986, 2022), 16x Copa América, 1x FIFA Confederations Cup, 1x Finalissima (2022)',
    currentSquad: ['Lionel Messi', 'Lautaro Martínez', 'Alexis Mac Allister', 'Rodrigo De Paul', 'Emiliano Martínez', 'Enzo Fernández'],
    coach: 'Lionel Scaloni (Argentina)',
    trivia: 'Guided to glory by legendary figures Diego Maradona in 1986 and Lionel Messi in 2022. Holders of consecutive back-to-back Copa América titles (2021, 2024).'
  }
};

const standingsData = {
  'isl': [
    { pos: 1, team: 'Mohun Bagan SG', played: 22, wins: 15, draws: 3, losses: 4, points: 48, goalsFor: 47, goalsAgainst: 26 },
    { pos: 2, team: 'Mumbai City FC', played: 22, wins: 14, draws: 5, losses: 3, points: 47, goalsFor: 42, goalsAgainst: 19 },
    { pos: 3, team: 'FC Goa', played: 22, wins: 13, draws: 6, losses: 3, points: 45, goalsFor: 39, goalsAgainst: 21 },
    { pos: 4, team: 'Odisha FC', played: 22, wins: 11, draws: 6, losses: 5, points: 39, goalsFor: 35, goalsAgainst: 23 },
    { pos: 5, team: 'Kerala Blasters FC', played: 22, wins: 10, draws: 3, losses: 9, points: 33, goalsFor: 32, goalsAgainst: 31 },
    { pos: 6, team: 'Bengaluru FC', played: 22, wins: 8, draws: 6, losses: 8, points: 30, goalsFor: 26, goalsAgainst: 25 }
  ],
  'premier league': [
    { pos: 1, team: 'Manchester City', played: 38, wins: 28, draws: 7, losses: 3, points: 91, goalsFor: 96, goalsAgainst: 34 },
    { pos: 2, team: 'Arsenal', played: 38, wins: 28, draws: 5, losses: 5, points: 89, goalsFor: 91, goalsAgainst: 29 },
    { pos: 3, team: 'Liverpool', played: 38, wins: 24, draws: 10, losses: 4, points: 82, goalsFor: 86, goalsAgainst: 41 },
    { pos: 4, team: 'Aston Villa', played: 38, wins: 20, draws: 8, losses: 10, points: 68, goalsFor: 76, goalsAgainst: 61 },
    { pos: 5, team: 'Tottenham Hotspur', played: 38, wins: 20, draws: 6, losses: 12, points: 66, goalsFor: 74, goalsAgainst: 61 }
  ],
  'la liga': [
    { pos: 1, team: 'Real Madrid', played: 38, wins: 29, draws: 8, losses: 1, points: 95, goalsFor: 87, goalsAgainst: 26 },
    { pos: 2, team: 'FC Barcelona', played: 38, wins: 26, draws: 7, losses: 5, points: 85, goalsFor: 79, goalsAgainst: 44 },
    { pos: 3, team: 'Girona FC', played: 38, wins: 25, draws: 6, losses: 7, points: 81, goalsFor: 85, goalsAgainst: 46 },
    { pos: 4, team: 'Atlético Madrid', played: 38, wins: 24, draws: 4, losses: 10, points: 76, goalsFor: 70, goalsAgainst: 43 }
  ]
};

const topScorersData = {
  'isl': [
    { name: 'Dimitri Petratos', team: 'Mohun Bagan SG', goals: 10, assists: 7 },
    { name: 'Jason Cummings', team: 'Mohun Bagan SG', goals: 12, assists: 2 },
    { name: 'Lallianzuala Chhangte', team: 'Mumbai City FC', goals: 10, assists: 6 }
  ],
  'premier league': [
    { name: 'Erling Haaland', team: 'Manchester City', goals: 27, assists: 5 },
    { name: 'Cole Palmer', team: 'Chelsea', goals: 22, assists: 11 },
    { name: 'Alexander Isak', team: 'Newcastle United', goals: 21, assists: 2 }
  ],
  'la liga': [
    { name: 'Artem Dovbyk', team: 'Girona FC', goals: 24, assists: 8 },
    { name: 'Alexander Sørloth', team: 'Villarreal CF', goals: 23, assists: 6 },
    { name: 'Robert Lewandowski', team: 'FC Barcelona', goals: 19, assists: 8 }
  ]
};

const liveScoresData = [
  { id: 'live1', home: 'Bengaluru FC', away: 'Kerala Blasters', homeScore: 2, awayScore: 1, minute: '78\'', status: 'Live', league: 'Indian Super League', events: ['Sunil Chhetri 24\' (P)', 'Adrian Luna 41\'', 'Roshan Singh 67\''] },
  { id: 'live2', home: 'Mohun Bagan SG', away: 'FC Goa', homeScore: 0, awayScore: 0, minute: '34\'', status: 'Live', league: 'Indian Super League', events: [] },
  { id: 'live3', home: 'Real Madrid', away: 'FC Barcelona', homeScore: 3, awayScore: 2, minute: '90+3\'', status: 'Finished', league: 'La Liga', events: ['Vinícius Jr 18\'', 'Christensen 6\'', 'Fermín López 69\'', 'Lucas Vázquez 73\'', 'Jude Bellingham 90+1\''] }
];

const upcomingFixturesData = [
  { id: 'fix1', home: 'Mumbai City FC', away: 'East Bengal FC', date: '2026-06-03T19:30:00+05:30', league: 'Indian Super League', venue: 'Mumbai Football Arena, Mumbai' },
  { id: 'fix2', home: 'India', away: 'Kuwait', date: '2026-06-06T19:00:00+05:30', league: 'FIFA World Cup Qualifiers', venue: 'Salt Lake Stadium, Kolkata' },
  { id: 'fix3', home: 'Arsenal', away: 'Chelsea', date: '2026-06-10T23:30:00+05:30', league: 'Premier League', venue: 'Emirates Stadium, London' }
];

// Helper to convert typical Currency to INR Crore / Lakhs
function convertToINR(valueString) {
  if (!valueString) return '';
  const clean = valueString.replace(/[€$£]/g, '').toLowerCase().trim();
  const rawNum = parseFloat(clean);
  if (isNaN(rawNum)) return '';

  if (valueString.includes('Million') || valueString.includes('million') || valueString.includes('m')) {
    const inrValue = Math.round(rawNum * 9); // 1 Million EUR ≈ 9 Crore INR approx
    return `₹${inrValue} Crore (approx)`;
  }
  if (valueString.includes('Billion') || valueString.includes('billion') || valueString.includes('b')) {
    const inrValue = Math.round(rawNum * 9000); // 1 Billion EUR ≈ 9000 Crore INR approx
    return `₹${inrValue} Crore (approx)`;
  }
  return '';
}

// Helper to convert dynamic date to Indian Standard Time (IST) string format
function formatToIST(dateString) {
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' IST';
  } catch (err) {
    return dateString;
  }
}

// Dynamic response compiler
exports.getLiveScores = async () => {
  return liveScoresData;
};

exports.getFixtures = async () => {
  // Format times in IST
  return upcomingFixturesData.map(f => ({
    ...f,
    formattedDate: formatToIST(f.date)
  }));
};

exports.getStandings = async (leagueKey) => {
  const key = leagueKey.toLowerCase().trim();
  return standingsData[key] || standingsData['isl'];
};

exports.getTopScorers = async (leagueKey) => {
  const key = leagueKey.toLowerCase().trim();
  return topScorersData[key] || topScorersData['isl'];
};

exports.findPlayerStats = async (nameQuery) => {
  const query = nameQuery.toLowerCase().trim();
  // Find substring match
  for (const [key, player] of Object.entries(playersData)) {
    if (key.includes(query) || query.includes(key)) {
      const inrValue = convertToINR(player.marketValue);
      return {
        found: true,
        type: 'player',
        data: {
          ...player,
          inrMarketValue: inrValue ? `${player.marketValue} (≈ ${inrValue})` : player.marketValue
        }
      };
    }
  }
  return { found: false };
};

exports.findClubStats = async (clubQuery) => {
  const query = clubQuery.toLowerCase().trim();
  for (const [key, club] of Object.entries(clubsData)) {
    if (key.includes(query) || query.includes(key)) {
      return {
        found: true,
        type: 'club',
        data: club
      };
    }
  }
  return { found: false };
};

exports.findCountryStats = async (countryQuery) => {
  const query = countryQuery.toLowerCase().trim();
  for (const [key, country] of Object.entries(countriesData)) {
    if (key.includes(query) || query.includes(key)) {
      return {
        found: true,
        type: 'country',
        data: country
      };
    }
  }
  return { found: false };
};

exports.getGroundingStatsPrompt = () => {
  return `Use the following official, ground-truth high-fidelity statistics for player, club, and league details to ensure maximum accuracy:
  
PLAYERS:
${Object.values(playersData).map(p => `- ${p.name}: Age: ${p.age}, Club: ${p.club}, Country: ${p.country}, Pos: ${p.position}, Apps: ${p.appearances}, Goals: ${p.goals}, Assists: ${p.assists}, Trophies: ${p.trophies.join('; ')} (Market Value: ${p.marketValue} ≈ ${convertToINR(p.marketValue)})`).join('\n')}

CLUBS:
${Object.values(clubsData).map(c => `- ${c.name}: Manager: ${c.manager}, Stadium: ${c.stadium}, Squad: ${c.squad.join(', ')}, Trophies: ${c.trophies}, Wins/Losses/Draws: ${c.stats.wins}W/${c.stats.losses}L/${c.stats.draws}D, Valuation: ${c.valuation}`).join('\n')}

COUNTRIES:
${Object.values(countriesData).map(co => `- ${co.name}: FIFA Rank: ${co.fifaRanking}, Coach: ${co.coach}, Squad: ${co.currentSquad.join(', ')}, Trophies: ${co.majorTrophies}`).join('\n')}

LIVE SCORES CURRENTLY IN PROGRESS (Always serve match times in IST):
${liveScoresData.map(ls => `- ${ls.home} vs ${ls.away}: ${ls.homeScore}-${ls.awayScore} (${ls.minute}) | League: ${ls.league} | Events: ${ls.events.join(', ')}`).join('\n')}

UPCOMING FIXTURES (Always convert kickoffs to Indian Standard Time IST):
${upcomingFixturesData.map(uf => `- ${uf.home} vs ${uf.away}: Scheduled at ${formatToIST(uf.date)} | League: ${uf.league} | Venue: ${uf.venue}`).join('\n')}

LEAGUE STANDINGS:
- ISL: ${standingsData.isl.map(t => `#${t.pos} ${t.team} - ${t.points}pts`).join(', ')}
- Premier League: ${standingsData['premier league'].map(t => `#${t.pos} ${t.team} - ${t.points}pts`).join(', ')}
- La Liga: ${standingsData['la liga'].map(t => `#${t.pos} ${t.team} - ${t.points}pts`).join(', ')}
`;
};
