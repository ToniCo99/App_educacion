import React, { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '9888b0aedf6f669c7dfb18958c8e54d6',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
      document.write('<scr' + 'ipt type="text/javascript" src="//www.topcreativeformat.com/9888b0aedf6f669c7dfb18958c8e54d6/invoke.js"></scr' + 'ipt>');
    `;
    document.getElementById('ad-banner').appendChild(script);
  }, []);

  return (
    <div id="ad-banner" style={{ textAlign: 'center', margin: '10px 0' }}>
      <p>Loading Ad...</p>
    </div>
  );
};

export default AdBanner;
