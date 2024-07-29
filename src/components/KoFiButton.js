import React from 'react';

const KoFiButton = () => {
  return (
    <div className="kofi-container">
      <a href='https://ko-fi.com/E1E66FZ96' target='_blank' rel='noopener noreferrer'>
        <img 
          height='42' 
          style={{ border: 0, height: '42px' }} 
          src='https://firebasestorage.googleapis.com/v0/b/education-app-23bb7.appspot.com/o/default_img%2Fdonate.png?alt=media&token=c524da56-20b1-4adb-995e-57ac8eb0e001' 
          border='0' 
          alt='Buy Me a Coffee at ko-fi.com' 
        />
      </a>
    </div>
  );
};

export default KoFiButton;
