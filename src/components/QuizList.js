import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query, limit, doc, getDoc, where } from 'firebase/firestore';
import '../styles/QuizList.css';


const QuizList = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [creators, setCreators] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'), limit(5));
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

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      return;
    }

    const normalizedSearchTerm = normalizeText(searchTerm);

    try {
      const q = query(collection(db, 'quizzes'), orderBy('title'));
      const querySnapshot = await getDocs(q);
      const searchResults = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(quiz => normalizeText(quiz.title).includes(normalizedSearchTerm));

      setQuizzes(searchResults);

      const creatorPromises = searchResults.map(async quiz => {
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
      console.error('Error searching quizzes:', error);
    }
  };

  return (
    <div className="container">
      <h2>Últimos Cuestionarios Publicados</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar cuestionario"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Buscar</button>
      </div>
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
