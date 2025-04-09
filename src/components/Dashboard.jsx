import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import STLViewer from './STLViewer';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('main');
  const [file, setFile] = useState(null);
  const [parameters, setParameters] = useState({
    temperature: '',
    speed: '',
    layerHeight: '',
    infillDensity: '',
    material: 'PLA',
    nozzleSize: '0.4',
    bedTemperature: '',
    supportDensity: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [stlUrl, setStlUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Vérifier que le token est valide
    axios.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(error => {
      console.error('Erreur de validation du token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const stlFile = acceptedFiles[0];
    if (!stlFile) {
      console.log('Aucun fichier sélectionné');
      return;
    }

    if (!stlFile.name.toLowerCase().endsWith('.stl')) {
      console.log('Type de fichier invalide:', stlFile.name);
      setUploadStatus('Erreur: Seuls les fichiers STL sont acceptés');
      return;
    }

    setFile(stlFile);
    setUploadStatus('Fichier sélectionné: ' + stlFile.name);
    console.log('Fichier sélectionné:', stlFile.name);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', stlFile);

      const token = localStorage.getItem('token');
      console.log('Token présent:', !!token);

      if (!token) {
        throw new Error('Token manquant - veuillez vous reconnecter');
      }

      console.log('Début de l\'upload...');
      const response = await axios.post('/api/upload/stl', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Réponse du serveur:', response.data);

      if (response.data.success) {
        setUploadStatus('Fichier uploadé avec succès!');
        setStlUrl(response.data.file.path);
      }
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        setUploadStatus('Session expirée - veuillez vous reconnecter');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setUploadStatus(error.response?.data?.message || 'Erreur lors de l\'upload du fichier');
      }
    } finally {
      setIsUploading(false);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl'],
      'application/octet-stream': ['.stl']
    },
    multiple: false
  });

  const handleParameterChange = (e) => {
    setParameters({
      ...parameters,
      [e.target.name]: e.target.value
    });
  };

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Veuillez d\'abord sélectionner un fichier STL');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('parameters', JSON.stringify(parameters));

    try {
      const response = await axios.post('/api/optimize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setOptimizationResults(response.data);
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <img src="/enise-centrale-lyon.png" alt="ENISE Centrale Lyon" className="nav-logo" />
          <h1>Optimisation des Paramètres d'Impression 3D</h1>
        </div>
        <div className="nav-right">
          <span className="welcome-text">Bienvenue, {user.name}</span>
          <button
            className={`nav-button ${activeSection === 'main' ? 'active' : ''}`}
            onClick={() => setActiveSection('main')}
          >
            Interface Principale
          </button>
          <button
            className={`nav-button ${activeSection === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSection('history')}
          >
            Historique
          </button>
          <button onClick={handleLogout} className="logout-button">
            Se déconnecter
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {activeSection === 'main' ? (
          <div className="main-interface">
            <div className="column file-column">
              <div className="section-card">
                <h2>Import du fichier STL</h2>
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Déposez le fichier ici...</p>
                  ) : (
                    <p>Glissez-déposez un fichier STL ici, ou cliquez pour sélectionner</p>
                  )}
                </div>
                {uploadStatus && (
                  <div className={`upload-status ${uploadStatus.includes('Erreur') ? 'error' : 'success'}`}>
                    {uploadStatus}
                  </div>
                )}
                {isUploading && <div className="loading">Chargement en cours...</div>}
              </div>
            </div>

            <div className="column parameters-column">
              <div className="section-card">
                <h2>Paramètres d'impression</h2>
                <form className="parameters-form">
                  <div className="parameters-grid">
                    <div className="parameter-group">
                      <label htmlFor="material">Matériau</label>
                      <select
                        id="material"
                        name="material"
                        value={parameters.material}
                        onChange={handleParameterChange}
                      >
                        <option value="PLA">PLA</option>
                        <option value="ABS">ABS</option>
                        <option value="PETG">PETG</option>
                        <option value="TPU">TPU</option>
                      </select>
                    </div>

                    <div className="parameter-group">
                      <label htmlFor="nozzleSize">Diamètre de la buse (mm)</label>
                      <select
                        id="nozzleSize"
                        name="nozzleSize"
                        value={parameters.nozzleSize}
                        onChange={handleParameterChange}
                      >
                        <option value="0.2">0.2</option>
                        <option value="0.4">0.4</option>
                        <option value="0.6">0.6</option>
                        <option value="0.8">0.8</option>
                      </select>
                    </div>

                    <div className="parameter-group">
                      <label htmlFor="temperature">Température d'extrusion (°C)</label>
                      <input
                        type="number"
                        id="temperature"
                        name="temperature"
                        value={parameters.temperature}
                        onChange={handleParameterChange}
                        placeholder="Ex: 200"
                      />
                    </div>

                    <div className="parameter-group">
                      <label htmlFor="bedTemperature">Température du plateau (°C)</label>
                      <input
                        type="number"
                        id="bedTemperature"
                        name="bedTemperature"
                        value={parameters.bedTemperature}
                        onChange={handleParameterChange}
                        placeholder="Ex: 60"
                      />
                    </div>

                    <div className="parameter-group">
                      <label htmlFor="speed">Vitesse d'impression (mm/s)</label>
                      <input
                        type="number"
                        id="speed"
                        name="speed"
                        value={parameters.speed}
                        onChange={handleParameterChange}
                        placeholder="Ex: 60"
                      />
                    </div>

                    <div className="parameter-group">
                      <label htmlFor="layerHeight">Hauteur de couche (mm)</label>
                      <input
                        type="number"
                        id="layerHeight"
                        name="layerHeight"
                        value={parameters.layerHeight}
                        onChange={handleParameterChange}
                        placeholder="Ex: 0.2"
                        step="0.1"
                      />
                    </div>

                    <div className="parameter-group">
                      <label htmlFor="infillDensity">Densité de remplissage (%)</label>
                      <input
                        type="number"
                        id="infillDensity"
                        name="infillDensity"
                        value={parameters.infillDensity}
                        onChange={handleParameterChange}
                        placeholder="Ex: 20"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="parameter-group">
                      <label htmlFor="supportDensity">Densité des supports (%)</label>
                      <input
                        type="number"
                        id="supportDensity"
                        name="supportDensity"
                        value={parameters.supportDensity}
                        onChange={handleParameterChange}
                        placeholder="Ex: 15"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="column results-column">
              <div className="section-card">
                <h2>Optimisation et Résultats</h2>
                <div className="optimization-section">
                  <button onClick={handleOptimize} className="optimize-button">
                    Lancer l'optimisation
                  </button>
                  {optimizationResults && (
                    <div className="results-display">
                      <h3>Résultats de l'optimisation</h3>
                      {/* Afficher les résultats ici */}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {stlUrl && (
              <div className="section-card model-preview-card">
                <h2>Aperçu du modèle</h2>
                <div className="model-viewer-container">
                  <STLViewer url={`http://localhost:3001${stlUrl}`} />
                </div>
                <div className="model-info">
                  <div className="info-item">
                    <span className="info-label">Nom du fichier:</span>
                    <span className="info-value">{file.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Taille:</span>
                    <span className="info-value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="history-interface">
            <h2>Historique des Optimisations</h2>
            <div className="history-list">
              {/* Liste des optimisations précédentes */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 