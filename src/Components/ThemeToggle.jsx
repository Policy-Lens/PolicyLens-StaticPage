import React from 'react';
import { Button } from 'antd';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ size = 'middle', showText = false }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      size={size}
      onClick={toggleTheme}
      icon={isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      className="theme-toggle"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {showText && (isDarkMode ? 'Light' : 'Dark')}
    </Button>
  );
};

export default ThemeToggle;

