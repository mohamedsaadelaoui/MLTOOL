import { useState, useEffect } from 'react';
import './MLTool.css';

const MLTool = () => {
  const [inputData, setInputData] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    // Vérifier si le serveur est en ligne
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setServerStatus(data.message);
      setError('');
    } catch (err) {
      setServerStatus(null);
      setError('Impossible de se connecter au serveur. Veuillez vérifier qu\'il est bien démarré.');
    }
  };

  const handlePredict = async () => {
    if (!serverStatus) {
      setError('Le serveur n\'est pas accessible. Veuillez vérifier la connexion.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ data: inputData }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec le serveur');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de la prédiction');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-tool">
      <h2>Outil d'analyse ML</h2>
      
      {serverStatus && (
        <div className="success-message">
          {serverStatus}
        </div>
      )}
      
      <div className="input-section">
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="Entrez vos données..."
          rows={4}
          disabled={!serverStatus || loading}
        />
        
        <button 
          onClick={handlePredict}
          disabled={loading || !inputData || !serverStatus}
        >
          {loading ? 'Analyse en cours...' : 'Analyser'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <h3>Résultats :</h3>
          <p>Prédiction : {prediction.prediction}</p>
          <p>Probabilité : {(prediction.probability * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default MLTool; 