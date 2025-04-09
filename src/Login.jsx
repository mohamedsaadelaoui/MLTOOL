import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/${isSignup ? 'register' : 'login'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'Un utilisateur avec cet email existe déjà') {
          setError('Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.');
        } else if (data.message === 'Email ou mot de passe incorrect') {
          setError('Email ou mot de passe incorrect. Veuillez réessayer.');
        } else {
          setError(data.message || 'Une erreur est survenue');
        }
        return;
      }

      if (isSignup) {
        // Si c'est une inscription réussie
        setSuccessMessage('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
        setIsSignup(false);
        setFormData({
          email: '',
          password: '',
          name: ''
        });
      } else {
        // Si c'est une connexion réussie
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Connexion avec ${provider}`);
    onLogin({ name: 'Utilisateur Test', email: 'test@example.com' });
  };

  return (
    <div className="login-container">
      <div className="school-name">
        <h1>CENTRALE LYON</h1>
        <h1>ENISE</h1>
      </div>
      <div className="form-container">
        <h2 className="form-title">{isSignup ? 'Créer un compte' : 'Se connecter'}</h2>
        
        <div className="social-login">
          <button 
            className="social-button"
            onClick={() => handleSocialLogin('Google')}
            type="button"
          >
            <img src="/google.svg" alt="google" className="social-icon" />
            Google
          </button>
          <button 
            className="social-button"
            onClick={() => handleSocialLogin('Apple')}
            type="button"
          >
            <img src="/apple.svg" alt="apple" className="social-icon" />
            Apple
          </button>
        </div>

        <p className="separator"><span>ou</span></p>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <div className="input-group">
              <label htmlFor="name">Nom complet</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Entrez votre nom complet"
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Entrez votre email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Entrez votre mot de passe"
              disabled={isLoading}
              required
            />
          </div>

          {!isSignup && (
            <div className="forgot-password">
              <a href="#">Mot de passe oublié ?</a>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading 
              ? 'Chargement...' 
              : (isSignup ? 'S\'inscrire' : 'Se connecter')}
          </button>

          <div className="signup-prompt">
            <p>
              {isSignup 
                ? 'Déjà un compte ? ' 
                : 'Pas encore de compte ? '}
              <a href="#" onClick={(e) => {
                e.preventDefault();
                setIsSignup(!isSignup);
                setError('');
                setSuccessMessage('');
                setFormData({
                  email: '',
                  password: '',
                  name: ''
                });
              }}>
                {isSignup ? 'Se connecter' : 'S\'inscrire'}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 