// src/components/SignUp.js
import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Estudiante');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
      });
      alert('Registration successful! Please verify your email.');
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Estudiante">Estudiante</option>
        <option value="Alumno">Alumno</option>
      </select>
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default SignUp;
