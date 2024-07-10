// src/errorMessages.js

export const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está en uso. Por favor, utiliza otro correo electrónico.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido. Por favor, introduce un correo electrónico válido.';
      case 'auth/operation-not-allowed':
        return 'La operación no está permitida. Por favor, contacta al administrador.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil. Por favor, introduce una contraseña más fuerte.';
      case 'auth/user-disabled':
        return 'La cuenta ha sido deshabilitada. Por favor, contacta al administrador.';
      case 'auth/user-not-found':
        return 'Usuario no encontrado. Por favor, verifica tu correo electrónico y contraseña.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta. Por favor, intenta de nuevo.';
      default:
        return 'Ocurrió un error. Por favor, intenta de nuevo.';
    }
  };
  