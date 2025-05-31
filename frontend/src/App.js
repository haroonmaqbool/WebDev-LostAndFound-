import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from './services/api';
import './App.css';

// Import all components
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostLostPage from './pages/PostLostPage';
import PostFoundPage from './pages/PostFoundPage';
import BrowseLostPage from './pages/BrowseLostPage';
import BrowseFoundPage from './pages/BrowseFoundPage';
import ItemDetailPage from './pages/ItemDetailPage';
import DashboardPage from './pages/DashboardPage';

// User context
const UserContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await api.getItems();
        setItems(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items');
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Auto-login for demo purposes
  useEffect(() => {
    const demoUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@umt.edu',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };
    setUser(demoUser);
  }, []);

  const addItem = async (newItem) => {
    try {
      const item = {
        ...newItem,
        date: new Date().toISOString().split('T')[0],
        status: 'active',
        contact: user?.email || 'user@umt.edu'
      };
      const createdItem = await api.createItem(item);
      setItems([createdItem, ...items]);
      return createdItem.id;
    } catch (err) {
      console.error('Failed to create item:', err);
      throw err;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, items, setItems, addItem }}>
      <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Router>
          <Header />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
              <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
              <Route path="/post-lost" element={user ? <PostLostPage /> : <Navigate to="/login" />} />
              <Route path="/post-found" element={user ? <PostFoundPage /> : <Navigate to="/login" />} />
              <Route path="/lost-items" element={<BrowseLostPage />} />
              <Route path="/found-items" element={<BrowseFoundPage />} />
              <Route path="/item/:id" element={<ItemDetailPage />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </div>
    </UserContext.Provider>
  );
}

export { UserContext };
export default App;