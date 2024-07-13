import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../App.css';

const ResolveQuiz = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      const docRef = doc(db, 'quizzes', quizId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuiz(docSnap.data());
      } else {
        console.error('No such document!');
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleOptionSelect = (optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNextQuestion = () => {
    if (selectedOptions[currentQuestionIndex] !== undefined) {
      const isCorrect = selectedOptions[currentQuestionIndex] === quiz.questions[currentQuestionIndex].correctOption;
      if (isCorrect) {
        setScore(score + 1);
      }
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleFinishQuiz();
      }
    }
  };

  const handleFinishQuiz = () => {
    const totalQuestions = quiz.questions.length;
    const percentageScore = (score / totalQuestions) * 100;
    let message = '';

    if (percentageScore < 25) {
      message = quiz.resultMessages.lessThan25;
    } else if (percentageScore >= 25 && percentageScore < 50) {
      message = quiz.resultMessages.between25And50;
    } else if (percentageScore >= 50 && percentageScore < 75) {
      message = quiz.resultMessages.between50And75;
    } else if (percentageScore >= 75) {
      message = quiz.resultMessages.between75And100;
    }

    setResultMessage(message);
  };

  if (!quiz) {
    return <p>Cargando...</p>;
  }

  if (resultMessage) {
    return (
      <div className="container">
        <h1>Resultado</h1>
        <p>{resultMessage}</p>
        <button onClick={onBack}>Volver al Inicio</button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="container">
      <h1>{quiz.title}</h1>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="question-container">
        <h2>Pregunta {currentQuestionIndex + 1}</h2>
        <p>{currentQuestion.question}</p>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${selectedOptions[currentQuestionIndex] === index ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(index)}
          >
            {option}
          </button>
        ))}
      </div>
      <button onClick={handleNextQuestion}>Siguiente</button>
      <button onClick={onBack}>Volver al Inicio</button>
    </div>
  );
};

export default ResolveQuiz;
