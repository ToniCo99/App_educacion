import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../App.css';

const ResolveQuiz = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const docRef = doc(db, 'quizzes', quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setQuiz(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionClick = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === quiz.questions[currentQuestionIndex].correctOption) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      calculateResult(score + (selectedOption === quiz.questions[currentQuestionIndex].correctOption ? 1 : 0));
    }
  };

  const calculateResult = (finalScore) => {
    const percentage = (finalScore / quiz.questions.length) * 100;
    let resultMessage = '';

    if (percentage < 25) {
      resultMessage = quiz.resultMessages.lessThan25;
    } else if (percentage >= 25 && percentage < 50) {
      resultMessage = quiz.resultMessages.between25And50;
    } else if (percentage >= 50 && percentage < 75) {
      resultMessage = quiz.resultMessages.between50And75;
    } else if (percentage >= 75 && percentage <= 100) {
      resultMessage = quiz.resultMessages.between75And100;
    }

    setResult(`${resultMessage} (Nota: ${percentage.toFixed(2)}%)`);
  };

  if (!quiz) {
    return <div>Cargando...</div>;
  }

  if (result) {
    return (
      <div className="container">
        <h1>Resultado</h1>
        <p>{result}</p>
        <button onClick={onBack}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{quiz.title}</h1>
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${(currentQuestionIndex / quiz.questions.length) * 100}%` }}
        />
      </div>
      <div className="question-container">
        <h2>Pregunta {currentQuestionIndex + 1}</h2>
        <p>{quiz.questions[currentQuestionIndex].question}</p>
        {quiz.questions[currentQuestionIndex].options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${selectedOption === index ? 'selected' : ''}`}
            onClick={() => handleOptionClick(index)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="navigation-buttons">
        <button onClick={onBack} style={{ backgroundColor: 'red', color: '#FFFFFF' }}>
          Salir
        </button>
        <button onClick={handleNextQuestion} disabled={selectedOption === null}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ResolveQuiz;
