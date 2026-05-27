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
import { databases } from './lib/appwrite';
import './App.css';

// Mock data pro témata
const topics = [
  { id: 1, title: 'Mechanika', icon: <Activity size={20} />, vivid: 'https://vividbooks.com/cs/fyzika/mechanika', phet: 'https://phet.colorado.edu/cs/simulations/category/physics/motion' },
  { id: 2, title: 'Optika', icon: <Monitor size={20} />, vivid: 'https://vividbooks.com/cs/fyzika/optika', phet: 'https://phet.colorado.edu/cs/simulations/category/physics/light-and-radiation' },
  { id: 3, title: 'Elektřina', icon: <Cpu size={20} />, vivid: 'https://vividbooks.com/cs/fyzika/elektrina', phet: 'https://phet.colorado.edu/cs/simulations/category/physics/electricity-magnets-and-circuits' }
];

// Konstanty pro Appwrite
const DB_ID = 'main_db';
const COLLECTION_ID = 'user_data';
const DOC_ID = 'settings_doc';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem('teacherName') || 'pane učiteli');
  const [studentsRaw, setStudentsRaw] = useState(() => localStorage.getItem('studentsList') || 'Petr, Jana, Martin, Lucie, David, Elena');
  
  const students = studentsRaw.split(',').map(s => s.trim()).filter(s => s !== '');

  useEffect(() => {
    const loadFromCloud = async () => {
      try {
        const response = await databases.getDocument(DB_ID, COLLECTION_ID, DOC_ID);
        setTeacherName(response.teacherName);
        setStudentsRaw(response.studentsRaw);
      } catch (error) {
        console.log('Cloud data zatím neexistují.');
      }
    };
    loadFromCloud();
  }, []);

  useEffect(() => {
    localStorage.setItem('teacherName', teacherName);
    localStorage.setItem('studentsList', studentsRaw);
  }, [teacherName, studentsRaw]);

  const syncToCloud = async () => {
    setIsCloudSyncing(true);
    try {
      try {
        await databases.updateDocument(DB_ID, COLLECTION_ID, DOC_ID, { teacherName, studentsRaw });
      } catch (e) {
        await databases.createDocument(DB_ID, COLLECTION_ID, DOC_ID, { teacherName, studentsRaw });
      }
      alert('Cloud synchronizace byla úspěšná! 🚀');
    } catch (error) {
      alert('Chyba synchronizace: Zkontrolujte Project ID v appwrite.ts');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => setTime((prev) => prev + 10), 10);
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
      <aside className="sidebar">
        <div className="logo">Phys<span>ICT</span> Hub</div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Home size={18} /> Dashboard</div>
          <div className={`nav-item ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')}><Activity size={18} /> Témata Výuky</div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Nastavení</div>
        </nav>
      </aside>

      <main className="main-content">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Mission: <span className="matrix-text">Education</span></h1>
          <p style={{ color: 'var(--text-dim)' }}>Vítejte v operačním centru, {teacherName}.</p>
        </header>

        {activeTab === 'dashboard' && (
          <div className="bento-grid">
            <div className="glass-card">
              <div className="card-title">Laboratory Timer</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 700, textAlign: 'center', margin: '1rem 0', fontFamily: 'monospace' }}>{formatTime(time)}</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => setIsRunning(!isRunning)} style={{ background: isRunning ? '#ff4b2b' : 'var(--mi-blue)' }}>{isRunning ? 'STOP' : 'START'}</button>
                <button className="nav-item" onClick={() => {setTime(0); setIsRunning(false);}}><RotateCcw size={18} /></button>
              </div>
            </div>

            <div className="glass-card">
              <div className="card-title">Student Selection</div>
              <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <div style={{ fontSize: selectedStudent && selectedStudent.length > 10 ? '2rem' : '3rem', color: 'var(--matrix-green)', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', textShadow: '0 0 10px var(--matrix-green)', overflow: 'hidden' }}>
                  {isSpinning ? 'SELECTING...' : (selectedStudent ? selectedStudent : 'READY')}
                </div>
                <button className="btn-primary" onClick={drawStudent} style={{ background: 'var(--matrix-green)', color: 'black', marginTop: '10px' }}>LOSOVAT ŽÁKA</button>
              </div>
            </div>

            <div className="glass-card">
              <div className="card-title">External Intelligence</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="https://vividbooks.com" target="_blank" className="nav-item" style={{ textDecoration: 'none' }}><ExternalLink size={16} /> Vividbooks AR</a>
                <a href="https://phet.colorado.edu" target="_blank" className="nav-item" style={{ textDecoration: 'none' }}><ExternalLink size={16} /> PhET Simulations</a>
                <a href="https://blooket.com" target="_blank" className="nav-item" style={{ textDecoration: 'none' }}><ExternalLink size={16} /> Blooket Battle</a>
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
              <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--matrix-green)' }}>Seznam žáků (oddělený čárkou):</label>
              <textarea value={studentsRaw} onChange={(e) => setStudentsRaw(e.target.value)} rows={5} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px', fontFamily: 'monospace' }} placeholder="Petr, Jana, Martin..." />
              <small style={{ color: 'var(--text-dim)' }}>Aktuální počet žáků: {students.length}</small>
            </div>

            <button className="btn-primary" onClick={syncToCloud} disabled={isCloudSyncing} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--matrix-green)', color: 'black', width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Upload size={16} /> {isCloudSyncing ? 'SYNCHRONIZUJI...' : 'ULOŽIT DO CLOUDU (APPWRITE)'}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={() => {
                const data = { teacherName, studentsRaw };
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `physict-hub-config.json`;
                a.click();
              }} style={{ flex: 1, background: '#333', color: 'white' }}><Download size={16} /> EXPORT</button>
              
              <label className="btn-primary" style={{ flex: 1, background: '#333', color: 'white', cursor: 'pointer', textAlign: 'center' }}>
                <Upload size={16} /> IMPORT
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const d = JSON.parse(ev.target?.result as string);
                      setTeacherName(d.teacherName); setStudentsRaw(d.studentsRaw);
                    };
                    reader.readAsText(file);
                  }
                }} />
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
