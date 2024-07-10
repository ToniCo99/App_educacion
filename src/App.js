// src/App.js
import React, { useState } from 'react';
import SignUp from './components/SignUp';
import Login from './components/Login';
import { auth, db } from './firebaseConfig';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { FaSignOutAlt, FaTrashAlt } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      const currentUser = auth.currentUser;
      const userDocRef = doc(db, 'users', currentUser.uid);

      deleteDoc(userDocRef).then(() => {
        deleteUser(currentUser).then(() => {
          setUser(null);
          alert('Tu cuenta ha sido eliminada.');
        }).catch((error) => {
          console.error("Error deleting user:", error);
        });
      }).catch((error) => {
        console.error("Error deleting user document:", error);
      });
    }
  };

  return (
    <div className="main-container">
      {user ? (
        <div>
          <header>
            <h1>¡Hola {user.displayName || user.email}!</h1>
            <div className="icon-container">
              <FaSignOutAlt className="icon" onClick={handleSignOut} title="Cerrar sesión" />
              <FaTrashAlt className="icon" onClick={handleDeleteAccount} title="Eliminar cuenta" />
            </div>
          </header>
          <p>Bienvenido a la aplicación</p>
        </div>
      ) : (
        <div>
          <h1 className="secondary-color">Bienvenido a la App Educativa</h1>
          <SignUp />
          <h1 className="secondary-color">Iniciar Sesión</h1>
          <Login setUser={setUser} />
        </div>
      )}
    </div>
  );
};

export default App;
