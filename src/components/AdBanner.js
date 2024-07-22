import React, { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.innerHTML = `
      atOptions = {
        'key' : '1f3a364caeb5808a02afe76486f86dcc',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
      document.write('<scr' + 'ipt type="text/javascript" src="https://anddescendedcocoa.com/1f3a364caeb5808a02afe76486f86dcc/invoke.js"></scr' + 'ipt>');
    `;
    const adContainer = document.getElementById('ad-container');
    adContainer.appendChild(adScript);

    adScript.onload = () => {
      console.log('Ad script loaded successfully');
    };

    adScript.onerror = (error) => {
      console.error('Error loading ad script:', error);
    };
  }, []);

  return (
    <div id="ad-container" style={{ textAlign: 'center', margin: '10px 0' }}>
      <p>Loading Ad...</p>
    </div>
  );
};

export default AdBanner;
