import React, { useState } from 'react';
import { auth, db, defaultProfileImageUrl } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import '../styles/App.css';

const SignUp = ({ onSignUpSuccess, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const actionCodeSettings = {
        url: 'http://localhost:3000/verify-email', // Asegúrate de que esta URL sea correcta
        handleCodeInApp: true,
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      console.log('User created with UID:', userCredential.user.uid);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        photoURL: defaultProfileImageUrl, // Asignar la imagen de perfil predeterminada
        quizzes: [], // Añadir el campo quizzes como un array vacío
      });
      console.log('User document added to Firestore');
      auth.signOut(); // Cerrar sesión inmediatamente después de la creación de la cuenta
      onSignUpSuccess();
    } catch (error) {
      console.error('Error during sign up:', error);
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verifica si el usuario ya existe en Firestore
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (!userSnapshot.exists()) {
        // Si el usuario no existe, crea un nuevo documento
        await setDoc(userDoc, {
          name: user.displayName,
          email: user.email,
          photoURL: defaultProfileImageUrl, // Asignar la imagen de perfil predeterminada
          quizzes: [], // Añadir el campo quizzes como un array vacío
        });
      }
      
      onSignUpSuccess();
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      setError(error.message);
    }
  };

  return (
    <div className="container">
      <h1>Registrarse</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="repeatPassword">Repetir Contraseña</label>
          <input
            type="password"
            id="repeatPassword"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />
          {password !== repeatPassword && (
            <p className="error-message">Las contraseñas no coinciden.</p>
          )}
        </div>
        <button type="submit">Registrarse</button>
      </form>
      <button type="button" onClick={onBack}>Volver</button>
      <button type="button" onClick={handleGoogleSignIn} className="google-sign-in-button">
        Registrarse con Google
      </button>
    </div>
  );
};

export default SignUp;
