import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Login.css';
import greenLogo from '../../assets/greenchoice_white.svg';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // while this page is mounted, lock page-level scrolling to avoid tiny viewport overflow
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-icon-wrapper">
            <img src={greenLogo} alt="greenchoice white logo" className="auth-icon" />
          </div>
          <h1 className="auth-title">GreenChoice AI</h1>
          <p className="auth-subtitle">Welcome Back</p>
        </div>
        
        <button onClick={login} className="auth-btn">
          Sign in with SSO to continue
        </button>
        
        <p className="auth-footer">🌳 Placeholder auth for greenchoice demo</p>
      </div>
    </div>
  );
};