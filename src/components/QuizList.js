import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query, limit, doc, getDoc } from 'firebase/firestore';
import '../App.css';

const QuizList = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map(async (docSnapshot) => {
          const quizData = docSnapshot.data();
          const creatorDoc = await getDoc(doc(db, 'users', quizData.creator));
          const creatorData = creatorDoc.exists() ? creatorDoc.data() : { name: 'Desconocido' };
          return { id: docSnapshot.id, ...quizData, creatorName: creatorData.name || 'Desconocido' };
        });
        const resolvedQuizzes = await Promise.all(quizzesData);
        setQuizzes(resolvedQuizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="container">
      <h2>Últimos Cuestionarios Publicados</h2>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id} className="card" onClick={() => onQuizSelect(quiz.id)}>
            <h4>{quiz.title}</h4>
            <p>ID: {quiz.id}</p>
            <em>Creado por: {quiz.creatorName}</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
