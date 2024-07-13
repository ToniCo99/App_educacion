import React from 'react';
import CreateQuiz from './CreateQuiz';
import '../App.css';

const CreateQuizPage = ({ onBack }) => {
  return (
    <div className="container">
      <button onClick={onBack} className="back-button">Volver</button>
      <CreateQuiz onBack={onBack} />
    </div>
  );
};

export default CreateQuizPage;
