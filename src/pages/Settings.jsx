import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { isDarkMode, toggleDarkMode, customColor, setCustomColor } = useTheme();

  const handleColorChange = (e) => {
    setCustomColor(e.target.value);
  };

  return (
    <div className="p-4 pl-20 text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            Dark Mode
          </span>
        </label>
      </div>

      <div className="mb-4">
        <label htmlFor="color-picker" className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
          Custom Chat Color
        </label>
        <input
          type="color"
          id="color-picker"
          value={customColor}
          onChange={handleColorChange}
          className="w-16 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
    </div>
  );
}