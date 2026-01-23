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
  member_count?: number | null;
  created_at: string;
}

const CQPage: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create team form state
  const [teamName, setTeamName] = useState('');
  const [leadName, setLeadName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Load teams on mount
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      // Get teams with member count
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, lead_name, created_at')
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { count, error: countError } = await supabase
            .from('Members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);

          return {
            ...team,
            member_count: countError ? 0 : count
          };
        })
      );

      setTeams(teamsWithCounts);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
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

      // Add to teams list
      setTeams([{ ...teamData, member_count: 0 }, ...teams]);
      
      // Reset and close
      setTeamName('');
      setLeadName('');
      setPassword('');
      setConfirmPassword('');
      setShowCreateModal(false);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
      console.error('Create team error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTeamClick = (teamId: string) => {
    navigate(`/team/${teamId}`);
  };

  return (
    <div className="cq-page">
      {/* Header with Create Button */}
      <header className="cq-header">
        <div className="header-left">
          <h1 className="cq-title">Duty Scheduler</h1>
          <p className="cq-subtitle">Select a team to manage duty assignments</p>
        </div>
        <button 
          className="create-team-header-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="plus-icon">+</span> Create Team
        </button>
      </header>

      {/* Main Content */}
      <main className="cq-main">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Teams Yet</h2>
            <p>Create your first team to start managing duty schedules</p>
            <button 
              className="create-first-btn"
              onClick={() => setShowCreateModal(true)}
            >
              Create First Team
            </button>
          </div>
        ) : (
          <div className="teams-grid">
            {teams.map((team) => (
              <div 
                key={team.id} 
                className="team-card"
                onClick={() => handleTeamClick(team.id)}
              >
                <div className="team-card-header">
                  <div className="team-name-section">
                    <h3 className="team-name">{team.name}</h3>
                    <div className="member-badge">
                      {team.member_count || 0} members
                    </div>
                  </div>
                  <div className="team-status active">Active</div>
                </div>
                
                <div className="team-card-body">
                  <div className="team-info-item">
                    <span className="info-label">Lead:</span>
                    <span className="info-value">{team.lead_name}</span>
                  </div>
                  <div className="team-info-item">
                    <span className="info-label">Created:</span>
                    <span className="info-value">
                      {new Date(team.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="team-card-footer">
                  <button 
                    className="access-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTeamClick(team.id);
                    }}
                  >
                    Access Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Team</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {error && (
                <div className="modal-error">
                  {error}
                  <button 
                    onClick={() => setError('')}
                    className="error-close"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <form onSubmit={handleCreateTeam} className="modal-form">
                <div className="form-group">
                  <label htmlFor="teamName">Team Name *</label>
                  <input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., Alpha Shift, Bravo Team"
                    required
                    autoFocus
                    disabled={isCreating}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="leadName">Your Name (Team Lead) *</label>
                  <input
                    id="leadName"
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={isCreating}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Create Password *</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    required
                    minLength={4}
                    disabled={isCreating}
                  />
                  <small className="field-hint">This password will be securely hashed</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={4}
                    disabled={isCreating}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={!teamName || !leadName || !password || !confirmPassword || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <span className="spinner"></span>
                        Creating...
                      </>
                    ) : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <footer className="cq-footer">
        <p>Data securely stored in Supabase database</p>
      </footer>
    </div>
  );
};

export default CQPage;