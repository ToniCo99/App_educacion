import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/ResolveQuiz.css';

const ResolveQuiz = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [responses, setResponses] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      const docRef = doc(db, 'quizzes', quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setQuiz(docSnap.data());
        setResponses(new Array(docSnap.data().questions.length).fill(null));
      } else {
        console.log('No such document!');
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionSelect = (oIndex) => {
    if (!isAnswered && responses[currentQuestionIndex] === null) {
      if (quiz.questions[currentQuestionIndex].isMultipleChoice) {
        let newSelectedOptions = [...selectedOptions];
        if (newSelectedOptions.includes(oIndex)) {
          newSelectedOptions = newSelectedOptions.filter(option => option !== oIndex);
        } else {
          newSelectedOptions.push(oIndex);
        }
        setSelectedOptions(newSelectedOptions);
      } else {
        setSelectedOptions([oIndex]);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOptions.length > 0) {
      const newResponses = responses.slice();
      newResponses[currentQuestionIndex] = selectedOptions;
      setResponses(newResponses);

      const currentQuestion = quiz.questions[currentQuestionIndex];
      let isCorrect = false;
      if (currentQuestion.isMultipleChoice) {
        const correctOptions = currentQuestion.correctOption.slice().sort().toString();
        const selectedOptionsSorted = selectedOptions.slice().sort().toString();
        isCorrect = correctOptions === selectedOptionsSorted;
        console.log(`Multiple choice - Correct Options: ${correctOptions}, Selected Options: ${selectedOptionsSorted}`);
      } else {
        isCorrect = currentQuestion.correctOption === selectedOptions[0];
        console.log(`Single choice - Correct Option: ${currentQuestion.correctOption}, Selected Option: ${selectedOptions[0]}`);
      }

      if (isCorrect) {
        setScore(score + 1);
      }

      setIsAnswered(true);
      console.log(`Question ${currentQuestionIndex + 1} - Correct: ${isCorrect}`);

      // Actualiza el estado de la pregunta en el selector
      const questionSelector = document.getElementById(`question-selector-${currentQuestionIndex}`);
      if (questionSelector) {
        questionSelector.classList.add(isCorrect ? 'answered-correct' : 'answered-incorrect');
      }

      // Verifica si todas las preguntas han sido respondidas
      const nextUnansweredQuestion = newResponses.findIndex(response => response === null);
      if (nextUnansweredQuestion === -1) {
        calculateResults();
        setShowResults(true);
      }
    }
  };

  const handleNextQuestion = () => {
    const nextUnansweredQuestion = responses.findIndex(response => response === null);
    if (nextUnansweredQuestion !== -1 && nextUnansweredQuestion < quiz.questions.length) {
      setCurrentQuestionIndex(nextUnansweredQuestion);
    } else if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    setIsAnswered(false);
    setSelectedOptions([]);
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    setIsAnswered(responses[index] !== null);
    setSelectedOptions(responses[index] || []);
  };

  const calculateResults = () => {
    const totalQuestions = quiz.questions.length;
    const scorePercentage = (score / totalQuestions) * 100;

    let message = '';
    if (scorePercentage < 25) {
      message = quiz.resultMessages.lessThan25;
    } else if (scorePercentage < 50) {
      message = quiz.resultMessages.between25And50;
    } else if (scorePercentage < 75) {
      message = quiz.resultMessages.between50And75;
    } else {
      message = quiz.resultMessages.between75And100;
    }

    setResultMessage(message);
  };

  if (!quiz) {
    return <div>Cargando...</div>;
  }

  if (showResults) {
    return (
      <div className="container resolve-quiz-container">
        <h1>{quiz.title}</h1>
        <div className="result">
          <h3>Resultado: {((score / quiz.questions.length) * 100).toFixed(2)}%</h3>
          <p>{resultMessage}</p>
        </div>
        <button type="button" onClick={onBack} className="back-button">Volver</button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container resolve-quiz-container">
      <h1>{quiz.title}</h1>
      <div className="question-block">
        <h4>{currentQuestion.question}</h4>
        {currentQuestion.options.map((option, oIndex) => (
          <div
            key={oIndex}
            className={`option-block ${isAnswered ? 
              (selectedOptions.includes(oIndex) ? 
                (currentQuestion.isMultipleChoice ?
                  (currentQuestion.correctOption.includes(oIndex) ? 'correct' : 'incorrect') : 
                  (currentQuestion.correctOption === selectedOptions[0] ? 'correct' : 'incorrect')) : 
                (currentQuestion.isMultipleChoice ?
                  (currentQuestion.correctOption.includes(oIndex) ? 'correct-border' : '') : 
                  (currentQuestion.correctOption === oIndex ? 'correct-border' : ''))) : 
              (selectedOptions.includes(oIndex) ? 'selected' : '')}`}
            onClick={() => handleOptionSelect(oIndex)}
          >
            {option}
          </div>
        ))}
      </div>
      {isAnswered ? (
        <button type="button" onClick={handleNextQuestion} className="next-button">Continuar</button>
      ) : (
        <button 
          type="button" 
          onClick={handleSubmitAnswer} 
          className="submit-button" 
          disabled={selectedOptions.length === 0}
          style={{ backgroundColor: selectedOptions.length > 0 ? '#6BBF59' : '#ccc' }}
        >
          Responder
        </button>
      )}
      <button type="button" onClick={onBack} className="back-button">Salir</button>
      <div className="question-selector">
        {quiz.questions.map((_, index) => {
          const isCorrect = responses[index] !== null &&
            (quiz.questions[index].isMultipleChoice
              ? responses[index].slice().sort().toString() === quiz.questions[index].correctOption.slice().sort().toString()
              : responses[index][0] === quiz.questions[index].correctOption);
          
          return (
            <button
              key={index}
              id={`question-selector-${index}`}
              className={`question-number ${responses[index] !== null ? (isCorrect ? 'answered-correct' : 'answered-incorrect') : ''}`}
              onClick={() => handleQuestionSelect(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ResolveQuiz;
