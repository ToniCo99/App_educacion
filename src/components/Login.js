import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../App.css';

const Login = ({ onLoginSuccess, onShowSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el documento del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (user.emailVerified) {
          onLoginSuccess();
        } else {
          setError('Por favor, verifica tu correo electrónico antes de iniciar sesión.');
          await sendEmailVerification(user);
          setResendMessage('Se ha reenviado el correo de verificación. Por favor, revisa tu bandeja de entrada.');
          auth.signOut(); // Cerrar sesión si el correo no está verificado
        }
      } else {
        setError('No se encontró el documento del usuario.');
        auth.signOut();
      }
    } catch (error) {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div className="container">
      <h1>Iniciar Sesión</h1>
      {error && <p className="error-message">{error}</p>}
      {resendMessage && <p className="confirmation-message">{resendMessage}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
      <button onClick={onShowSignUp}>Registrarse</button>
    </div>
  );
};

export default Login;
