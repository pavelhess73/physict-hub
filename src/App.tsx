import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Timer, 
  ExternalLink, 
  Settings, 
  Home, 
  RotateCcw,
  Monitor,
  Download,
  Upload
} from 'lucide-react';
import './App.css';

// Mock data pro témata
const topics = [
  { id: 1, title: 'Mechanika', icon: <Activity size={20} />, vivid: 'https://vividbooks.com/cs/fyzika/mechanika', phet: 'https://phet.colorado.edu/cs/simulations/category/physics/motion' },
  { id: 2, title: 'Optika', icon: <Monitor size={20} />, vivid: 'https://vividbooks.com/cs/fyzika/optika', phet: 'https://phet.colorado.edu/cs/simulations/category/physics/light-and-radiation' },
  { id: 3, title: 'Elektřina', icon: <Cpu size={20} />, vivid: 'https://vividbooks.com/cs/fyzika/elektrina', phet: 'https://phet.colorado.edu/cs/simulations/category/physics/electricity-magnets-and-circuits' }
];

import { databases, ID } from './lib/appwrite';

// Konstanty pro Appwrite (budete muset vyplnit po vytvoření v konzoli)
const DB_ID = 'main_db';
const COLLECTION_ID = 'user_data';
const DOC_ID = 'settings_doc'; // Fixní ID pro jednoho uživatele

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  
  // Persistence a nastavení
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem('teacherName') || 'pane učiteli');
  const [studentsRaw, setStudentsRaw] = useState(() => localStorage.getItem('studentsList') || 'Petr, Jana, Martin, Lucie, David, Elena');
  
  const students = studentsRaw.split(',').map(s => s.trim()).filter(s => s !== '');

  // Načtení dat z cloudu při startu
  useEffect(() => {
    const loadFromCloud = async () => {
      try {
        const response = await databases.getDocument(DB_ID, COLLECTION_ID, DOC_ID);
        setTeacherName(response.teacherName);
        setStudentsRaw(response.studentsRaw);
      } catch (error) {
        console.log('Cloud data zatím neexistují, vytvářím první záznam...');
      }
    };
    loadFromCloud();
  }, []);

  // Automatické ukládání do LocalStorage + Cloud Sync funkce
  useEffect(() => {
    localStorage.setItem('teacherName', teacherName);
    localStorage.setItem('studentsList', studentsRaw);
  }, [teacherName, studentsRaw]);

  const syncToCloud = async () => {
    setIsCloudSyncing(true);
    try {
      try {
        // Pokusíme se aktualizovat existující dokument
        await databases.updateDocument(DB_ID, COLLECTION_ID, DOC_ID, {
          teacherName,
          studentsRaw
        });
      } catch (e) {
        // Pokud neexistuje, vytvoříme ho
        await databases.createDocument(DB_ID, COLLECTION_ID, DOC_ID, {
          teacherName,
          studentsRaw
        });
      }
      alert('Cloud synchronizace byla úspěšná! 🚀');
    } catch (error) {
      alert('Chyba synchronizace: Ujistěte se, že máte správně nastavené Project ID v appwrite.ts');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Logika pro stopky
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };

  // Logika pro losovátko
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const drawStudent = () => {
    if (students.length === 0) return;
    setIsSpinning(true);
    setSelectedStudent(null);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setSelectedStudent(students[randomIndex]);
      setIsSpinning(false);
    }, 1000);
  };

  return (
    <div className="app-container">
      {/* Sidebar - Mission Impossible Style */}
      <aside className="sidebar">
        <div className="logo">
          Phys<span>ICT</span> Hub
        </div>
        <nav>
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Home size={18} /> Dashboard
          </div>
          <div 
            className={`nav-item ${activeTab === 'topics' ? 'active' : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            <Activity size={18} /> Témata Výuky
          </div>
          <div 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> Nastavení
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Mission: <span className="matrix-text">Education</span></h1>
          <p style={{ color: 'var(--text-dim)' }}>Vítejte v operačním centru, {teacherName}.</p>
        </header>

        {activeTab === 'dashboard' && (
          <div className="bento-grid">
            {/* Widget: Stopky (MI Style) */}
            <div className="glass-card">
              <div className="card-title">Laboratory Timer</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 700, textAlign: 'center', margin: '1rem 0', fontFamily: 'monospace' }}>
                {formatTime(time)}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => setIsRunning(!isRunning)}
                  style={{ background: isRunning ? '#ff4b2b' : 'var(--mi-blue)' }}
                >
                  {isRunning ? 'STOP' : 'START'}
                </button>
                <button className="nav-item" onClick={() => {setTime(0); setIsRunning(false);}}>
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Widget: Losovátko (Matrix Style) */}
            <div className="glass-card">
              <div className="card-title">Student Selection</div>
              <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <div style={{ 
                  fontSize: selectedStudent && selectedStudent.length > 10 ? '2rem' : '3rem', 
                  color: 'var(--matrix-green)', 
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  textShadow: '0 0 10px var(--matrix-green)',
                  overflow: 'hidden'
                }}>
                  {isSpinning ? 'SELECTING...' : (selectedStudent ? selectedStudent : 'READY')}
                </div>
                <button 
                  className="btn-primary" 
                  onClick={drawStudent}
                  style={{ background: 'var(--matrix-green)', color: 'black', marginTop: '10px' }}
                >
                  LOSOVAT ŽÁKA
                </button>
              </div>
            </div>

            {/* Widget: Rychlé odkazy */}
            <div className="glass-card" style={{ gridColumn: 'span 1' }}>
              <div className="card-title">External Intelligence</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="https://vividbooks.com" target="_blank" className="nav-item" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={16} /> Vividbooks AR
                </a>
                <a href="https://phet.colorado.edu" target="_blank" className="nav-item" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={16} /> PhET Simulations
                </a>
                <a href="https://blooket.com" target="_blank" className="nav-item" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={16} /> Blooket Battle
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="bento-grid">
            {topics.map(topic => (
              <div key={topic.id} className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{ color: 'var(--mi-blue)' }}>{topic.icon}</div>
                  <h3 style={{ margin: 0 }}>{topic.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a href={topic.vivid} target="_blank" className="btn-primary" style={{ fontSize: '0.8rem', textDecoration: 'none' }}>Vividbooks</a>
                  <a href={topic.phet} target="_blank" className="btn-primary" style={{ fontSize: '0.8rem', textDecoration: 'none', background: 'transparent', border: '1px solid var(--mi-blue)', color: 'var(--mi-blue)' }}>Simulace</a>
                </div>
                <div style={{ marginTop: '1.5rem', padding: '10px', background: 'rgba(0,255,65,0.05)', borderRadius: '8px', borderLeft: '2px solid var(--matrix-green)' }}>
                  <small className="matrix-text">ICT TIP: Měření senzorikou Micro:bit</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-card" style={{ maxWidth: '600px' }}>
            <div className="card-title">System Configuration</div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--mi-blue)' }}>Vaše kódové jméno:</label>
              <input 
                type="text" 
                value={teacherName} 
                onChange={(e) => setTeacherName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--matrix-green)' }}>Seznam žáků (oddělený čárkou):</label>
              <textarea 
                value={studentsRaw} 
                onChange={(e) => setStudentsRaw(e.target.value)}
                rows={5}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  borderRadius: '6px',
                  fontFamily: 'monospace'
                }}
                placeholder="Petr, Jana, Martin..."
              />
              <small style={{ color: 'var(--text-dim)' }}>Aktuální počet žáků: {students.length}</small>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <button 
                className="btn-primary" 
                onClick={syncToCloud}
                disabled={isCloudSyncing}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'var(--matrix-green)', 
                  color: 'black',
                  flex: 1,
                  justifyContent: 'center'
                }}
              >
                <Upload size={16} /> {isCloudSyncing ? 'SYNCHRONIZUJI...' : 'ULOŽIT DO CLOUDU (APPWRITE)'}
              </button>
            </div>

            <div style={{ padding: '10px', background: 'rgba(0,212,255,0.05)', borderRadius: '8px', border: '1px dashed var(--mi-blue)', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>⚠️ Data jsou uložena lokálně ve vašem prohlížeči.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const data = { teacherName, studentsRaw };
                  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `physict-hub-config-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#333', color: 'white' }}
              >
                <Download size={16} /> EXPORTOVAT ZÁLOHU
              </button>

              <label 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#333', color: 'white', cursor: 'pointer' }}
              >
                <Upload size={16} /> IMPORTOVAT ZÁLOHU
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const data = JSON.parse(event.target?.result as string);
                          if (data.teacherName) setTeacherName(data.teacherName);
                          if (data.studentsRaw) setStudentsRaw(data.studentsRaw);
                          alert('Konfigurace byla úspěšně nahrána!');
                        } catch (err) {
                          alert('Chyba při nahrávání souboru. Ujistěte se, že jde o správný JSON.');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
