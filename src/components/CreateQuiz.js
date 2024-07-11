// src/components/CreateQuiz.js
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const CreateQuiz = ({ user, onBack }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', ''], correctOption: 0 }]);
  const [error, setError] = useState('');
  const [resultMessages, setResultMessages] = useState({
    lessThan25: '',
    between25And50: '',
    between50And75: '',
    between75And100: ''
  });

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctOption: 0 }]);
  };

  const handleAddOption = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].options.push('');
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    if (newQuestions[qIndex].correctOption === oIndex) {
      newQuestions[qIndex].correctOption = 0; // Reset correctOption if the removed option was the correct one
    }
    setQuestions(newQuestions);
  };

  const handleChangeQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleChangeOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleChangeCorrectOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOption = oIndex;
    setQuestions(newQuestions);
  };

  const handleChangeResultMessage = (field, value) => {
    setResultMessages({ ...resultMessages, [field]: value });
  };

  const generateQuizId = () => {
    return Math.random().toString(36).substring(2, 12);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || questions.some(q => !q.question || q.options.some(o => !o))) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const quiz = {
      id: generateQuizId(),
      creator: user.uid,
      title,
      questions,
      resultMessages,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, 'quizzes'), quiz);
      alert('Cuestionario creado exitosamente');
      onBack(); // Volver al menú principal después de crear el cuestionario
    } catch (error) {
      setError('Error al crear el cuestionario. Por favor, intenta de nuevo.');
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Cuestionario</h2>
      {error && <p className="error">{error}</p>}
      <input type="text" placeholder="Título del cuestionario" value={title} onChange={(e) => setTitle(e.target.value)} required />
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question">
          <input
            type="text"
            placeholder={`Pregunta ${qIndex + 1}`}
            value={q.question}
            onChange={(e) => handleChangeQuestion(qIndex, e.target.value)}
            required
          />
          {q.options.map((option, oIndex) => (
            <div key={oIndex} className="option">
              <input
                type="text"
                placeholder={`Opción ${oIndex + 1}`}
                value={option}
                onChange={(e) => handleChangeOption(qIndex, oIndex, e.target.value)}
                required
              />
              <input
                type="radio"
                name={`correctOption${qIndex}`}
                checked={q.correctOption === oIndex}
                onChange={() => handleChangeCorrectOption(qIndex, oIndex)}
              />
              Correcta
              <button 
                type="button" 
                onClick={() => handleRemoveOption(qIndex, oIndex)}
                disabled={q.options.length <= 2}
              >
                Eliminar opción
              </button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddOption(qIndex)}>Añadir opción</button>
        </div>
      ))}
      <div className="result-messages">
        <h3>Mensajes de Resultado</h3>
        <input
          type="text"
          placeholder="Menos del 25%"
          value={resultMessages.lessThan25}
          onChange={(e) => handleChangeResultMessage('lessThan25', e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Entre 25% y 50%"
          value={resultMessages.between25And50}
          onChange={(e) => handleChangeResultMessage('between25And50', e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Entre 50% y 75%"
          value={resultMessages.between50And75}
          onChange={(e) => handleChangeResultMessage('between50And75', e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Entre 75% y 100%"
          value={resultMessages.between75And100}
          onChange={(e) => handleChangeResultMessage('between75And100', e.target.value)}
          required
        />
      </div>
      <button type="button" onClick={handleAddQuestion}>Añadir pregunta</button>
      <button type="submit">Publicar cuestionario</button>
      <button type="button" onClick={onBack}>Volver al menú</button>
    </form>
  );
};

export default CreateQuiz;
