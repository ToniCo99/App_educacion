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

    const container = document.getElementById('ad-container');
    if (container) {
      container.appendChild(script);
    }
  }, []);

  return (
    <div id="ad-container" style={{ textAlign: 'center', margin: '10px 0' }}>
      <p>Loading Ad...</p>
    </div>
  );
};

export default AdBanner;
