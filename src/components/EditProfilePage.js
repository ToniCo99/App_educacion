// src/components/EditProfilePage.js
import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/EditProfilePage.css';

const EditProfilePage = ({ onBack, onProfileUpdate }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setName(userDoc.data().name);
        }
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
      }
    };

    fetchUserName();
  }, []);

  const handleSave = async () => {
    if (name.length > 30) {
      setError('El nombre no puede exceder los 30 caracteres.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);

      if (image) {
        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
        const resizedImage = await resizeImage(image, 100, 100);
        await uploadBytes(storageRef, resizedImage);
        const photoURL = await getDownloadURL(storageRef);

        await updateDoc(userDocRef, { name, photoURL });
      } else {
        await updateDoc(userDocRef, { name });
      }

      if (onProfileUpdate) {
        onProfileUpdate(); // Llama a la función para actualizar el perfil en App.js
      }

      onBack();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setError('Error al actualizar el perfil.');
    }
  };

  const resizeImage = (file, width, height) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8);
      };

      img.onerror = reject;
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input
          type="text"
          id="name"
          value={name}
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="profilePicture">Foto de Perfil</label>
        <input
          type="file"
          id="profilePicture"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      <div className="button-group">
        <button type="button" className="back-button" onClick={onBack}>Volver</button>
        <button type="button" className="save-button" onClick={handleSave}>Guardar Cambios</button>
      </div>
    </div>
  );
};

export default EditProfilePage;
