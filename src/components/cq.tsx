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
  
  // Form state - ONLY 3 fields
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
  // Create team - SIMPLE VERSION
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
          password: password  // ← Plain text password!
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
  const deleteTeam = async (teamId: number) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }
    try {      // 2. Call Supabase to delete
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId); // Delete by ID
      if (error) throw error;
      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
      alert('Team deleted successfully!');
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Failed to delete team: ${err.message}`);
    }
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
            className="create-team-btn"
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
                <div key={team.id} className="team-item" onClick={() => console.log('Clicked team:', team.id)}>
                  <h3>{team.name}</h3>
                  <p>ID: {team.id}</p>
                  <button className="team-button">View</button>
                </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL - Only 3 fields */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Team</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleCreateTeam}>
              {/* Field 1: Team Name */}
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  required
                />
              </div>
              
              {/* Field 2: Password */}
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  required
                  minLength={4}
                />
              </div>
              
              {/* Field 3: Confirm Password */}
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
              
              {/* Buttons */}
              <div className="modal-buttons">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!teamName || !password || !confirmPassword}
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CQPage;