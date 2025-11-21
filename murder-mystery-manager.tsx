import React, { useState, useEffect } from 'react';
import { Shuffle, Eye, EyeOff, Trash2, Plus, Edit2, Lock } from 'lucide-react';

export default function MurderMysteryManager() {
  const [view, setView] = useState('player');
  const [characters, setCharacters] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [playerName, setPlayerName] = useState('');
  const [showBackstory, setShowBackstory] = useState(false);
  const [editingChar, setEditingChar] = useState(null);
  const [newChar, setNewChar] = useState({ name: '', backstory: '' });
  const [newAssignment, setNewAssignment] = useState({ player: '', characterId: '' });
  const [loading, setLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const charResult = await window.storage.get('mm-characters', true);
      const assignResult = await window.storage.get('mm-assignments', true);
      
      if (charResult) setCharacters(JSON.parse(charResult.value));
      if (assignResult) setAssignments(JSON.parse(assignResult.value));
    } catch (error) {
      console.log('No existing data found');
    }
    setLoading(false);
  };

  const saveCharacters = async (chars) => {
    setCharacters(chars);
    try {
      await window.storage.set('mm-characters', JSON.stringify(chars), true);
    } catch (error) {
      console.error('Failed to save characters:', error);
    }
  };

  const saveAssignments = async (assigns) => {
    setAssignments(assigns);
    try {
      await window.storage.set('mm-assignments', JSON.stringify(assigns), true);
    } catch (error) {
      console.error('Failed to save assignments:', error);
    }
  };

  const addCharacter = () => {
    if (newChar.name.trim()) {
      saveCharacters([...characters, { id: Date.now(), ...newChar }]);
      setNewChar({ name: '', backstory: '' });
    }
  };

  const updateCharacter = () => {
    saveCharacters(characters.map(c => c.id === editingChar.id ? editingChar : c));
    setEditingChar(null);
  };

  const deleteCharacter = (id) => {
    saveCharacters(characters.filter(c => c.id !== id));
    const newAssignments = Object.fromEntries(
      Object.entries(assignments).filter(([_, charId]) => charId !== id)
    );
    saveAssignments(newAssignments);
  };

  const addOrUpdateAssignment = () => {
    if (newAssignment.player.trim() && newAssignment.characterId) {
      const newAssignments = {
        ...assignments,
        [newAssignment.player.trim()]: parseInt(newAssignment.characterId)
      };
      saveAssignments(newAssignments);
      setNewAssignment({ player: '', characterId: '' });
    }
  };

  const removeAssignment = (player) => {
    const newAssignments = { ...assignments };
    delete newAssignments[player];
    saveAssignments(newAssignments);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const randomAssign = () => {
    const playerNames = prompt('Enter player names separated by commas (e.g., Samhita, Sai, Alex):');
    if (!playerNames) return;
    
    const players = playerNames.split(',').map(p => p.trim()).filter(p => p);
    if (players.length === 0 || characters.length === 0) {
      alert('Need both players and characters!');
      return;
    }
    
    const shuffledChars = shuffleArray(characters);
    const newAssignments = {};
    
    players.forEach((player, index) => {
      newAssignments[player] = shuffledChars[index % shuffledChars.length].id;
    });
    
    saveAssignments(newAssignments);
    alert(`Assigned ${players.length} players to characters!`);
  };

  const getCharacterById = (id) => {
    return characters.find(c => c.id === id);
  };

  const findPlayerCharacter = () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) return null;
    
    const assignedPlayer = Object.keys(assignments).find(
      p => p.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (assignedPlayer) {
      return getCharacterById(assignments[assignedPlayer]);
    }
    return null;
  };

  const checkAdminPassword = () => {
    if (passwordInput === 'sam') {
      setIsAdminAuthenticated(true);
      setPasswordInput('');
    } else {
      alert('Incorrect password!');
      setPasswordInput('');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-red-900 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">🔪 Murder Mystery Party</h1>
        </div>
      </div>

      {/* View Toggle */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              setView('player');
              setPlayerName('');
              setShowBackstory(false);
            }}
            className={`px-6 py-2 rounded ${view === 'player' ? 'bg-red-700' : 'bg-slate-700'} hover:bg-red-600 transition`}
          >
            Player View
          </button>
          <button
            onClick={() => {
              setView('admin');
              setIsAdminAuthenticated(false);
            }}
            className={`px-6 py-2 rounded ${view === 'admin' ? 'bg-red-700' : 'bg-slate-700'} hover:bg-red-600 transition`}
          >
            <Lock className="inline w-4 h-4 mr-2" />
            Admin Panel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {view === 'player' && (
          <div className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Discover Your Character</h2>
            
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setShowBackstory(false);
                }}
                className="w-full px-4 py-3 rounded bg-slate-700 mb-4 border-2 border-slate-600 focus:border-red-500 outline-none text-lg text-center"
              />
              
              {playerName.trim() && (() => {
                const character = findPlayerCharacter();
                if (character) {
                  return (
                    <div className="bg-red-900 rounded-lg p-6 border-2 border-red-600 mt-6">
                      <h3 className="text-center text-xl mb-2 text-slate-300">You are:</h3>
                      <h4 className="text-4xl font-bold text-center mb-6 text-red-300">{character.name}</h4>
                      
                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-lg">Your Backstory:</h5>
                          <button
                            onClick={() => setShowBackstory(!showBackstory)}
                            className="text-red-300 hover:text-red-200 transition"
                          >
                            {showBackstory ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {showBackstory ? (
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{character.backstory}</p>
                        ) : (
                          <p className="text-slate-500 italic text-center py-4">Click the eye icon to reveal your backstory</p>
                        )}
                      </div>
                      
                      <p className="text-center text-slate-400 text-sm mt-4">
                        📝 Remember your character and backstory for the party!
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-slate-700 rounded-lg p-6 text-center">
                      <p className="text-yellow-400 text-lg">
                        ⚠️ No character assigned to "{playerName}"
                      </p>
                      <p className="text-slate-400 mt-2 text-sm">
                        Please check your name spelling or contact the party organizer.
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {view === 'admin' && !isAdminAuthenticated && (
          <div className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
            
            <div className="max-w-md mx-auto">
              <div className="bg-slate-700 rounded-lg p-6">
                <Lock className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <p className="text-center text-slate-300 mb-4">Enter admin password to continue</p>
                <input
                  type="password"
                  placeholder="Enter password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkAdminPassword()}
                  className="w-full px-4 py-3 rounded bg-slate-600 mb-4 border-2 border-slate-500 focus:border-red-500 outline-none text-center"
                  autoFocus
                />
                <button
                  onClick={checkAdminPassword}
                  className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded transition font-semibold"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && isAdminAuthenticated && (
          <div className="space-y-6">
            {/* Manage Characters */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Manage Characters</h2>
              
              {/* Add/Edit Form */}
              <div className="bg-slate-700 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-3">
                  {editingChar ? 'Edit Character' : 'Add New Character'}
                </h3>
                <input
                  type="text"
                  placeholder="Character name (e.g., Doctor, Policeman)"
                  value={editingChar ? editingChar.name : newChar.name}
                  onChange={(e) => editingChar 
                    ? setEditingChar({...editingChar, name: e.target.value})
                    : setNewChar({...newChar, name: e.target.value})
                  }
                  className="w-full px-4 py-2 rounded bg-slate-600 mb-3 border border-slate-500 focus:border-red-500 outline-none"
                />
                <textarea
                  placeholder="Character backstory..."
                  value={editingChar ? editingChar.backstory : newChar.backstory}
                  onChange={(e) => editingChar
                    ? setEditingChar({...editingChar, backstory: e.target.value})
                    : setNewChar({...newChar, backstory: e.target.value})
                  }
                  className="w-full px-4 py-2 rounded bg-slate-600 mb-3 border border-slate-500 focus:border-red-500 outline-none h-32"
                />
                <button
                  onClick={editingChar ? updateCharacter : addCharacter}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded transition"
                >
                  {editingChar ? 'Update' : 'Add Character'}
                </button>
                {editingChar && (
                  <button
                    onClick={() => setEditingChar(null)}
                    className="bg-slate-600 hover:bg-slate-500 px-6 py-2 rounded ml-2 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Character List */}
              <div className="space-y-3">
                {characters.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No characters yet.</p>
                ) : (
                  characters.map(char => (
                    <div key={char.id} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold">{char.name}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingChar(char)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCharacter(char.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{char.backstory}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Manage Assignments */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Assign Players to Characters</h2>
              
              {/* Quick Random Assignment */}
              <div className="bg-slate-700 rounded-lg p-4 mb-4">
                <button
                  onClick={randomAssign}
                  disabled={characters.length === 0}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded transition font-semibold w-full"
                >
                  <Shuffle className="inline w-5 h-5 mr-2" />
                  Quick Random Assignment
                </button>
                <p className="text-slate-400 text-sm mt-2">
                  You'll be prompted to enter player names, then they'll be randomly assigned to characters.
                </p>
              </div>

              {/* Manual Assignment */}
              <div className="bg-slate-700 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-3">Manual Assignment</h3>
                <input
                  type="text"
                  placeholder="Player name"
                  value={newAssignment.player}
                  onChange={(e) => setNewAssignment({...newAssignment, player: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-slate-600 mb-3 border border-slate-500 focus:border-red-500 outline-none"
                />
                <select
                  value={newAssignment.characterId}
                  onChange={(e) => setNewAssignment({...newAssignment, characterId: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-slate-600 mb-3 border border-slate-500 focus:border-red-500 outline-none"
                >
                  <option value="">Select a character...</option>
                  {characters.map(char => (
                    <option key={char.id} value={char.id}>{char.name}</option>
                  ))}
                </select>
                <button
                  onClick={addOrUpdateAssignment}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded transition"
                >
                  Assign Character
                </button>
              </div>

              {/* Current Assignments */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Current Assignments</h3>
                {Object.keys(assignments).length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No assignments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(assignments).map(([player, charId]) => {
                      const char = getCharacterById(charId);
                      return (
                        <div key={player} className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                          <span>
                            <span className="font-semibold">{player}</span>
                            {char && <span className="text-red-300 ml-2">→ {char.name}</span>}
                          </span>
                          <button
                            onClick={() => removeAssignment(player)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}