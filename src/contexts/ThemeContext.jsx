import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    return savedMode ? JSON.parse(savedMode) : false; // Default to light mode
  });
  const [customColor, setCustomColor] = useState(() => {
    const savedColor = localStorage.getItem('customColor');
    return savedColor || '#3B82F6'; // Default to Tailwind's blue-500
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (userData?.customColor) {
      setCustomColor(userData.customColor);
    }
  }, [userData]);

  const changeColor = async (color) => {
    setCustomColor(color);
    localStorage.setItem('customColor', color);
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { customColor: color });
      } catch (error) {
        console.error("Error updating color in Firebase:", error);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, customColor, toggleDarkMode, setCustomColor: changeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};