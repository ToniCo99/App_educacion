import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import SignUp from './components/SignUp';
import QuizList from './components/QuizList';
import CreateQuizPage from './components/CreateQuizPage';
import ResolveQuiz from './components/ResolveQuiz';
import EditProfilePage from './components/EditProfilePage';
import MyQuizzesPage from './components/MyQuizzesPage';
import MyCreations from './components/MyCreations';
import './styles/GeneralStyles.css';
import './styles/HeaderStyles.css';
import './styles/App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhotoURL, setUserPhotoURL] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserId(auth.currentUser.uid);
        setUserName(userDoc.data().name);
        setUserPhotoURL(userDoc.data().photoURL || '');
      }
    }
  };

  const handleLoginSuccess = () => {
    setUser(auth.currentUser);
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    setConfirmationMessage('Tu cuenta ha sido creada correctamente. Por favor, confirma tu correo electrónico.');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserId('');
    setUserName('');
    setUserPhotoURL('');
  };

  const handleQuizSelect = (quizId) => {
    setSelectedQuizId(quizId);
  };

  const handleBack = () => {
    setSelectedQuizId(null);
    setShowCreateQuiz(false);
    setShowEditProfile(false);
    setShowMyQuizzes(false);
  };

  if (!user) {
    return showSignUp ? (
      <SignUp onSignUpSuccess={handleSignUpSuccess} onBack={() => setShowSignUp(false)} />
    ) : (
      <div className="container">
        {confirmationMessage && <p className="confirmation-message">{confirmationMessage}</p>}
        <Login onLoginSuccess={handleLoginSuccess} onShowSignUp={() => setShowSignUp(true)} />
      </div>
    );
  }

  if (selectedQuizId) {
    return <ResolveQuiz quizId={selectedQuizId} onBack={handleBack} />;
  }

  if (showCreateQuiz) {
    return <CreateQuizPage onBack={handleBack} />;
  }

  if (showEditProfile) {
    return <EditProfilePage onBack={handleBack} onProfileUpdate={fetchUserData} />;
  }

  if (showMyQuizzes) {
    return <MyQuizzesPage onBack={handleBack} userId={userId} onQuizSelect={handleQuizSelect} />;
  }

  return (
    <div className="container">
      <div className="header">
        <span className="user-id">ID: {userId}</span>
        <img
          src={userPhotoURL}
          alt="Perfil"
          className="profile-icon"
          onClick={() => setShowEditProfile(true)}
        />
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <h2>¡Bienvenido, {userName}!</h2>
      <QuizList onQuizSelect={handleQuizSelect} />
      <MyCreations userId={userId} onQuizSelect={handleQuizSelect} /> {/* Incluye el componente aquí */}
      <button onClick={() => setShowCreateQuiz(true)} className="create-quiz-button">Crear Cuestionario</button>
      <button onClick={() => setShowMyQuizzes(true)} className="my-quizzes-button">Mis Cuestionarios</button>
    </div>
  );
};

export default App;
