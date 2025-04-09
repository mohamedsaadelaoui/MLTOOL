import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="login-container">
      <div className="background-overlay"></div>
      <div className="form-container">
        <div className="logo-section">
          <img src="/enise-centrale-lyon.png" alt="ENISE Centrale Lyon" className="logo" />
          <div className="divider">
            <span className="divider-line"></span>
            <span className="divider-text">LTDS UMR 5513</span>
            <span className="divider-line"></span>
          </div>
        </div>
        
        <h1 className="app-title">SmartAdditive</h1>
        <h2 className="app-subtitle">IA pour l'Optimisation de l'Impression 3D</h2>

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Entrez votre email"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>

          <button type="submit" className="login-button">
            Se connecter
          </button>
        </form>

        <footer className="login-footer">
          <p className="institution">Laboratoire de Tribologie et Dynamique des Systèmes</p>
          <p className="copyright">© 2024 ENISE - École Nationale d'Ingénieurs de Saint-Étienne</p>
        </footer>
      </div>
    </div>
  );
};

export default Login; 