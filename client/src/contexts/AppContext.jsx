import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const enrichProfile = (prof) => {
    if (!prof) return null;
    return {
      ...prof,
      isKids: prof.isKids || prof.contentPreference === 'kids'
    };
  };

  const enrichUser = (usr) => {
    if (!usr) return null;
    const enriched = { ...usr };
    if (enriched.profiles) {
      enriched.profiles = enriched.profiles.map(p => enrichProfile(p));
    }
    return enriched;
  };

  // Authentication states
  const [token, setToken] = useState(() => localStorage.getItem('zone_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zone_user');
    return saved ? enrichUser(JSON.parse(saved)) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEmail, setMfaEmail] = useState('');
  const [mfaPassword, setMfaPassword] = useState('');

  // Profile states
  const [activeProfile, setActiveProfile] = useState(() => {
    const saved = localStorage.getItem('zone_active_profile');
    return saved ? enrichProfile(JSON.parse(saved)) : null;
  });

  // Watchlist & History Cache
  const [watchlist, setWatchlist] = useState([]);
  const [catalogFeed, setCatalogFeed] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  // Load common Auth Headers on initialization
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Synchronize dynamic watchlist whenever catalog changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCatalog();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeProfile) {
      fetchRecommendations();
    }
  }, [isAuthenticated, activeProfile]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      const enrichedUser = enrichUser(res.data.data.user);
      setUser(enrichedUser);
      setWatchlist(res.data.data.user.watchlist || []);
      localStorage.setItem('zone_user', JSON.stringify(enrichedUser));
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await axios.get('/api/matches');
      setCatalogFeed(res.data.data);
    } catch (err) {
      console.error('Error fetching catalog feed:', err);
    }
  };



  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`/api/matches/recommendations?profileId=${activeProfile._id}`);
      setAiRecommendations(res.data.data || []);
    } catch (err) {
      console.error('Error loading AI Recommendations:', err);
    }
  };

  const login = async (email, password, mfaCode) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password, mfaCode });
      
      if (res.status === 202 && res.data.status === 'mfa_required') {
        setMfaRequired(true);
        setMfaEmail(email);
        setMfaPassword(password);
        return { success: true, mfa: true };
      }

      const sessionToken = res.data.token;
      const sessionUser = enrichUser(res.data.data.user);

      setToken(sessionToken);
      setUser(sessionUser);
      setWatchlist(sessionUser.watchlist || []);
      setIsAuthenticated(true);
      setMfaRequired(false);

      localStorage.setItem('zone_token', sessionToken);
      localStorage.setItem('zone_user', JSON.stringify(sessionUser));

      return { success: true, mfa: false };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      return { success: false, error: msg };
    }
  };

  const verifyMFA = async (mfaCode) => {
    try {
      const res = await axios.post('/api/auth/login', { email: mfaEmail, password: mfaPassword, mfaCode });
      
      const sessionToken = res.data.token;
      const sessionUser = enrichUser(res.data.data.user);

      setToken(sessionToken);
      setUser(sessionUser);
      setWatchlist(sessionUser.watchlist || []);
      setIsAuthenticated(true);
      setMfaRequired(false);

      localStorage.setItem('zone_token', sessionToken);
      localStorage.setItem('zone_user', JSON.stringify(sessionUser));

      return { success: true, mfa: false };
    } catch (err) {
      const msg = err.response?.data?.message || 'MFA verification failed.';
      return { success: false, message: msg };
    }
  };

  const signup = async (name, email, password, avatar) => {
    try {
      const res = await axios.post('/api/auth/signup', { name, email, password, avatar });
      const sessionToken = res.data.token;
      const sessionUser = enrichUser(res.data.data.user);

      setToken(sessionToken);
      setUser(sessionUser);
      setWatchlist(sessionUser.watchlist || []);
      setIsAuthenticated(true);

      localStorage.setItem('zone_token', sessionToken);
      localStorage.setItem('zone_user', JSON.stringify(sessionUser));

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      // Ignore
    }
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
    setActiveProfile(null);
    setMfaRequired(false);
    setWatchlist([]);

    localStorage.removeItem('zone_token');
    localStorage.removeItem('zone_user');
    localStorage.removeItem('zone_active_profile');
  };

  const addProfile = async (name, avatar, isKids) => {
    try {
      const res = await axios.post('/api/profiles', { name, avatar, isKids });
      const newProf = enrichProfile(res.data.data);
      const updatedUser = { ...user, profiles: [...user.profiles, newProf] };
      setUser(updatedUser);
      localStorage.setItem('zone_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add profile.' };
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      await axios.delete(`/api/profiles/${profileId}`);
      const updatedProfiles = user.profiles.filter(p => p._id !== profileId);
      const updatedUser = { ...user, profiles: updatedProfiles };
      setUser(updatedUser);
      localStorage.setItem('zone_user', JSON.stringify(updatedUser));
      
      if (activeProfile?._id === profileId) {
        setActiveProfile(null);
        localStorage.removeItem('zone_active_profile');
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to remove profile.' };
    }
  };

  const toggleWatchlist = async (movieId) => {
    try {
      const res = await axios.post('/api/profiles/watchlist', { movieId });
      setWatchlist(res.data.data);
      
      // Update local user object
      const updatedUser = { ...user, watchlist: res.data.data };
      setUser(updatedUser);
      localStorage.setItem('zone_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error toggling watchlist:', err);
    }
  };

  const savePlayhead = async (movieId, playhead) => {
    if (!activeProfile) return;
    try {
      await axios.post('/api/profiles/playhead', {
        profileId: activeProfile._id,
        movieId,
        playhead
      });
      
      // Update local active profile watchhistory state
      const existingIdx = activeProfile.watchHistory.findIndex(h => h.movieId === movieId);
      let updatedHistory = [...activeProfile.watchHistory];
      if (existingIdx > -1) {
        updatedHistory[existingIdx] = { ...updatedHistory[existingIdx], playhead, lastWatched: new Date().toISOString() };
      } else {
        updatedHistory.push({ movieId, playhead, lastWatched: new Date().toISOString() });
      }

      const newProfile = { ...activeProfile, watchHistory: updatedHistory };
      setActiveProfile(newProfile);
      localStorage.setItem('zone_active_profile', JSON.stringify(newProfile));
    } catch (err) {
      console.error('Error saving playhead progress:', err);
    }
  };

  const upgradeSubscription = async (plan) => {
    try {
      const res = await axios.post('/api/subscriptions/checkout', { plan });
      const updatedUser = { ...user, subscription: res.data.data.subscription || user.subscription };
      setUser(updatedUser);
      localStorage.setItem('zone_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Transaction failed.' };
    }
  };



  const selectProfile = (prof) => {
    const enriched = enrichProfile(prof);
    setActiveProfile(enriched);
    localStorage.setItem('zone_active_profile', JSON.stringify(enriched));
  };

  return (
    <AppContext.Provider value={{
      token,
      user,
      isAuthenticated,
      mfaRequired,
      setMfaRequired,
      mfaEmail,
      setMfaEmail,
      activeProfile,
      watchlist,
      catalogFeed,
      aiRecommendations,
      login,
      verifyMFA,
      signup,
      logout,
      addProfile,
      deleteProfile,
      selectProfile,
      toggleWatchlist,
      savePlayhead,
      upgradeSubscription,
      fetchCatalog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
