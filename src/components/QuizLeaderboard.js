import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal } from '@fortawesome/free-solid-svg-icons';
import '../styles/QuizLeaderboard.css';

const QuizLeaderboard = ({ quizId, onClose }) => {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const quizRef = doc(db, 'quizzes', quizId);
      const quizSnap = await getDoc(quizRef);
      if (quizSnap.exists()) {
        const quizData = quizSnap.data();
        const userBestScores = quizData.userBestScores || {};
        const userBestTimes = quizData.userBestTimes || {};

        const sortedBestScores = Object.entries(userBestScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        const topUsersData = await Promise.all(
          sortedBestScores.map(async ([uid, score]) => {
            const userDoc = await getDoc(doc(db, 'users', uid));
            const time = userBestTimes[uid] !== undefined ? userBestTimes[uid] : '--:--'; // Default time
            return userDoc.exists() ? { uid, score, time, ...userDoc.data() } : null;
          })
        );

        while (topUsersData.length < 5) {
          topUsersData.push(null);
        }

        setTopUsers(topUsersData);
      }
    };

    fetchLeaderboard();
  }, [quizId]);

  const formatTime = (timeInSeconds) => {
    if (timeInSeconds < 60) {
      return `${Math.floor(timeInSeconds)} sec`;
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec`;
  };

  const truncateName = (name) => {
    if (name.length > 15) {
      return `${name.substring(0, 15)}...`;
    }
    return name;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>Top 5 Resultados</h2>
        <button onClick={onClose}>Cerrar</button>
      </div>
      <ul className="leaderboard-list">
        {topUsers.map((user, index) => (
          <li key={index} className="leaderboard-item">
            {index === 0 && <FontAwesomeIcon icon={faTrophy} className="trophy gold" />}
            {index === 1 && <FontAwesomeIcon icon={faTrophy} className="trophy silver" />}
            {index === 2 && <FontAwesomeIcon icon={faTrophy} className="trophy bronze" />}
            {index > 2 && <FontAwesomeIcon icon={faMedal} className="medal" />}
            {user ? (
              <>
                <img src={user.photoURL} alt="User" className="user-icon" />
                <p>{truncateName(user.name)}</p>
                <p className="user-score">{user.score.toFixed(2)}%</p>
                <p className="user-time">{typeof user.time === 'number' ? formatTime(user.time) : user.time}</p> {/* Mostrar el tiempo del usuario */}
              </>
            ) : (
              <>
                <img src="https://firebasestorage.googleapis.com/v0/b/education-app-23bb7.appspot.com/o/default_img%2Fdefault.png?alt=media&token=aebeee37-9f53-453b-aeff-be191384902a" alt="Default User" className="user-icon" />
                <p>Vacante</p>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizLeaderboard;
