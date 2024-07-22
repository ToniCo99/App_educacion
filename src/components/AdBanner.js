import React from 'react';

const AdBanner = () => {
  const adSrc = `https://anddescendedcocoa.com/1f3a364caeb5808a02afe76486f86dcc/invoke.js`;

  return (
    <div style={{ textAlign: 'center', margin: '10px 0' }}>
      <iframe
        src={adSrc}
        width="320"
        height="50"
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
        title="Ad"
      ></iframe>
    </div>
  );
};

export default AdBanner;
