import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cq.css';

const loadTeamsFromStorage = (): Team[] => {
  const stored = localStorage.getItem('duty-teams');
  return stored ? JSON.parse(stored) : [
    {
      id: 'team-alpha',
      name: 'Alpha Shift',
      leadName: 'John Smith',
      members: [
        { id: 'm1', name: 'Alex Johnson', lastDutyDate: '2024-01-15', totalDuties: 5 },
        { id: 'm2', name: 'Maria Garcia', lastDutyDate: '2024-01-10', totalDuties: 3 },
        { id: 'm3', name: 'David Lee', lastDutyDate: '2024-01-05', totalDuties: 4 },
      ],
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'team-bravo',
      name: 'Bravo Team',
      leadName: 'Sarah Wilson',
      members: [
        { id: 'm4', name: 'Michael Brown', lastDutyDate: '2024-01-14', totalDuties: 6 },
        { id: 'm5', name: 'Emma Davis', lastDutyDate: '2024-01-08', totalDuties: 2 },
      ],
      createdAt: '2024-01-02T00:00:00.000Z'
    }
  ];
};

// Load team authentication data
const loadTeamAuthFromStorage = (): Record<string, { password: string }> => {
  const stored = localStorage.getItem('team-auth');
  return stored ? JSON.parse(stored) : {
    'team-alpha': { password: 'alpha123' },
    'team-bravo': { password: 'bravo123' }
  };
};

// Initialize data
let teams = loadTeamsFromStorage();
let teamAuth = loadTeamAuthFromStorage();

interface Team {
  id: string;
  name: string;
  leadName: string;
  members: TeamMember[];
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  lastDutyDate?: string;
  totalDuties: number;
}

const CQPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [leadName, setLeadName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [existingTeamId, setExistingTeamId] = useState('');
  const [existingPassword, setExistingPassword] = useState('');

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (password.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    // Generate team ID
    const teamId = `team-${Date.now()}`;
    
    // Create team object
    const newTeam: Team = {
      id: teamId,
      name: teamName,
      leadName: leadName,
      members: [],
      createdAt: new Date().toISOString()
    };
    
    teams.push(newTeam);
    teamAuth[teamId] = { password };
    
    localStorage.setItem('duty-teams', JSON.stringify(teams));
    localStorage.setItem('team-auth', JSON.stringify(teamAuth));

    // Navigate to team dashboard
    navigate(`/team/${teamId}`);
  };

  const handleAccessTeam = () => {
    if (!existingTeamId || !existingPassword) {
      alert('Please enter Team ID and Password');
      return;
    }

    const teamAuth = JSON.parse(localStorage.getItem('team-auth') || '{}');
    
    if (teamAuth[existingTeamId]?.password === existingPassword) {
      navigate(`/team/${existingTeamId}`);
    } else {
      alert('Invalid Team ID or Password');
    }
  };

  return (
    <div className="cq-page">
      <header className="cq-header">
        <h1>Duty Scheduler</h1>
        <p className="tagline">Team Duty Organization</p>
      </header>

      <main className="cq-main">
        {!isCreatingTeam ? (
          <div className="checkin-card">
            <h2>Team Lead Check-In</h2>
            <p className="instructions">
              Create or access your team's duty schedule
            </p>
            
            <div className="form-section">
              <div className="form-group">
                <label>Team ID</label>
                <input
                  type="text"
                  value={existingTeamId}
                  onChange={(e) => setExistingTeamId(e.target.value)}
                  placeholder="Enter your Team ID"
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={existingPassword}
                  onChange={(e) => setExistingPassword(e.target.value)}
                  placeholder="Enter team password"
                  className="input-field"
                />
              </div>
              
              <button 
                onClick={handleAccessTeam}
                className="btn-primary"
                disabled={!existingTeamId || !existingPassword}
              >
                Access Team
              </button>
            </div>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <button 
              onClick={() => setIsCreatingTeam(true)}
              className="btn-secondary"
            >
              Create New Team
            </button>
          </div>
        ) : (
          <div className="create-team-card">
            <h2>Create New Team</h2>
            
            <form onSubmit={handleCreateTeam} className="create-team-form">
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Alpha Shift, Bravo Team"
                  className="input-field"
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Your Name (Team Lead)</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your name"
                  className="input-field"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={4}
                  placeholder="At least 4 characters"
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={4}
                  placeholder="Confirm your password"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsCreatingTeam(false)}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!teamName || !leadName || !password || !confirmPassword}
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      
      <footer className="cq-footer">
        <p>Data stored locally in your browser</p>
      </footer>
    </div>
  );
};

export default CQPage;