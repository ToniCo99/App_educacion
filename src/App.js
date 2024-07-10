// src/App.js
import React, { useState } from 'react';
import SignUp from './components/SignUp';
import Login from './components/Login';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div>
      {user ? (
        <div>
          <header>
            <h1>¡Hola {user.displayName}!</h1>
          </header>
          <p>Bienvenido a la aplicación</p>
        </div>
      ) : (
        <div>
          <h1>Registro</h1>
          <SignUp />
          <h1>Login</h1>
          <Login setUser={setUser} />
        </div>
      )}
    </div>
  );
};

export default App;
