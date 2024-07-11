import React, { useState } from 'react';
import SignUp from './components/SignUp';
import Login from './components/Login';
import './App.css';
import { auth, db } from './firebaseConfig';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { FaSignOutAlt, FaTrashAlt } from 'react-icons/fa';
import CreateQuiz from './components/CreateQuiz';
import QuizList from './components/QuizList';
import ResolveQuiz from './components/ResolveQuiz';

const App = () => {
  const [user, setUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showQuizList, setShowQuizList] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setShowCreateQuiz(false);
        setShowQuizList(false);
        setSelectedQuizId(null);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      try {
        const currentUser = auth.currentUser;
        const userDocRef = doc(db, 'users', currentUser.uid);

        await deleteDoc(userDocRef);
        await deleteUser(currentUser);
        setUser(null);
        alert('Tu cuenta ha sido eliminada.');
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const fetchUserData = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUser({ ...user, ...userDoc.data() });
      } else {
        console.error('No se encontraron datos de usuario.');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleQuizSelect = (quizId) => {
    setSelectedQuizId(quizId);
    setShowQuizList(false); // Hide the quiz list when a quiz is selected
  };

  return (
    <div className="main-container">
      {user ? (
        <div>
          <header>
            <div className="user-info">
              <p>ID: {user.id}</p>
            </div>
            <h1>¡Hola {user.displayName || user.email}!</h1>
            <div className="icon-container">
              <FaSignOutAlt className="icon" onClick={handleSignOut} title="Cerrar sesión" />
              <FaTrashAlt className="icon" onClick={handleDeleteAccount} title="Eliminar cuenta" />
            </div>
            <button onClick={() => { setShowCreateQuiz(!showCreateQuiz); setShowQuizList(false); setSelectedQuizId(null); }}>Crear cuestionario</button>
            <button onClick={() => { setShowQuizList(!showQuizList); setShowCreateQuiz(false); setSelectedQuizId(null); }}>Ver cuestionarios</button>
          </header>
          {showCreateQuiz ? (
            <CreateQuiz user={user} onBack={() => setShowCreateQuiz(false)} />
          ) : selectedQuizId ? (
            <ResolveQuiz quizId={selectedQuizId} onBack={() => setSelectedQuizId(null)} />
          ) : showQuizList ? (
            <QuizList onQuizSelect={handleQuizSelect} />
          ) : (
            <p>Bienvenido a la aplicación</p>
          )}
        </div>
      ) : (
        <div>
          <h1 className="secondary-color">Bienvenido a la App Educativa</h1>
          {!showSignUp ? (
            <>
              <Login setUser={fetchUserData} />
              <button onClick={() => setShowSignUp(true)}>Registrarse</button>
            </>
          ) : (
            <>
              <SignUp />
              <button onClick={() => setShowSignUp(false)}>Cancelar</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
