import React, { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    const atOptions = {
      'key': '9888b0aedf6f669c7dfb18958c8e54d6',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.topcreativeformat.com/9888b0aedf6f669c7dfb18958c8e54d6/invoke.js';
    script.async = true;
    document.getElementById('ad-banner').appendChild(script);
  }, []);

  return (
    <div id="ad-banner" style={{ textAlign: 'center', margin: '10px 0' }}>
      <p>Loading Ad...</p>
    </div>
  );
};

export default AdBanner;
