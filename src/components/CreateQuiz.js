import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './CreateQuiz.css';

const CreateQuiz = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', ''], correctOption: 0 }]);
  const [resultMessages, setResultMessages] = useState({
    lessThan25: '',
    between25And50: '',
    between50And75: '',
    between75And100: ''
  });

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
    try {
      // Crear el documento y obtener el ID generado
      const docRef = await addDoc(collection(db, 'quizzes'), {
        title,
        questions,
        resultMessages,
        createdAt: new Date(),
        creator: 'creator-id-placeholder', // Aquí puedes poner el ID del creador real
      });

      // Actualizar el documento con el ID generado
      await updateDoc(doc(db, 'quizzes', docRef.id), { id: docRef.id });

      console.log('Cuestionario creado con ID:', docRef.id);
      onBack();
    } catch (error) {
      console.error('Error al crear el cuestionario:', error);
    }
  };

  return (
    <div className="create-quiz-container">
      <h2>Crear Cuestionario</h2>
      <input
        type="text"
        placeholder="Título del cuestionario"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-title"
      />
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question-block">
          <div className="question-header">
            <h4>Pregunta {qIndex + 1}</h4>
            {questions.length > 1 && (
              <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="delete-button">
                <FontAwesomeIcon icon={faTrashAlt} size="lg" color="red" />
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Pregunta"
            value={q.question}
            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
            className="input-question"
          />
          {q.options.map((option, oIndex) => (
            <div key={oIndex} className="option-block">
              <input
                type="text"
                placeholder={`Opción ${oIndex + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                className="input-option"
              />
              <input
                type="radio"
                name={`correctOption${qIndex}`}
                checked={q.correctOption === oIndex}
                onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                className="radio-button"
              />
              {q.options.length > 2 && (
                <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)} className="delete-button">
                  <FontAwesomeIcon icon={faTrashAlt} size="lg" color="red" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => handleAddOption(qIndex)} className="add-option-button">Añadir Opción</button>
        </div>
      ))}
      <button type="button" onClick={handleAddQuestion} className="add-question-button">Añadir Pregunta</button>
      <div className="result-messages">
        <h3>Mensajes de Resultado</h3>
        <input
          type="text"
          placeholder="Menos del 25%"
          value={resultMessages.lessThan25}
          onChange={(e) => setResultMessages({ ...resultMessages, lessThan25: e.target.value })}
          className="input-result-message"
        />
        <input
          type="text"
          placeholder="Entre 25% y 50%"
          value={resultMessages.between25And50}
          onChange={(e) => setResultMessages({ ...resultMessages, between25And50: e.target.value })}
          className="input-result-message"
        />
        <input
          type="text"
          placeholder="Entre 50% y 75%"
          value={resultMessages.between50And75}
          onChange={(e) => setResultMessages({ ...resultMessages, between50And75: e.target.value })}
          className="input-result-message"
        />
        <input
          type="text"
          placeholder="Entre 75% y 100%"
          value={resultMessages.between75And100}
          onChange={(e) => setResultMessages({ ...resultMessages, between75And100: e.target.value })}
          className="input-result-message"
        />
      </div>
      <button type="button" onClick={handleSubmit} className="create-quiz-button">Crear Cuestionario</button>
      <button type="button" onClick={onBack} className="back-button">Volver</button>
    </div>
  );
};

export default CreateQuiz;
