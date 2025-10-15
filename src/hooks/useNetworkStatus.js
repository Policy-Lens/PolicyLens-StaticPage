import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check server connectivity
    const checkServerConnectivity = async () => {
      try {
        const response = await fetch('http://localhost:8002/', {
          method: 'GET',
          mode: 'no-cors', // This will work even with CORS issues
          cache: 'no-cache'
        });
        setIsServerReachable(true);
      } catch (error) {
        setIsServerReachable(false);
      }
    };

    // Check server connectivity every 30 seconds
    checkServerConnectivity();
    const interval = setInterval(checkServerConnectivity, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, isServerReachable };
};
