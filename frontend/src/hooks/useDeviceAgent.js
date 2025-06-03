import { useState, useEffect } from 'react';

export const useDeviceAgent = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenSize: 'desktop',
    orientation: 'landscape'
  });

  useEffect(() => {
    const getDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Detect device type
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Screen size categories
      let screenSize = 'desktop';
      if (width < 640) screenSize = 'sm';
      else if (width < 768) screenSize = 'md';
      else if (width < 1024) screenSize = 'lg';
      else if (width < 1280) screenSize = 'xl';
      else screenSize = '2xl';
      
      // Orientation
      const orientation = width > height ? 'landscape' : 'portrait';
      
      return {
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        orientation,
        width,
        height,
        userAgent
      };
    };

    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo());
    };

    // Set initial state
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceAgent;
