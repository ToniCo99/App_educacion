import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';

const QuizList = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched quizzes:', quizzesData); // Verificar los IDs
        setQuizzes(quizzesData);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div>
      <h2>Últimos Cuestionarios Publicados</h2>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id} onClick={() => {
            console.log('Selected quiz ID:', quiz.id); // Log para verificar el ID seleccionado
            onQuizSelect(quiz.id);
          }}>
            {quiz.title} (ID: {quiz.id})  {/* Mostrar el ID para depuración */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
