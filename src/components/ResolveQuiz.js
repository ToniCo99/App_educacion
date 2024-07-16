import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/ResolveQuiz.css';

const ResolveQuiz = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [responses, setResponses] = useState([]);
  const [score, setScore] = useState(null);
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

  const handleOptionChange = (qIndex, oIndex, isMultipleChoice) => {
    const newResponses = responses.slice();
    if (isMultipleChoice) {
      newResponses[qIndex] = newResponses[qIndex] || [];
      if (newResponses[qIndex].includes(oIndex)) {
        newResponses[qIndex] = newResponses[qIndex].filter(index => index !== oIndex);
      } else {
        newResponses[qIndex].push(oIndex);
      }
    } else {
      newResponses[qIndex] = oIndex;
    }
    setResponses(newResponses);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.questions.forEach((question, qIndex) => {
      if (question.isMultipleChoice) {
        const correctOptions = question.correctOption.sort().toString();
        const selectedOptions = responses[qIndex] ? responses[qIndex].sort().toString() : '';
        if (correctOptions === selectedOptions) {
          correctCount++;
        }
      } else if (question.correctOption === responses[qIndex]) {
        correctCount++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const scorePercentage = (correctCount / totalQuestions) * 100;
    setScore(scorePercentage);

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

  return (
    <div className="container resolve-quiz-container">
      <h1>{quiz.title}</h1>
      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex} className="question-block">
          <h4>{q.question}</h4>
          {q.options.map((option, oIndex) => (
            <div key={oIndex} className="option-block">
              <input
                type={q.isMultipleChoice ? "checkbox" : "radio"}
                name={`question-${qIndex}`}
                checked={q.isMultipleChoice ? responses[qIndex]?.includes(oIndex) : responses[qIndex] === oIndex}
                onChange={() => handleOptionChange(qIndex, oIndex, q.isMultipleChoice)}
                className="radio-button"
              />
              <label>{option}</label>
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={handleSubmit} className="submit-button">Enviar</button>
      {score !== null && (
        <div className="result">
          <h3>Resultado: {score.toFixed(2)}%</h3>
          <p>{resultMessage}</p>
        </div>
      )}
      <button type="button" onClick={onBack} className="back-button">Volver</button>
    </div>
  );
};

export default ResolveQuiz;
