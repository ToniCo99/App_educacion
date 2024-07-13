import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import QuizList from './components/QuizList';
import CreateQuiz from './components/CreateQuiz';
import ResolveQuiz from './components/ResolveQuiz';
import { auth, db } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserId(userDoc.data().id);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleLoginSuccess = () => {
    setUser(auth.currentUser);
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    setUser(auth.currentUser);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserId('');
  };

  const handleQuizSelect = (quizId) => {
    setSelectedQuizId(quizId);
  };

  const handleBack = () => {
    setSelectedQuizId(null);
  };

  if (!user) {
    return showSignUp ? (
      <SignUp onSignUpSuccess={handleSignUpSuccess} onBack={() => setShowSignUp(false)} />
    ) : (
      <Login onLoginSuccess={handleLoginSuccess} onShowSignUp={() => setShowSignUp(true)} />
    );
  }

  if (selectedQuizId) {
    return <ResolveQuiz quizId={selectedQuizId} onBack={handleBack} />;
  }

  return (
    <div className="container">
      <div className="header">
        <span className="user-id">ID: {userId}</span>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <QuizList onQuizSelect={handleQuizSelect} />
      <CreateQuiz onBack={handleBack} />
    </div>
  );
};

export default App;
