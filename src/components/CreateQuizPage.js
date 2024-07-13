import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

const CreateQuizPage = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', ''], correctOption: 0 }]);
  const [resultMessages, setResultMessages] = useState({
    lessThan25: '',
    between25And50: '',
    between50And75: '',
    between75And100: ''
  });
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctOption: 0 }]);
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

  const handleSubmit = async () => {
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
      const docRef = await addDoc(collection(db, 'quizzes'), {
        title,
        questions,
        resultMessages,
        createdAt: new Date(),
        creator: auth.currentUser.uid,
      });

      await updateDoc(doc(db, 'quizzes', docRef.id), { id: docRef.id });

      console.log('Cuestionario creado con ID:', docRef.id);
      onBack();
    } catch (error) {
      console.error('Error al crear el cuestionario:', error);
    }
  };

  return (
    <div className="container">
      <h1>Crear Cuestionario</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group title-group">
        <label htmlFor="title">Título del Test</label>
        <input
          type="text"
          id="title"
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question-container">
          <div className="form-group question-group">
            <label>Pregunta {qIndex + 1}</label>
            <input
              type="text"
              className="question-input"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
              required
            />
            {questions.length > 1 && (
              <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="delete-question">
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            )}
          </div>
          <div className="options-container">
            {q.options.map((option, oIndex) => (
              <div key={oIndex} className="form-group option-group">
                <input
                  type="text"
                  placeholder={`Opción ${oIndex + 1}`}
                  className="option-input"
                  value={option}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  required
                />
                <input
                  type="radio"
                  name={`correctOption-${qIndex}`}
                  checked={q.correctOption === oIndex}
                  onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                />
                {q.options.length > 2 && (
                  <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)} className="delete-icon">
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => handleAddOption(qIndex)} className="add-option-button">Añadir Opción</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddQuestion} className="add-question-button">Añadir Pregunta</button>
      <div className="form-group">
        <label>Mensaje para menos del 25%</label>
        <input
          type="text"
          value={resultMessages.lessThan25}
          onChange={(e) => setResultMessages({ ...resultMessages, lessThan25: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Mensaje para entre el 25% y el 50%</label>
        <input
          type="text"
          value={resultMessages.between25And50}
          onChange={(e) => setResultMessages({ ...resultMessages, between25And50: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Mensaje para entre el 50% y el 75%</label>
        <input
          type="text"
          value={resultMessages.between50And75}
          onChange={(e) => setResultMessages({ ...resultMessages, between50And75: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Mensaje para entre el 75% y el 100%</label>
        <input
          type="text"
          value={resultMessages.between75And100}
          onChange={(e) => setResultMessages({ ...resultMessages, between75And100: e.target.value })}
          required
        />
      </div>
      <button type="button" onClick={handleSubmit} className="submit-button">Crear Cuestionario</button>
      <button type="button" onClick={onBack} className="back-button">Volver</button>
    </div>
  );
};

export default CreateQuizPage;
