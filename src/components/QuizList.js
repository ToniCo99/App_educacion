import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query, limit, doc, getDoc } from 'firebase/firestore';
import '../styles/GeneralStyles.css';

const QuizList = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [creators, setCreators] = useState({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setQuizzes(quizzesData);

        const creatorPromises = quizzesData.map(async quiz => {
          const creatorDoc = await getDoc(doc(db, 'users', quiz.creator));
          if (creatorDoc.exists()) {
            return { [quiz.creator]: creatorDoc.data() };
          }
          return null;
        });

        const creatorData = await Promise.all(creatorPromises);
        const creatorsMap = creatorData.reduce((acc, curr) => {
          if (curr) {
            return { ...acc, ...curr };
          }
          return acc;
        }, {});

        setCreators(creatorsMap);
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
            {creators[quiz.creator] && (
              <>
                <p><em>Creador: {creators[quiz.creator].name}</em></p>
                <img src={creators[quiz.creator].photoURL} alt="Creador" className="creator-icon" />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
