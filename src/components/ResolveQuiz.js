import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './ResolveQuiz.css';

const ResolveQuiz = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuiz(docSnap.data());
          setAnswers(new Array(docSnap.data().questions.length).fill(null));
        } else {
          setError('No se encontró el cuestionario.');
        }
      } catch (error) {
        setError('Error al cargar el cuestionario.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (oIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = oIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    let correctCount = 0;
    quiz.questions.forEach((q, qIndex) => {
      if (answers[qIndex] === q.correctOption) {
        correctCount += 1;
      }
    });

    const score = (correctCount / quiz.questions.length) * 100;

    if (score < 25) {
      setResult(quiz.resultMessages.lessThan25);
    } else if (score < 50) {
      setResult(quiz.resultMessages.between25And50);
    } else if (score < 75) {
      setResult(quiz.resultMessages.between50And75);
    } else {
      setResult(quiz.resultMessages.between75And100);
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={onBack}>Volver</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {result ? (
        <div className="result">
          <h2>Resultado</h2>
          <p>{result}</p>
          <button onClick={onBack} className="back-button">Volver</button>
        </div>
      ) : (
        <div className="question-container">
          <h2>{quiz.title}</h2>
          <div className={`question ${currentQuestionIndex % 2 === 0 ? 'fade-in' : 'fade-out'}`}>
            <p>{quiz.questions[currentQuestionIndex].question}</p>
            {quiz.questions[currentQuestionIndex].options.map((option, oIndex) => (
              <button
                key={oIndex}
                className="option-button"
                onClick={() => {
                  handleAnswerChange(oIndex);
                  handleNextQuestion();
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolveQuiz;
