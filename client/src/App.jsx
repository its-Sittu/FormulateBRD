import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  BarChart2, 
  FileInput, 
  Search, 
  Bell, 
  Mail, 
  Plus,
  CheckCircle,
  Clock,
  Briefcase,
  ChevronDown,
  MessageSquareText
} from 'lucide-react'
import './index.css'

// --- MOCK COMPONENTS FOR DASHBOARD ---

const StatsCard = ({ title, value, sub, color, icon: Icon }) => (
  <div className={`stat-card ${color}`}>
    <div>
      <div className="stat-header">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
    <div className="stat-icon">
      {Icon && <Icon size={16} />}
    </div>
  </div>
)

const ActivityTable = () => (
  <div className="table-card">
    <div className="table-header">
      <h3>Recent Activity</h3>
      <button className="icon-btn"><Plus size={18} /></button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Case ID</th>
          <th>Project Name</th>
          <th>Date & Time</th>
          <th>Status</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>#12345</td>
          <td>Project Phoenix</td>
          <td>Oct 24, 2024 10:30 AM</td>
          <td><span className="status-badge">Completed</span></td>
          <td>Sarah Connor</td>
        </tr>
        <tr>
          <td>#12346</td>
          <td>Skynet Integration</td>
          <td>Oct 23, 2024 11:00 AM</td>
          <td><span className="status-badge" style={{color:'#f59e0b', background:'rgba(245,158,11,0.1)'}}>In Review</span></td>
          <td>Miles Dyson</td>
        </tr>
        <tr>
          <td>#12347</td>
          <td>T-800 Specs</td>
          <td>Oct 22, 2024 09:15 AM</td>
          <td><span className="status-badge" style={{color:'#3b82f6', background:'rgba(59,130,246,0.1)'}}>Drafting</span></td>
          <td>John Doe</td>
        </tr>
      </tbody>
    </table>
  </div>
)

const WaveChart = () => (
  <div className="chart-card">
    <div className="chart-header">
       <h3>Generations Overview</h3>
       <div className="chart-legend">
         <div className="legend-item"><div className="dot" style={{background:'#f97316'}}></div>Requests</div>
         <div className="legend-item"><div className="dot" style={{background:'#8b5cf6'}}></div>Completed</div>
       </div>
    </div>
    <div className="wave-chart-container">
      {/* Mock SVG Wave */}
      <svg viewBox="0 0 500 150" width="100%" height="100%" preserveAspectRatio="none">
         <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#8b5cf6', stopOpacity:0.5}} />
              <stop offset="100%" style={{stopColor:'#8b5cf6', stopOpacity:0}} />
            </linearGradient>
         </defs>
         <path d="M0,100 C150,150 250,50 500,100 L500,150 L0,150 Z" fill="url(#grad1)" />
         <path d="M0,100 C150,150 250,50 500,100" stroke="#8b5cf6" strokeWidth="3" fill="none" />
         
         <path d="M0,80 C120,40 280,120 500,60" stroke="#f97316" strokeWidth="3" fill="none" />
      </svg>
    </div>
  </div>
)

const OverviewStats = () => (
  <div className="chart-card">
    <div className="chart-header">
      <h3>Storage</h3>
    </div>
    <div style={{display:'flex', gap:'20px', alignItems:'center', justifyContent:'center', height:'140px'}}>
       <div style={{textAlign:'center'}}>
          <div style={{fontSize:'32px', fontWeight:'700'}}>680</div>
          <div style={{fontSize:'12px', color:'var(--text-muted)'}}>Projects</div>
       </div>
       <div style={{width:'1px', height:'40px', background:'rgba(255,255,255,0.1)'}}></div>
       <div style={{textAlign:'center'}}>
          <div style={{fontSize:'32px', fontWeight:'700'}}>900</div>
          <div style={{fontSize:'12px', color:'var(--text-muted)'}}>Files</div>
       </div>
    </div>
    <div style={{marginTop:'10px'}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px'}}>
        <span>Space Used</span>
        <span>75%</span>
      </div>
      <div style={{height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px'}}>
         <div style={{width:'75%', height:'100%', background:'var(--accent-blue)', borderRadius:'3px'}}></div>
      </div>
    </div>
  </div>
)


// --- GENERATOR COMPONENT (Existing Logic) ---

const GeneratorView = () => {
  const [inputText, setInputText] = useState('')
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('brd')
  const [inputSource, setInputSource] = useState('raw')

  const handleGenerate = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setReport(null);
    setActiveTab('analysis');
    try {
      const formData = new FormData();
      formData.append('context', inputText);
      const genRes = await fetch('http://localhost:8000/generate', { method: 'POST', body: formData });
      if (!genRes.ok) throw new Error('Generation failed');
      const data = await genRes.json();
      setReport(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating report. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  }

  const loadEnron = async () => {
      setInputSource('enron');
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/enron/random');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setInputText(`Subject: ${data.subject}\nFrom: ${data.from}\nTo: ${data.to}\nDate: ${data.date}\n\n${data.body}`);
      } catch { alert("Failed to load Enron email"); } finally { setIsLoading(false); }
  }

  return (
    <div className="generator-view">
       <div className="gen-panel-left">
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block', marginBottom:'8px', fontSize:'12px', color:'var(--text-muted)'}}>Input Source</label>
            <div style={{display:'flex', gap:'8px'}}>
               <button onClick={() => setInputSource('raw')} style={{flex:1, padding:'8px', background:inputSource==='raw'?'var(--accent-blue)':'rgba(255,255,255,0.05)', border:'none', borderRadius:'8px', color:'white', cursor:'pointer'}}>Raw</button>
               <button onClick={loadEnron} style={{flex:1, padding:'8px', background:inputSource==='enron'?'var(--accent-blue)':'rgba(255,255,255,0.05)', border:'none', borderRadius:'8px', color:'white', cursor:'pointer'}}>Enron</button>
            </div>
          </div>
          <textarea 
            style={{flex:1, background:'#13141f', border:'none', color:'white', padding:'16px', borderRadius:'12px', resize:'none', fontFamily:'inherit'}}
            placeholder="Paste requirements here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            onClick={handleGenerate} 
            disabled={isLoading || !inputText}
            style={{marginTop:'20px', padding:'14px', background:'var(--primary)', border:'none', borderRadius:'12px', color:'white', fontWeight:'600', cursor:'pointer'}}
          >
            {isLoading ? 'Processing...' : 'Generate BRD'}
          </button>
       </div>

       <div className="gen-panel-right">
          {report ? (
             <>
               <div className="tabs" style={{borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'10px', marginBottom:'20px'}}>
                  {['analysis', 'brd', 'gaps'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background:'transparent', border:'none', color: activeTab===tab?'white':'var(--text-muted)', 
                        padding:'8px 16px', cursor:'pointer', borderBottom: activeTab===tab?'2px solid var(--accent-blue)':'2px solid transparent'
                      }}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
               </div>
               <div className="markdown-body" style={{flex:1, overflowY:'auto', fontSize:'14px', lineHeight:'1.6'}}>
                  {activeTab === 'analysis' && <ReactMarkdown>{report.analysis}</ReactMarkdown>}
                  {activeTab === 'brd' && <ReactMarkdown>{report.brd}</ReactMarkdown>}
                  {activeTab === 'gaps' && <ReactMarkdown>{report.clarification_questions}</ReactMarkdown>}
               </div>
             </>
          ) : (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'var(--text-muted)'}}>
               Select source and generate to view report
            </div>
          )}
       </div>
    </div>
  )
}

const DossierView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">Dossier / Projects</div>
    <div className="table-card">
       <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>
          <FileText size={48} style={{marginBottom:'16px', opacity:0.5}} />
          <h3>Project Files</h3>
          <p>Manage all your generated BRDs and source documents here.</p>
       </div>
    </div>
  </div>
)

const teamMembers = [
  { name: 'Satyam Raghuvanshi', role: 'Backend & AI Integration Lead', email: 'satyamraghuvanshi220ct@gmail.com', status: 'Online' },
  { name: 'Saksham Jaiswal', role: 'Mobile Experience & Product Delivery Lead', email: 'saksham2607jaiswal@gmail.com', status: 'Online' },
  { name: 'Sittu Kumar Singh', role: 'Web Experience & Demo Lead', email: 'sitturaj730@gmail.com', status: 'Online' },
  { name: 'Shimant Ranjan', role: 'AI Logic & Requirement Intelligence Lead', email: 'shimantranjan2@gmail.com', status: 'Online' },
]

const TeamView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">Team Members</div>
    <div className="stats-grid">
       <StatsCard title="Total Leads" value={teamMembers.length} sub="Core Team" color="blue" icon={Users} />
       <StatsCard title="Active" value={teamMembers.length} sub="Online" color="purple" icon={CheckCircle} />
    </div>
    <div className="table-card">
       <div className="table-header"><h3>Core Team Directory</h3></div>
       <table>
         <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
         <tbody>
           {teamMembers.map((member, index) => (
             <tr key={index}>
               <td style={{fontWeight:'500'}}>{member.name}</td>
               <td style={{color:'var(--text-muted)', fontSize:'13px'}}>{member.role}</td>
               <td style={{color:'var(--accent-blue)', fontSize:'13px'}}>{member.email}</td>
               <td>
                 <span 
                   className="status-badge" 
                   style={{
                     background: 'rgba(16, 185, 129, 0.1)', 
                     color: '#10b981'
                   }}
                 >
                   {member.status}
                 </span>
               </td>
             </tr>
           ))}
         </tbody>
       </table>
    </div>
  </div>
)

const SettingsView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">Settings</div>
    <div className="gen-panel-left" style={{maxWidth:'600px'}}>
       <h3>General Configuration</h3>
       <div style={{marginTop:'20px'}}>
          <label style={{display:'block', marginBottom:'8px'}}>Workspace Name</label>
          <input type="text" defaultValue="Genius Corp" style={{width:'100%', padding:'12px', background:'#13141f', border:'none', color:'white', borderRadius:'8px'}} />
       </div>
       <div style={{marginTop:'20px'}}>
          <label style={{display:'block', marginBottom:'8px'}}>Theme</label>
          <div style={{display:'flex', gap:'10px'}}>
             <button style={{padding:'10px 20px', background:'var(--accent-blue)', borderRadius:'8px', border:'none', color:'white'}}>Dark Mode</button>
             <button style={{padding:'10px 20px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', border:'none', color:'white'}}>Light Mode</button>
          </div>
       </div>
    </div>
  </div>
)

const MailView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">Messages</div>
    <div className="table-card">
       <div className="table-header"><h3>Inbox (2 Active)</h3></div>
       <table>
         <thead><tr><th>From</th><th>Subject</th><th>Time</th><th>Action</th></tr></thead>
         <tbody>
           <tr><td>System</td><td>Report #12345 Generated</td><td>10:30 AM</td><td><button style={{color:'var(--accent-blue)', background:'transparent', border:'none', cursor:'pointer'}}>View</button></td></tr>
           <tr><td>Sarah Connor</td><td>Re: Phoenix Project Requirements</td><td>Yesterday</td><td><button style={{color:'var(--accent-blue)', background:'transparent', border:'none', cursor:'pointer'}}>Reply</button></td></tr>
         </tbody>
       </table>
    </div>
  </div>
)

const NotificationsView = () => (
   <div className="dashboard-view">
    <div className="dashboard-title">Notifications</div>
    <div className="stats-grid">
       <div className="stat-card dark-blue">
          <div className="stat-header">System Alerts</div>
          <div className="stat-value">0</div>
          <div className="stat-sub">All systems operational</div>
          <div className="stat-icon"><CheckCircle size={16} /></div>
       </div>
    </div>
    <div style={{background:'var(--bg-card)', borderRadius:'16px', padding:'20px'}}>
       <div style={{display:'flex', gap:'16px', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'16px', marginBottom:'16px'}}>
          <div style={{width:'40px', height:'40px', background:'rgba(16, 185, 129, 0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981'}}><CheckCircle size={20} /></div>
          <div>
             <div style={{fontWeight:'600'}}>Generation Complete</div>
             <div style={{fontSize:'14px', color:'var(--text-muted)', marginTop:'4px'}}>Project Phoenix BRD is ready for review.</div>
             <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'4px', opacity:0.6}}>2 mins ago</div>
          </div>
       </div>
       <div style={{display:'flex', gap:'16px'}}>
          <div style={{width:'40px', height:'40px', background:'rgba(59, 130, 246, 0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#3b82f6'}}><Bell size={20} /></div>
          <div>
             <div style={{fontWeight:'600'}}>New Comment</div>
             <div style={{fontSize:'14px', color:'var(--text-muted)', marginTop:'4px'}}>Miles Dyson commented on "T-800 Specs"</div>
             <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'4px', opacity:0.6}}>1 hour ago</div>
          </div>
       </div>
    </div>
  </div>
)

const ProfileView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">User Profile</div>
    <div style={{display:'flex', gap:'32px', alignItems:'flex-start'}}>
       <div style={{background:'var(--bg-card)', borderRadius:'20px', padding:'32px', textAlign:'center', minWidth:'250px'}}>
           <div style={{width:'100px', height:'100px', borderRadius:'50%', background:'var(--accent-purple)', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:'700'}}>SR</div>
           <h2 style={{margin:'0 0 8px 0'}}>Satyam Raghuvanshi</h2>
           <div style={{color:'var(--text-muted)', marginBottom:'24px'}}>Backend & AI Lead</div>
           <button style={{width:'100%', padding:'10px', background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'8px', color:'white', cursor:'pointer'}}>Edit Profile</button>
       </div>
       <div style={{flex:1, background:'var(--bg-card)', borderRadius:'20px', padding:'32px'}}>
           <h3>Account Details</h3>
           <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'20px'}}>
              <div>
                 <label style={{display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>Full Name</label>
                 <div style={{padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px'}}>Satyam Raghuvanshi</div>
              </div>
              <div>
                 <label style={{display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>Email</label>
                 <div style={{padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px'}}>satyamraghuvanshi220ct@gmail.com</div>
              </div>
              <div>
                 <label style={{display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>Role</label>
                 <div style={{padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px'}}>Backend & AI Integration Lead</div>
              </div>
              <div>
                 <label style={{display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>Department</label>
                 <div style={{padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px'}}>Engineering</div>
              </div>
           </div>
       </div>
    </div>
  </div>
)

// --- MAIN APP Layout ---

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          {/* Brand Icon — Custom Logo */}
          <img src="/logo.png" alt="FormulateBRD Logo" style={{
            width:'42px', height:'42px', borderRadius:'12px', flexShrink:0,
            boxShadow:'0 4px 20px rgba(139,92,246,0.5)'
          }} />
          {/* Brand Name */}
          <div>
            <div style={{fontWeight:'800', fontSize:'17px', letterSpacing:'-0.5px', lineHeight:'1.1'}}>
              Formulate
              <span style={{
                background:'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
              }}>BRD</span>
            </div>
            <div style={{fontSize:'10px', color:'var(--text-muted)', letterSpacing:'0.4px', marginTop:'2px'}}>
              AI-Powered Requirements
            </div>
          </div>
        </div>
        
        <div className="nav-menu">
           <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
           </button>
           <button className={`nav-item ${currentView === 'dossier' ? 'active' : ''}`} onClick={() => setCurrentView('dossier')}>
              <FileText size={20} /> Dossier
           </button>
           <button className={`nav-item ${currentView === 'generator' ? 'active' : ''}`} onClick={() => setCurrentView('generator')}>
              <FileInput size={20} /> New Report
           </button>
           <button className={`nav-item ${currentView === 'team' ? 'active' : ''}`} onClick={() => setCurrentView('team')}>
              <Users size={20} /> Team
           </button>
           <button className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
              <Settings size={20} /> Settings
           </button>
        </div>

        <div 
          onClick={() => setCurrentView('profile')}
          style={{marginTop:'auto', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'12px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}
        >
          <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'var(--accent-purple)'}}></div>
           <div style={{fontSize:'12px'}}>
              <div style={{fontWeight:'700'}}>Satyam R.</div>
              <div style={{opacity:0.6}}>Backend & AI</div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header>
           <div className="search-bar">
             <Search size={18} color="rgba(255,255,255,0.4)" />
             <input className="search-input" placeholder="Search..." />
           </div>
           
           <div className="header-icons">
              <button className={`icon-btn ${currentView === 'mail' ? 'active' : ''}`} onClick={() => setCurrentView('mail')} style={currentView === 'mail' ? {borderColor:'var(--accent-blue)', color:'var(--accent-blue)'} : {}}><Mail size={20} /></button>
              <button className={`icon-btn ${currentView === 'notifications' ? 'active' : ''}`} onClick={() => setCurrentView('notifications')} style={currentView === 'notifications' ? {borderColor:'var(--accent-blue)', color:'var(--accent-blue)'} : {}}><Bell size={20} /></button>
              <div 
                className="user-profile" 
                onClick={() => setCurrentView('profile')}
                style={{cursor:'pointer', color:currentView === 'profile' ? 'var(--accent-blue)' : 'inherit'}}
              >
                 Satyam <ChevronDown size={16} />
              </div>
           </div>
        </header>

        {currentView === 'dashboard' && (
          <div className="dashboard-view">
             <div className="dashboard-title">Dashboard Overview</div>
             
             <div className="stats-grid">
               <StatsCard title="Total BRDs" value="30" sub="Check carried out" color="purple" icon={CheckCircle} />
               <StatsCard title="Time Saved" value="24h" sub="This month" color="blue" icon={Clock} />
               <StatsCard title="Drafts" value="50" sub="Pending Review" color="dark-blue" icon={FileText} />
               <StatsCard title="Completion" value="98%" sub="Success Rate" color="orange" icon={BarChart2} />
             </div>

             <div className="charts-split">
               <WaveChart />
               <OverviewStats />
             </div>

             <ActivityTable />
          </div>
        )}

        {currentView === 'generator' && <GeneratorView />}
        {currentView === 'dossier' && <DossierView />}
        {currentView === 'team' && <TeamView />}
        {currentView === 'settings' && <SettingsView />}
        {currentView === 'mail' && <MailView />}
        {currentView === 'notifications' && <NotificationsView />}
        {currentView === 'profile' && <ProfileView />}

      </div>
    </div>
  )
}

export default App
