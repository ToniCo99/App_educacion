import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/CreateQuiz.css';

const CreateQuizPage = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', ''], correctOption: 0, multiple: false }]);
  const [resultMessages, setResultMessages] = useState({
    lessThan25: '',
    between25And50: '',
    between50And75: '',
    between75And100: ''
  });
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctOption: 0, multiple: false }]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, qIndex) => qIndex !== index));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = questions.slice();
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = questions.slice();
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = questions.slice();
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    if (questions[qIndex].options.length > 2) {
      const newQuestions = questions.slice();
      newQuestions[qIndex].options.splice(oIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const handleCorrectOptionChange = (qIndex, oIndex) => {
    const newQuestions = questions.slice();
    newQuestions[qIndex].correctOption = oIndex;
    setQuestions(newQuestions);
  };

  const handleMultipleChange = (qIndex) => {
    const newQuestions = questions.slice();
    newQuestions[qIndex].multiple = !newQuestions[qIndex].multiple;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    // Validación de campos vacíos
    if (!title.trim()) {
      setError('El título no puede estar vacío.');
      return;
    }

    for (const question of questions) {
      if (!question.question.trim()) {
        setError('Todas las preguntas deben tener un enunciado.');
        return;
      }

      for (const option of question.options) {
        if (!option.trim()) {
          setError('Todas las opciones deben estar completas.');
          return;
        }
      }
    }

    if (!resultMessages.lessThan25.trim() || !resultMessages.between25And50.trim() || !resultMessages.between50And75.trim() || !resultMessages.between75And100.trim()) {
      setError('Todos los mensajes de resultado deben estar completos.');
      return;
    }

    setError(''); // Limpiar el error si pasa la validación

    try {
      // Crear el documento y obtener el ID generado
      await addDoc(collection(db, 'quizzes'), {
        title,
        questions,
        resultMessages,
        createdAt: new Date(),
        creator: auth.currentUser.uid, // Utilizar la UID del usuario actual
      });

      console.log('Cuestionario creado con éxito');
      onBack();
    } catch (error) {
      console.error('Error al crear el cuestionario:', error);
    }
  };

  return (
    <div className="container create-quiz-container">
      <h1>Crear Cuestionario</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label htmlFor="title">Título</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-title"
          required
        />
      </div>
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question-block">
          <div className="question-header">
            <h4>Pregunta {qIndex + 1}</h4>
            {questions.length > 1 && (
              <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="delete-button">
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`question-${qIndex}`}>Pregunta</label>
            <input
              type="text"
              id={`question-${qIndex}`}
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
              className="input-question"
              required
            />
          </div>
          {q.options.map((option, oIndex) => (
            <div key={oIndex} className="option-block">
              <input
                type="text"
                placeholder={`Opción ${oIndex + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                className="input-option"
                required
              />
              <input
                type="radio"
                name={`correctOption-${qIndex}`}
                checked={q.correctOption === oIndex}
                onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                className="radio-button"
              />
              {q.options.length > 2 && (
                <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)} className="delete-button">
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => handleAddOption(qIndex)} className="add-option-button">Añadir Opción</button>
          <div className="form-group multiple-choice-switch">
            <label>Opción múltiple</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={q.multiple}
                onChange={() => handleMultipleChange(qIndex)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddQuestion} className="add-question-button">Añadir Pregunta</button>
      <div className="result-messages">
        <h3>Mensajes de Resultado</h3>
        <div className="form-group">
          <label htmlFor="result-lessThan25">Menos del 25%</label>
          <input
            type="text"
            id="result-lessThan25"
            value={resultMessages.lessThan25}
            onChange={(e) => setResultMessages({ ...resultMessages, lessThan25: e.target.value })}
            className="input-result-message"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="result-between25And50">Entre 25% y 50%</label>
          <input
            type="text"
            id="result-between25And50"
            value={resultMessages.between25And50}
            onChange={(e) => setResultMessages({ ...resultMessages, between25And50: e.target.value })}
            className="input-result-message"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="result-between50And75">Entre 50% y 75%</label>
          <input
            type="text"
            id="result-between50And75"
            value={resultMessages.between50And75}
            onChange={(e) => setResultMessages({ ...resultMessages, between50And75: e.target.value })}
            className="input-result-message"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="result-between75And100">Entre 75% y 100%</label>
          <input
            type="text"
            id="result-between75And100"
            value={resultMessages.between75And100}
            onChange={(e) => setResultMessages({ ...resultMessages, between75And100: e.target.value })}
            className="input-result-message"
            required
          />
        </div>
      </div>
      <div className="button-group">
        <button type="button" className="back-button" onClick={onBack}>Volver</button>
        <button type="button" className="create-quiz-button" onClick={handleSubmit}>Crear Cuestionario</button>
      </div>
    </div>
  );
};

export default CreateQuizPage;
