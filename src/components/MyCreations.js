import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/MyCreations.css';

const MyCreations = ({ userId, onQuizSelect }) => {
  const [creations, setCreations] = useState([]);
  const [notification, setNotification] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  useEffect(() => {
    const fetchCreations = async () => {
      try {
        const q = query(collection(db, 'quizzes'), where('creator', '==', userId));
        const querySnapshot = await getDocs(q);
        setCreations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching creations:', error);
      }
    };

    fetchCreations();
  }, [userId]);

  const handleShare = (quizId) => {
    navigator.clipboard.writeText(quizId).then(() => {
      setNotification('ID Copiada');
      setTimeout(() => setNotification(''), 2000);
    });
  };

  const handleDelete = async () => {
    if (quizToDelete) {
      await deleteDoc(doc(db, 'quizzes', quizToDelete));
      setCreations(creations.filter(quiz => quiz.id !== quizToDelete));
      setQuizToDelete(null);
      setShowConfirm(false);
    }
  };

  const confirmDelete = (quizId) => {
    setQuizToDelete(quizId);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setQuizToDelete(null);
    setShowConfirm(false);
  };

  return (
    <div className="container">
      <h2>Mis Creaciones</h2>
      {notification && <p className="notification">{notification}</p>}
      <ul>
        {creations.map(quiz => (
          <li key={quiz.id} className="card">
            <div onClick={() => onQuizSelect(quiz.id)} className="card-content">
              <h4>{quiz.title}</h4>
            </div>
            <div className="action-buttons">
              <button className="share-button" onClick={() => handleShare(quiz.id)}>
                <FontAwesomeIcon icon={faShareAlt} />
              </button>
              <button className="delete-button" onClick={() => confirmDelete(quiz.id)}>
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {showConfirm && (
        <div className="confirm-dialog">
          <p>¿Estás seguro de que desea eliminar el cuestionario?</p>
          <button className="confirm-button" onClick={handleDelete}>SI</button>
          <button className="cancel-button" onClick={cancelDelete}>NO</button>
        </div>
      )}
    </div>
  );
};

export default MyCreations;
