import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Estudiante');
  const [error, setError] = useState('');

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    const id = generateId();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        id,
      });
      alert('Registro exitoso! Por favor verifica tu correo.');
    } catch (error) {
      console.error("Error signing up:", error);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Estudiante">Estudiante</option>
        <option value="Profesor">Profesor</option>
      </select>
      <button type="submit">Registrarse</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default SignUp;
