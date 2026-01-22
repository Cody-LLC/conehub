import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './cq.css';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_URL;
const supabaseKey = import.meta.env.VITE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Team {
  id: string;
  name: string;
  lead_name: string;
  password_hash: string;
  created_at: string;
}

interface Member {
  id: string;
  team_id: string;
  name: string;
  last_duty_date?: string;
  total_duties: number;
  created_at: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Hash password (simple client-side hash - for production use proper auth)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match!');
      }

      if (password.length < 4) {
        throw new Error('Password must be at least 4 characters');
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate team ID
      const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Insert team into Supabase
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([
          {
            id: teamId,
            name: teamName,
            lead_name: leadName,
            password_hash: passwordHash,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (teamError) throw teamError;

      // Navigate to team dashboard
      navigate(`/team/${teamId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
      console.error('Create team error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessTeam = async () => {
    if (!existingTeamId || !existingPassword) {
      setError('Please enter Team ID and Password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get team from Supabase
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', existingTeamId)
        .single();

      if (teamError) throw new Error('Team not found');

      // Hash provided password and compare
      const providedHash = await hashPassword(existingPassword);
      
      if (team.password_hash !== providedHash) {
        throw new Error('Invalid password');
      }

      // Navigate to team dashboard
      navigate(`/team/${team.id}`);
    } catch (err: any) {
      setError(err.message || 'Invalid Team ID or Password');
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Fetch recent teams for demo/showcase
  const [recentTeams, setRecentTeams] = useState<Team[]>([]);
  
  useEffect(() => {
    const fetchRecentTeams = async () => {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) setRecentTeams(data);
    };
    
    fetchRecentTeams();
  }, []);

  return (
    <div className="cq-page">
      <header className="cq-header">
        <h1>Duty Scheduler</h1>
        <p className="tagline">Team Duty Organization</p>
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              
              <button 
                onClick={handleAccessTeam}
                className="btn-primary"
                disabled={!existingTeamId || !existingPassword || isLoading}
              >
                {isLoading ? 'Loading...' : 'Access Team'}
              </button>
            </div>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <button 
              onClick={() => setIsCreatingTeam(true)}
              className="btn-secondary"
              disabled={isLoading}
            >
              Create New Team
            </button>

            {/* Recent Teams Preview */}
            {recentTeams.length > 0 && (
              <div className="recent-teams">
                <h3>Recent Teams</h3>
                <ul>
                  {recentTeams.map(team => (
                    <li key={team.id}>
                      <strong>{team.name}</strong> • {team.lead_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="create-team-card">
            <h2>Create New Team</h2>
            <p className="instructions">
              Your team data will be securely stored in the cloud
            </p>
            
            <form onSubmit={handleCreateTeam} className="create-team-form">
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Alpha Shift, Bravo Team"
                  className="input-field"
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label>Your Name (Team Lead) *</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your name"
                  className="input-field"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label>Create Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={4}
                  placeholder="At least 4 characters"
                  disabled={isLoading}
                />
                <small>This password will be securely hashed</small>
              </div>
              
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={4}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsCreatingTeam(false)}
                  disabled={isLoading}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!teamName || !leadName || !password || !confirmPassword || isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      
      <footer className="cq-footer">
        <p>Data securely stored in Supabase database</p>
        <p className="supabase-info">
          Connected to: {supabaseUrl?.replace('https://', '').split('.')[0]}
        </p>
      </footer>
    </div>
  );
};

export default CQPage;