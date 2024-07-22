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
    script.src = 'https://anddescendedcocoa.com/1f3a364caeb5808a02afe76486f86dcc/invoke.js';
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
