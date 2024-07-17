import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/MyQuizzesPage.css';

const MyQuizzesPage = ({ onBack, userId, onQuizSelect }) => {
  const [quizId, setQuizId] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserQuizzes();
  }, []);

  const fetchUserQuizzes = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists() && userDoc.data().quizzes) {
        const quizPromises = userDoc.data().quizzes.map((quizId) =>
          getDoc(doc(db, 'quizzes', quizId))
        );
        const quizDocs = await Promise.all(quizPromises);
        setQuizzes(quizDocs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error('Error fetching user quizzes:', error);
    }
  };

  const handleAddQuiz = async () => {
    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (quizDoc.exists()) {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        const userQuizzes = userDoc.data().quizzes || [];

        if (!userQuizzes.includes(quizId)) {
          await updateDoc(userDocRef, {
            quizzes: arrayUnion(quizId),
          });
          setQuizzes([...quizzes, { id: quizId, ...quizDoc.data() }]);
          setQuizId('');
          setError('');
        } else {
          setError('Este cuestionario ya ha sido agregado.');
        }
      } else {
        setError('Quiz ID no encontrado.');
      }
    } catch (error) {
      console.error('Error adding quiz:', error);
      setError('Error al agregar el quiz.');
    }
  };

  const handleRemoveQuiz = async (quizIdToRemove) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        quizzes: arrayRemove(quizIdToRemove),
      });
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizIdToRemove));
    } catch (error) {
      console.error('Error removing quiz:', error);
      setError('Error al eliminar el quiz.');
    }
  };

  return (
    <div className="container">
      <h2>Mis Cuestionarios</h2>
      <div className="form-group">
        <label htmlFor="quizId">Agregar Cuestionario por ID</label>
        <input
          type="text"
          id="quizId"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          placeholder="Ingrese el ID del cuestionario"
        />
        <button onClick={handleAddQuiz} className="add-quiz-button">Agregar Cuestionario</button>
        {error && <p className="error-message">{error}</p>}
      </div>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="card">
            <div className="quiz-info" onClick={() => onQuizSelect(quiz.id)}>
              <h4>{quiz.title}</h4>
              <p>Creado por: <i>{quiz.creator}</i></p>
            </div>
            <button className="delete-quiz-button" onClick={() => handleRemoveQuiz(quiz.id)}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onBack} className="back-button">Volver</button>
    </div>
  );
};

export default MyQuizzesPage;
