import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import '../css/BtnMain.css';

const BtnLogout = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally navigate to login even if sign-out fails
      navigate('/');
    }
  };

  return (
    <button className="btn-hero" onClick={handleLogout}>
      Sign Out
    </button>
  );
};

export default BtnLogout;
