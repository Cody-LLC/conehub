import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './cq.css';

// Supabase setup
const supabaseUrl = import.meta.env.VITE_URL;
const supabaseKey = import.meta.env.VITE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
type Team = { id: number; name: string };
type Member = { id: number; name: string; team_id: number };
type Assignment = { day_of_week: string; shift_index: number; member_id: number | null };

const CQPage: React.FC = () => {
  // ---------- State ----------
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formSubmit, setFormSubmit] = useState<(text: string) => void>(() => {});
  const [inputForm, setInputForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);   // view mode
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null); // edit mode
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, number>>({}); // key: "Mon-0" -> member_id

  // Form state (create team)
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [oneForm, setOneForm] = useState('');

  // Member picker state
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<number>(0);

  // ---------- Load Data ----------
  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    const team = selectedTeam2 || selectedTeam;
    if (team) {
      loadMembers();
      loadAssignments();
    }
  }, [selectedTeam, selectedTeam2]);

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

  const loadMembers = async () => {
    const team = selectedTeam2 || selectedTeam;
    if (!team?.id) return;
    setLoadingMembers(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('team_id', team.id);
    if (error) console.error('Load members error:', error);
    setMembers(data || []);
    setLoadingMembers(false);
  };

  const loadAssignments = async () => {
    const team = selectedTeam2 || selectedTeam;
    if (!team?.id) return;
    const { data, error } = await supabase
      .from('assignments')
      .select('day_of_week, shift_index, member_id')
      .eq('team_id', team.id);
    if (error) {
      console.error('Load assignments error:', error);
      return;
    }
    const map: Record<string, number> = {};
    data.forEach((row) => {
      if (row.member_id !== null) {
        map[`${row.day_of_week}-${row.shift_index}`] = row.member_id;
      }
    });
    setAssignments(map);
  };

  // ---------- Team CRUD ----------
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
        .insert([{ name: teamName, password }])
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
    try {
      // Delete members first
      const { error: membersError } = await supabase
        .from('members')
        .delete()
        .eq('team_id', teamId);
      if (membersError) throw membersError;

      // Delete team
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      if (teamError) throw teamError;

      setTeams(prev => prev.filter(team => team.id !== teamId));
      setSelectedTeam2(null);
      setSelectedTeam(null);
      alert('✅ Team and all members deleted successfully!');
    } catch (err: any) {
      alert(`❌ Failed to delete: ${err.message}`);
    }
  };

  // ---------- Password Check (for Edit) ----------
  const checkPassword = async (enteredPassword: string) => {
    try {
      const { data: teamData, error } = await supabase
        .from('teams')
        .select('password')
        .eq('id', selectedTeam?.id)
        .single();
      if (error) throw error;
      if (teamData.password === enteredPassword) {
        setSelectedTeam2(selectedTeam); // switch to edit mode
      } else {
        alert('❌ Wrong password!');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // ---------- Member (Cone) Management ----------
  const addCone = async (coneName: string) => {
    const team = selectedTeam2 || selectedTeam;
    if (!team?.id) {
      alert('❌ No team selected!');
      return;
    }
    try {
      const { error } = await supabase
        .from('members')
        .insert([{ name: coneName.trim(), team_id: team.id }])
        .select()
        .single();
      if (error) throw error;
      alert(`✅ Added "${coneName}" to ${team.name}!`);
      await loadMembers();
    } catch (err: any) {
      alert(`❌ Failed to add cone: ${err.message}`);
    }
  };

  const deleteMember = async (memberId: number) => {
    if (!confirm('Delete this member?')) return;
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
      // Also remove from assignments if assigned
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(key => {
        if (newAssignments[key] === memberId) {
          delete newAssignments[key];
        }
      });
      setAssignments(newAssignments);
      alert('✅ Member deleted!');
    } catch (err: any) {
      alert(`❌ Failed to delete: ${err.message}`);
    }
  };

  // ---------- Shift Assignment Functions ----------
  const handleShiftClick = (day: string, shiftIndex: number) => {
    const key = `${day}-${shiftIndex}`;
    const currentMemberId = assignments[key] || null;

    if (currentMemberId) {
      // Remove assignment
      if (confirm('Remove this member from the shift?')) {
        removeAssignment(day, shiftIndex);
      }
    } else {
      // Show member picker
      setSelectedDay(day);
      setSelectedShift(shiftIndex);
      setShowMemberPicker(true);
    }
  };

  const removeAssignment = async (day: string, shiftIndex: number) => {
    const team = selectedTeam2 || selectedTeam;
    if (!team?.id) return;
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('team_id', team.id)
        .eq('day_of_week', day)
        .eq('shift_index', shiftIndex);
      if (error) throw error;
      // Update local state
      const newMap = { ...assignments };
      delete newMap[`${day}-${shiftIndex}`];
      setAssignments(newMap);
    } catch (err: any) {
      alert(`❌ Failed to remove assignment: ${err.message}`);
    }
  };

  const assignMember = async (memberId: number) => {
    const team = selectedTeam2 || selectedTeam;
    if (!team?.id) return;
    try {
      const { error } = await supabase
        .from('assignments')
        .upsert(
          {
            team_id: team.id,
            day_of_week: selectedDay,
            shift_index: selectedShift,
            member_id: memberId,
          },
          { onConflict: 'team_id, day_of_week, shift_index' }
        );
      if (error) throw error;
      setAssignments(prev => ({
        ...prev,
        [`${selectedDay}-${selectedShift}`]: memberId,
      }));
      setShowMemberPicker(false);
    } catch (err: any) {
      alert(`❌ Failed to assign: ${err.message}`);
    }
  };

  // ---------- Render Helpers ----------
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shiftLabels = ['00-08', '08-16', '16-00'];
  const shiftIndices = [0, 1, 2];

  const renderSchedule = (editable: boolean) => {
    const team = editable ? selectedTeam2 : selectedTeam;
    if (!team) return null;

    return (
      <div className="schedule-main">
        <div className="compact-grid">
          {days.map(day => (
            <div key={day} className="day-column">
              <div className="day-header"><h3>{day}</h3></div>
              <div className="compact-shifts">
                {shiftIndices.map(index => {
                  const key = `${day}-${index}`;
                  const memberId = assignments[key] || null;
                  const member = members.find(m => m.id === memberId);
                  const displayName = member ? member.name : '—';

                  return (
                    <div
                      key={key}
                      className={`compact-shift ${editable ? 'clickable' : ''}`}
                      onClick={() => editable && handleShiftClick(day, index)}
                      style={{ cursor: editable ? 'pointer' : 'default' }}
                    >
                      <div className="shift-time">{shiftLabels[index]}</div>
                      <div className="shift-assignee">{displayName}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------- Render ----------
  return (
    <div className="cq-page">
      {/* Header */}
      <header className="cq-header">
        <h1>CQ Schedule</h1>
        <p>Manage team duty assignments</p>
      </header>

      {/* Main Content */}
      <main className="cq-main">
        <div className="create-button-container">
          <button className="btn btn-primary create-team-btn" onClick={() => setShowModal(true)}>
            Create New Team
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : teams.length === 0 ? (
          <div className="empty-state"><p>No teams yet. Create one!</p></div>
        ) : (
          <div className="teams-list">
            {teams.map(team => (
              <div key={team.id} className="team-item">
                <h3>{team.name}</h3>
                <p>ID: {team.id}</p>
                <button
                  className="btn btn-primary team-button"
                  onClick={() => setSelectedTeam(team)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ---------- CREATE TEAM MODAL ---------- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal create-modal" onClick={e => e.stopPropagation()}>
            <div className="create-modal-header">
              <h2>Create New Team</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error-message"><span>⚠️</span> {error}</div>}
            <form onSubmit={handleCreateTeam} className="create-form">
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
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
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

      {/* ---------- SCHEDULE VIEW (READ‑ONLY) ---------- */}
      {selectedTeam && !selectedTeam2 && (
        <div className="schedule-overlay">
          <div className="schedule-header">
            <div className="header-left">
              <h1 className="schedule-title">{selectedTeam.name}</h1>
              <p className="schedule-subtitle">Team ID: {selectedTeam.id}</p>
            </div>
            <div className="header-buttons">
              <button className="btn btn-secondary" onClick={() => setSelectedTeam(null)}>
                ← Back to Teams
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setInputForm(true);
                  setFormSubmit(() => (text: string) => {
                    checkPassword(text);
                  });
                }}
              >
                Edit
              </button>
            </div>
          </div>
          {renderSchedule(false)}
        </div>
      )}

      {/* ---------- SCHEDULE EDIT (WITH ASSIGNMENTS) ---------- */}
      {selectedTeam2 && (
        <div className="schedule-overlay">
          <div className="schedule-header">
            <div className="header-left">
              <h1 className="schedule-title">{selectedTeam2.name}</h1>
              <p className="schedule-subtitle">Team ID: {selectedTeam2.id}</p>
            </div>
            <div className="header-buttons">
              <button className="btn btn-secondary" onClick={() => { setSelectedTeam2(null); setSelectedTeam(null); }}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setInputForm(true);
                  setFormSubmit(() => (text: string) => {
                    addCone(text);
                  });
                }}
              >
                Add Cone
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (confirm(`Delete ${selectedTeam2.name}?`)) {
                    deleteTeam(selectedTeam2.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>

          {renderSchedule(true)}

          {/* Members List */}
          <div className="members-grid">
            {loadingMembers ? (
              <p className="loading-text">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="empty-text">No members yet. Add one with "Add Cone"!</p>
            ) : (
              <div className="members-list">
                {members.map(member => (
                  <div key={member.id} className="member-item">
                    <span className="member-name">{member.name}</span>
                    <button
                      className="btn btn-danger member-delete-btn"
                      onClick={() => deleteMember(member.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- MEMBER PICKER MODAL ---------- */}
      {showMemberPicker && (
        <div className="modal-overlay" onClick={() => setShowMemberPicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="create-modal-header">
              <h3>Assign to {selectedDay} {shiftLabels[selectedShift]}</h3>
              <button className="modal-close-btn" onClick={() => setShowMemberPicker(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
              {members.length === 0 ? (
                <p>No members available. Add a cone first.</p>
              ) : (
                members.map(m => (
                  <button
                    key={m.id}
                    className="btn btn-primary"
                    onClick={() => assignMember(m.id)}
                    style={{ width: '100%' }}
                  >
                    {m.name}
                  </button>
                ))
              )}
              <button className="btn btn-secondary" onClick={() => setShowMemberPicker(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- GLOBAL INPUT FORM (for password / add cone) ---------- */}
      {inputForm && (
        <div className="form-main" style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={oneForm}
            onChange={e => setOneForm(e.target.value)}
            placeholder="Enter text"
            className="form-input"
          />
          <div className="form-buttons">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (oneForm.trim()) {
                  formSubmit(oneForm);
                  setOneForm('');
                  setInputForm(false);
                }
              }}
            >
              Submit
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setOneForm('');
                setInputForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CQPage;