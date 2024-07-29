import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faHeart } from '@fortawesome/free-solid-svg-icons';
import '../styles/ResolveQuiz.css';
import KoFiButton from './KoFiButton';

const ResolveQuiz = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [responses, setResponses] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [resultMessage, setResultMessage] = useState('');
  const [reviewAnswers, setReviewAnswers] = useState(false);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        console.error('quizId is undefined');
        return;
      }
      const docRef = doc(db, 'quizzes', quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setQuiz(docSnap.data());
        setResponses(new Array(docSnap.data().questions.length).fill(null));
      } else {
        console.log('No such document!');
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    const checkUserInteractions = async () => {
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      if (!userId) {
        console.error('userId is undefined');
        return;
      }

      const quizRef = doc(db, 'quizzes', quizId);
      const quizSnap = await getDoc(quizRef);
      if (quizSnap.exists()) {
        const quizData = quizSnap.data();
        const likes = quizData.likes || [];
        const favorites = quizData.favorites || [];

        setLiked(likes.includes(userId));
        setFavorited(favorites.includes(userId));
      }
    };

    checkUserInteractions();
  }, [quizId]);

  const handleOptionSelect = (oIndex) => {
    if (!isAnswered && responses[currentQuestionIndex] === null) {
      if (quiz.questions[currentQuestionIndex].isMultipleChoice) {
        let newSelectedOptions = [...selectedOptions];
        if (newSelectedOptions.includes(oIndex)) {
          newSelectedOptions = newSelectedOptions.filter(option => option !== oIndex);
        } else {
          newSelectedOptions.push(oIndex);
        }
        setSelectedOptions(newSelectedOptions);
      } else {
        setSelectedOptions([oIndex]);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOptions.length > 0) {
      const newResponses = responses.slice();
      newResponses[currentQuestionIndex] = selectedOptions;
      setResponses(newResponses);

      const currentQuestion = quiz.questions[currentQuestionIndex];
      let isCorrect = false;
      if (currentQuestion.isMultipleChoice) {
        const correctOptions = currentQuestion.correctOption.slice().sort().toString();
        const selectedOptionsSorted = selectedOptions.slice().sort().toString();
        isCorrect = correctOptions === selectedOptionsSorted;
      } else {
        isCorrect = currentQuestion.correctOption === selectedOptions[0];
      }

      if (isCorrect) {
        setScore(prevScore => prevScore + 1);
      }

      setIsAnswered(true);

      const questionSelector = document.getElementById(`question-selector-${currentQuestionIndex}`);
      if (questionSelector) {
        questionSelector.classList.add(isCorrect ? 'answered-correct' : 'answered-incorrect');
      }

      const nextUnansweredQuestion = newResponses.findIndex(response => response === null);
      if (nextUnansweredQuestion === -1) {
        calculateResults(newResponses);
        setShowResults(true);
      }
    }
  };

  const handleNextQuestion = () => {
    const nextUnansweredQuestion = responses.findIndex(response => response === null);
    if (nextUnansweredQuestion !== -1 && nextUnansweredQuestion < quiz.questions.length) {
      setCurrentQuestionIndex(nextUnansweredQuestion);
    } else if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    setIsAnswered(false);
    setSelectedOptions([]);
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    setIsAnswered(responses[index] !== null);
    setSelectedOptions(responses[index] || []);
  };

  const calculateResults = async (finalResponses) => {
    const totalQuestions = quiz.questions.length;
    const correctAnswers = finalResponses.reduce((acc, response, index) => {
      if (response === null) return acc;

      const question = quiz.questions[index];

      if (question.isMultipleChoice) {
        if (response.slice().sort().toString() === question.correctOption.slice().sort().toString()) {
          return acc + 1;
        }
      } else {
        if (response[0] === question.correctOption) {
          return acc + 1;
        }
      }

      return acc;
    }, 0);

    const scorePercentage = (correctAnswers / totalQuestions) * 100;

    let message = '';
    if (scorePercentage < 25) {
      message = quiz.resultMessages.lessThan25;
    } else if (scorePercentage < 50) {
      message = quiz.resultMessages.between25And50;
    } else if (scorePercentage < 75) {
      message = quiz.resultMessages.between50And75;
    } else {
      message = quiz.resultMessages.between75And100;
    }

    setResultMessage(message);

    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      console.error('userId is undefined');
      return;
    }

    // Actualizar el mejor resultado del usuario
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const bestScores = userData.bestScores || {};
      if (!bestScores[quizId] || bestScores[quizId] < scorePercentage) {
        bestScores[quizId] = scorePercentage;
        await updateDoc(userRef, { bestScores });
      }
    }

    // Actualizar el mejor resultado del usuario en el documento del quiz
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      const quizData = quizSnap.data();
      const userBestScores = quizData.userBestScores || {};
      if (!userBestScores[userId] || userBestScores[userId] < scorePercentage) {
        userBestScores[userId] = scorePercentage;
        await updateDoc(quizRef, { userBestScores });
      }
    }
  };

  const handleReviewAnswers = () => {
    setReviewAnswers(true);
    setCurrentQuestionIndex(0);
    setIsAnswered(true);
    setSelectedOptions(responses[0] || []);
  };

  const handleLike = async () => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      console.error('userId is undefined');
      return;
    }

    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      const quizData = quizSnap.data();
      const likes = quizData.likes || [];

      if (!likes.includes(userId)) {
        await updateDoc(quizRef, {
          likes: arrayUnion(userId),
        });
        setLiked(true);
      }
    }
  };

  const handleFavorite = async () => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      console.error('userId is undefined');
      return;
    }

    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      const quizData = quizSnap.data();
      const favorites = quizData.favorites || [];

      if (!favorites.includes(userId)) {
        await updateDoc(quizRef, {
          favorites: arrayUnion(userId),
        });

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          quizzes: arrayUnion(quizId),
        });

        setFavorited(true);
      } else {
        await updateDoc(quizRef, {
          favorites: arrayRemove(userId),
        });

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          quizzes: arrayRemove(quizId),
        });

        setFavorited(false);
      }
    }
  };

  if (!quiz) {
    return <div>Cargando...</div>;
  }

  if (showResults && !reviewAnswers) {
    return (
      <div className="container resolve-quiz-container">
        <h1>{quiz.title}</h1>
        <div className="result">
          <h3>Resultado: {((score / quiz.questions.length) * 100).toFixed(2)}%</h3>
          <p>{resultMessage}</p>
        </div>
        <div className="button-group">
          <button type="button" onClick={onBack} className="back-button">Volver</button>
          <button type="button" onClick={handleReviewAnswers} className="review-button">Revisar respuestas</button>
        </div>
        <KoFiButton />
        <div className="like-favorite-container">
          {!liked && (
            <div className="icon-container" onClick={handleLike}>
              <FontAwesomeIcon icon={faThumbsUp} className="like-icon" />
              <p className="cta-message">¿Te gustó el quiz? ¡Dale Like!</p>
            </div>
          )}
          {liked && <p className="liked-message">¡Ya diste like al cuestionario!</p>}
          {!favorited && (
            <div className="icon-container" onClick={handleFavorite}>
              <FontAwesomeIcon icon={faHeart} className="favorite-icon" />
              <p className="cta-message">¿Quieres guardarlo? ¡Añádelo a favoritos!</p>
            </div>
          )}
          {favorited && <p className="liked-message">¡Añadido a tus favoritos!</p>}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container resolve-quiz-container">
      <h1>{quiz.title}</h1>
      <div className="question-block">
        <h4>{currentQuestion.question}</h4>
        {currentQuestion.options.map((option, oIndex) => (
          <div
            key={oIndex}
            className={`option-block ${isAnswered ? 
              (selectedOptions.includes(oIndex) ? 
                (currentQuestion.isMultipleChoice ?
                  (currentQuestion.correctOption.includes(oIndex) ? 'correct' : 'incorrect') : 
                  (currentQuestion.correctOption === selectedOptions[0] ? 'correct' : 'incorrect')) : 
                (currentQuestion.isMultipleChoice ?
                  (currentQuestion.correctOption.includes(oIndex) ? 'correct-border' : '') : 
                  (currentQuestion.correctOption === oIndex ? 'correct-border' : ''))) : 
              (selectedOptions.includes(oIndex) ? 'selected' : '')}`}
            onClick={() => handleOptionSelect(oIndex)}
          >
            {option}
          </div>
        ))}
      </div>
      {isAnswered ? (
        !reviewAnswers && (
          <button type="button" onClick={handleNextQuestion} className="next-button">Continuar</button>
        )
      ) : (
        <button 
          type="button" 
          onClick={handleSubmitAnswer} 
          className="submit-button" 
          disabled={selectedOptions.length === 0}
          style={{ backgroundColor: selectedOptions.length > 0 ? '#6BBF59' : '#ccc' }}
        >
          Responder
        </button>
      )}
      <button type="button" onClick={onBack} className="back-button">Salir</button>
      <div className="question-selector">
        {quiz.questions.map((_, index) => {
          const isCorrect = responses[index] !== null &&
            (quiz.questions[index].isMultipleChoice
              ? responses[index].slice().sort().toString() === quiz.questions[index].correctOption.slice().sort().toString()
              : responses[index][0] === quiz.questions[index].correctOption);
          
          return (
            <button
              key={index}
              id={`question-selector-${index}`}
              className={`question-number ${responses[index] !== null ? (isCorrect ? 'answered-correct' : 'answered-incorrect') : ''}`}
              onClick={() => handleQuestionSelect(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <KoFiButton />
    </div>
  );
};

export default ResolveQuiz;
