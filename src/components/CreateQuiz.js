import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

const CreateQuiz = ({ onBack }) => {
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
    <div>
      <h2>Crear Cuestionario</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Título del cuestionario"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {questions.map((q, qIndex) => (
        <div key={qIndex} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Pregunta {qIndex + 1}</h4>
            {questions.length > 1 && (
              <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ background: 'none', border: 'none' }}>
                <FontAwesomeIcon icon={faTrashAlt} size="lg" color="red" />
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Pregunta"
            value={q.question}
            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
          />
          {q.options.map((option, oIndex) => (
            <div key={oIndex} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <input
                type="text"
                placeholder={`Opción ${oIndex + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <input
                type="radio"
                name={`correctOption${qIndex}`}
                checked={q.correctOption === oIndex}
                onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
              />
              {q.options.length > 2 && (
                <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)} style={{ background: 'none', border: 'none', marginLeft: '10px' }}>
                  <FontAwesomeIcon icon={faTrashAlt} size="lg" color="red" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => handleAddOption(qIndex)} style={{ marginTop: '10px' }}>Añadir Opción</button>
        </div>
      ))}
      <button type="button" onClick={handleAddQuestion}>Añadir Pregunta</button>
      <div style={{ marginTop: '20px' }}>
        <h3>Mensajes de Resultado</h3>
        <input
          type="text"
          placeholder="Menos del 25%"
          value={resultMessages.lessThan25}
          onChange={(e) => setResultMessages({ ...resultMessages, lessThan25: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <input
          type="text"
          placeholder="Entre 25% y 50%"
          value={resultMessages.between25And50}
          onChange={(e) => setResultMessages({ ...resultMessages, between25And50: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <input
          type="text"
          placeholder="Entre 50% y 75%"
          value={resultMessages.between50And75}
          onChange={(e) => setResultMessages({ ...resultMessages, between50And75: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <input
          type="text"
          placeholder="Entre 75% y 100%"
          value={resultMessages.between75And100}
          onChange={(e) => setResultMessages({ ...resultMessages, between75And100: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />
      </div>
      <button type="button" onClick={handleSubmit} style={{ marginTop: '20px' }}>Crear Cuestionario</button>
      <button type="button" onClick={onBack} style={{ marginTop: '10px' }}>Volver</button>
    </div>
  );
};

export default CreateQuiz;
