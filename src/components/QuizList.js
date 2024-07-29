import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, orderBy, query, limit, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faHeart } from '@fortawesome/free-solid-svg-icons';
import '../styles/QuizList.css';

const QuizList = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [creators, setCreators] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState(null);
  const [userFavorites, setUserFavorites] = useState([]);

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

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim() === '') {
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

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const fetchUserId = () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        fetchUserFavorites(user.uid);
      }
    };

    const fetchUserFavorites = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setUserFavorites(userDoc.data().quizzes || []);
        }
      } catch (error) {
        console.error('Error fetching user favorites:', error);
      }
    };

    fetchUserId();
  }, []);

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const handleLike = async (quizId) => {
    if (!userId) return;

    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);

    if (quizSnap.exists()) {
      const quizData = quizSnap.data();
      const likes = quizData.likes || [];

      if (!likes.includes(userId)) {
        await updateDoc(quizRef, {
          likes: arrayUnion(userId),
        });

        setQuizzes(prevQuizzes =>
          prevQuizzes.map(quiz =>
            quiz.id === quizId
              ? { ...quiz, likes: [...likes, userId] }
              : quiz
          )
        );
      }
    }
  };

  const handleFavorite = async (quizId) => {
    if (!userId) return;

    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);

    if (quizSnap.exists()) {
      const favorites = quizSnap.data().favorites || [];

      if (!favorites.includes(userId)) {
        await updateDoc(quizRef, {
          favorites: arrayUnion(userId),
        });

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          quizzes: arrayUnion(quizId),
        });

        setUserFavorites(prevFavorites => [...prevFavorites, quizId]);
        setQuizzes(prevQuizzes =>
          prevQuizzes.map(quiz =>
            quiz.id === quizId
              ? { ...quiz, favorites: [...favorites, userId] }
              : quiz
          )
        );
      } else {
        await updateDoc(quizRef, {
          favorites: arrayRemove(userId),
        });

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          quizzes: arrayRemove(quizId),
        });

        setUserFavorites(prevFavorites => prevFavorites.filter(id => id !== quizId));
        setQuizzes(prevQuizzes =>
          prevQuizzes.map(quiz =>
            quiz.id === quizId
              ? { ...quiz, favorites: favorites.filter(id => id !== userId) }
              : quiz
          )
        );
      }
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
          className="search-input"
        />
      </div>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id} className="card" onClick={() => onQuizSelect(quiz.id)}>
            <div className="quiz-info">
              <h4>{quiz.title}</h4>
              {creators[quiz.creator] && (
                <>
                  <p><em>Creador: {creators[quiz.creator].name}</em></p>
                  <img src={creators[quiz.creator].photoURL} alt="Creador" className="creator-icon" />
                </>
              )}
            </div>
            <div className="icons-container" onClick={(e) => e.stopPropagation()}>
              <div className="icon-wrapper" onClick={() => handleLike(quiz.id)}>
                <FontAwesomeIcon
                  icon={faThumbsUp}
                  className={quiz.likes && quiz.likes.includes(userId) ? 'icon liked' : 'icon not-liked'}
                />
                <span>{quiz.likes ? quiz.likes.length : 0}</span>
              </div>
              <div className="icon-wrapper" onClick={() => handleFavorite(quiz.id)}>
                <FontAwesomeIcon
                  icon={faHeart}
                  className={userFavorites.includes(quiz.id) ? 'icon favorited' : 'icon not-favorited'}
                />
                <span>{quiz.favorites ? quiz.favorites.length : 0}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
