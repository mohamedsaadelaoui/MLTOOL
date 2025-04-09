import { useState, useCallback } from 'react';
import './Dashboard.css';
import ModelViewer from './components/ModelViewer';
import MLTool from './components/MLTool';

const PRESETS = {
  'thin_walls': {
    name: 'Parois Minces',
    materialType: 'Ti6Al4V',
    powderSize: '45',
    laserPower: '200',
    scanSpeed: '1000',
    layerThickness: '30',
    scanPattern: 'Stripe',
    hatchDistance: '100'
  },
  'high_density': {
    name: 'Haute Densité',
    materialType: '316L Stainless Steel',
    powderSize: '30',
    laserPower: '250',
    scanSpeed: '800',
    layerThickness: '40',
    scanPattern: 'Checkerboard',
    hatchDistance: '80'
  },
  'surface_quality': {
    name: 'Qualité Surface',
    materialType: 'AlSi10Mg',
    powderSize: '20',
    laserPower: '180',
    scanSpeed: '1200',
    layerThickness: '25',
    scanPattern: 'Spiral',
    hatchDistance: '90'
  }
};

const ANALYSIS_HISTORY = [
  {
    id: 1,
    fileName: 'support_bracket.stl',
    date: '2024-03-12',
    material: 'Ti6Al4V',
    results: {
      density: 95,
      surfaceQuality: 88,
      buildSuccess: 92
    },
    parameters: PRESETS.thin_walls
  },
  {
    id: 2,
    fileName: 'heat_exchanger.stl',
    date: '2024-03-11',
    material: '316L Stainless Steel',
    results: {
      density: 98,
      surfaceQuality: 85,
      buildSuccess: 94
    },
    parameters: PRESETS.high_density
  }
];

const Dashboard = ({ user, onLogout }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parameters, setParameters] = useState({
    materialType: '316L Stainless Steel',
    powderSize: '',
    laserPower: '',
    scanSpeed: '',
    layerThickness: '',
    scanPattern: 'Stripe',
    hatchDistance: ''
  });
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [activeTab, setActiveTab] = useState('ml-tool');

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      setSelectedFile(file);
    } else {
      alert('Please select a STL file');
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      setSelectedFile(file);
    } else {
      alert('Please drop a STL file');
    }
  }, []);

  const handleParameterChange = (field, value) => {
    setParameters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadPreset = (presetKey) => {
    setParameters(PRESETS[presetKey]);
  };

  const resetParameters = () => {
    setParameters({
      materialType: '316L Stainless Steel',
      powderSize: '',
      laserPower: '',
      scanSpeed: '',
      layerThickness: '',
      scanPattern: 'Stripe',
      hatchDistance: ''
    });
  };

  const exportResults = () => {
    const results = {
      fileName: selectedFile?.name,
      date: new Date().toISOString(),
      parameters,
      predictions: {
        density: 95,
        surfaceQuality: 88,
        buildSuccess: 92
      }
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${selectedFile?.name || 'results'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runAnalysis = () => {
    // TODO: Implement ML analysis
    console.log('Running analysis with parameters:', parameters);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Tableau de bord</h1>
        <div className="user-info">
          <span>Bienvenue, {user.name}</span>
          <button onClick={onLogout} className="logout-button">
            Se déconnecter
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={`nav-button ${activeTab === 'ml-tool' ? 'active' : ''}`}
          onClick={() => setActiveTab('ml-tool')}
        >
          Outil ML
        </button>
        {/* Ajoutez d'autres onglets ici si nécessaire */}
      </nav>

      <main className="dashboard-content">
        {activeTab === 'ml-tool' && <MLTool />}
      </main>
    </div>
  );
};

export default Dashboard; 