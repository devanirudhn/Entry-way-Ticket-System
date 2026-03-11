import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('attendee');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="glass-card w-full max-w-md relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 text-center">Create Account</h2>
          <p className="text-slate-400 text-center mb-6">Join EntryWay to start your journey</p>
          
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="6+ characters"
                minLength="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">I want to...</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border ${role === 'attendee' ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-700 bg-slate-800/50 text-slate-400'} cursor-pointer transition-all`}>
                  <input type="radio" name="role" value="attendee" className="hidden" checked={role === 'attendee'} onChange={() => setRole('attendee')} />
                  Book Tickets
                </label>
                <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border ${role === 'organizer' ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-700 bg-slate-800/50 text-slate-400'} cursor-pointer transition-all`}>
                  <input type="radio" name="role" value="organizer" className="hidden" checked={role === 'organizer'} onChange={() => setRole('organizer')} />
                  Host Events
                </label>
              </div>
            </div>
            
            <button type="submit" className="btn-primary w-full py-3 mt-6 text-lg">
              Sign Up
            </button>
          </form>
          
          <p className="mt-6 text-center text-slate-400">
            Already have an account? <Link to="/login" className="text-indigo-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
