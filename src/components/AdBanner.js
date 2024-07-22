// AdBanner.js
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
    document.getElementById('ad-container').appendChild(script);
  }, []);

  return (
    <div id="ad-container" style={{ textAlign: 'center', margin: '10px 0' }}>
      {/* This div will contain the ad script */}
    </div>
  );
};

export default AdBanner;
