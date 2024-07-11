import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ResolveQuiz = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      console.log("Fetching quiz with ID:", quizId); // Verificar el ID
      try {
        const docRef = doc(db, 'quizzes', quizId);
        console.log('docRef path:', docRef.path); // Verificar el path del documento
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data()); // Verificar los datos del documento
          setQuiz(docSnap.data());
          setAnswers(new Array(docSnap.data().questions.length).fill(null));
          setError(null); // Limpiar errores previos
        } else {
          console.error('No such document!');
          setError('No se encontró el cuestionario.');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Error al cargar el cuestionario.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (qIndex, oIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = oIndex;
    setAnswers(newAnswers);
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
    <div>
      {quiz ? (
        <div>
          <h2>{quiz.title}</h2>
          {quiz.questions.map((q, qIndex) => (
            <div key={qIndex}>
              <p>{q.question}</p>
              {q.options.map((option, oIndex) => (
                <div key={oIndex}>
                  <input
                    type="radio"
                    name={`question${qIndex}`}
                    checked={answers[qIndex] === oIndex}
                    onChange={() => handleAnswerChange(qIndex, oIndex)}
                  />
                  {option}
                </div>
              ))}
            </div>
          ))}
          <button onClick={calculateResult}>Enviar</button>
          <button onClick={onBack}>Volver</button>
          {result && <p>Resultado: {result}</p>}
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default ResolveQuiz;
