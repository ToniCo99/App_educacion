import React, { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    const atOptions = {
      'key': '1f3a364caeb5808a02afe76486f86dcc',
      'format': 'iframe',
      'height': 50,
      'width': 320,
      'params': {}
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.topcreativeformat.com/1f3a364caeb5808a02afe76486f86dcc/invoke.js';
    script.async = true;

    script.onload = () => {
      console.log('Ad script loaded successfully');
    };

    script.onerror = (error) => {
      console.error('Error loading ad script:', error);
    };

    document.getElementById('ad-container').appendChild(script);
  }, []);

  return (
    React.createElement('div', { id: 'ad-container', style: { textAlign: 'center', margin: '10px 0' } },
      React.createElement('p', null, 'Loading ad...')
    )
  );
};

export default AdBanner;
