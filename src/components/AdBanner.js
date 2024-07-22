import React, { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    const atOptions = {
      key: '1f3a364caeb5808a02afe76486f86dcc',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {}
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://anddescendedcocoa.com/${atOptions.key}/invoke.js`;

    script.onload = () => {
      console.log('Ad script loaded successfully');
    };

    script.onerror = (error) => {
      console.error('Error loading ad script:', error);
    };

    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
      console.log('Appending ad script to ad-container');
      adContainer.innerHTML = ''; // Clear any previous content
      adContainer.appendChild(script);
    } else {
      console.error('Ad container not found');
    }
  }, []);

  return (
    <div id="ad-container" style={{ textAlign: 'center', margin: '10px 0' }}>
      <p>Loading Ad...</p>
    </div>
  );
};

export default AdBanner;
