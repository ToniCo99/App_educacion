const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Importa la configuración de Firebase desde firebaseConfig.js
const { db } = require('./firebaseConfig');

// Función para subir el quiz
async function uploadQuiz() {
  // Lee el archivo JSON
  const quizData = JSON.parse(fs.readFileSync(path.join(__dirname, 'plantilla.json'), 'utf8'));

  try {
    // Añade el documento a la colección 'quizzes'
    const docRef = await db.collection('quizzes').add(quizData);
    console.log('Quiz added with ID:', docRef.id);
  } catch (error) {
    console.error('Error adding quiz:', error);
  }
}

// Ejecuta la función para subir el quiz
uploadQuiz();
