import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/App.css';


const SignUp = ({ onSignUpSuccess, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
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
        emailVerified: false,
      });
      console.log('User document added to Firestore');
      auth.signOut(); // Cerrar sesión inmediatamente después de la creación de la cuenta
      onSignUpSuccess();
    } catch (error) {
      console.error('Error during sign up:', error);
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
        <button type="submit">Registrarse</button>
      </form>
      <button type="button" onClick={onBack}>Volver</button>
    </div>
  );
};

export default SignUp;
