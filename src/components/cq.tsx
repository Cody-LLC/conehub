import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './cq.css';

// Supabase setup
const supabaseUrl = import.meta.env.VITE_URL;
const supabaseKey = import.meta.env.VITE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CQPage: React.FC = () => {
  // State
  const [teams, setTeams] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  // Form state
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Load teams
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name');
      if (error) throw error;
      setTeams(data || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: teamName,
          password: password
        }])
        .select()
        .single();
      if (error) throw error;
      setTeams([data, ...teams]);
      setTeamName('');
      setPassword('');
      setConfirmPassword('');
      setShowModal(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    }
  };

  // Delete team function
  const deleteTeam = async (teamId: number) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      if (error) throw error;
      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
      setShowScheduleModal(false);
      alert('✅ Team deleted successfully!');
    } catch (err: any) {
      alert(`❌ Failed to delete team: ${err.message}`);
    }
  };

  const handleViewClick = (team: any) => {
    setSelectedTeam(team);
    setShowScheduleModal(true);
  };

  return (
    <div className="cq-page">
      {/* Header */}
      <header className="cq-header">
        <h1>CQ Schedule</h1>
        <p>Manage team duty assignments</p>
      </header>

      {/* Main Content */}
      <main className="cq-main">
        {/* CREATE TEAM BUTTON */}
        <div className="create-button-container">
          <button 
            className="btn btn-primary create-team-btn"
            onClick={() => setShowModal(true)}
          >
            Create New Team
          </button>
        </div>

        {/* Teams List */}
        {loading ? (
          <p>Loading...</p>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <p>No teams yet. Create one!</p>
          </div>
        ) : (
          <div className="teams-list">
            {teams.map((team) => (
              <div key={team.id} className="team-item">
                <h3>{team.name}</h3>
                <p>ID: {team.id}</p>
                <button 
                  className="btn btn-primary team-button"
                  onClick={() => handleViewClick(team)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE TEAM MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal create-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="create-modal-header">
              <h2>Create New Team</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleCreateTeam} className="create-form">
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="form-input"
                  required
                  minLength={4}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="form-input"
                  required
                />
              </div>
              
              {/* Buttons */}
              <div className="form-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={!teamName || !password || !confirmPassword}
                >
                  Create Team
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}

      {/* SCHEDULE OVERLAY */}
      {showScheduleModal && selectedTeam && (
        <div className="schedule-overlay">
          <div className="schedule-header">
            <div className="header-left">
              <h1 className="schedule-title">{selectedTeam.name}</h1>
              <p className="schedule-subtitle">Team ID: {selectedTeam.id}</p>
            </div>
            <div className='header-buttons'>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowScheduleModal(false)}
              >
                ← Back to Teams
              </button>

              <button 
                className="btn btn-danger"
                onClick={() => {
                  if (confirm(`Delete team "${selectedTeam.name}"?`)) {
                    deleteTeam(selectedTeam.id);
                  }
                }}
              >
                Delete Team
              </button>
            </div>
          </div>
          
          {/* Main Schedule Grid */}
          <div className="schedule-main">
            <div className="compact-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="day-column">
                  <div className="day-header">
                    <h3>{day}</h3>
                  </div>
                  
                  {/* 3 Shifts per day */}
                  <div className="compact-shifts">
                    <div className="compact-shift">
                      <div className="shift-time">00-08</div>
                    </div>
                    
                    <div className="compact-shift">
                      <div className="shift-time">08-16</div>
                    </div>
                    
                    <div className="compact-shift">
                      <div className="shift-time">16-00</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="schedule-footer">
            <button className="btn btn-primary save-button">
              Save Schedule
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CQPage;