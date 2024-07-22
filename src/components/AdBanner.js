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

    const scriptContent = `
      atOptions = {
        'key': '${atOptions.key}',
        'format': '${atOptions.format}',
        'height': ${atOptions.height},
        'width': ${atOptions.width},
        'params': {}
      };
      (function() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://anddescendedcocoa.com/1f3a364caeb5808a02afe76486f86dcc/invoke.js';
        script.async = true;
        document.getElementById('ad-container').appendChild(script);
      })();
    `;

    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.innerHTML = scriptContent;
    document.getElementById('ad-container').appendChild(scriptElement);
  }, []);

  return (
    <div id="ad-container" style={{ textAlign: 'center', margin: '10px 0' }}>
      <p>Loading Ad...</p>
    </div>
  );
};

export default AdBanner;
