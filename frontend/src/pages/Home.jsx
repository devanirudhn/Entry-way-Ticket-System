import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('/api/events');
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleBook = async (eventId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'attendee') {
      alert("Only attendees can book tickets!");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/bookings', { eventId }, config);
      alert('Ticket booked successfully! Check your dashboard.');
      // Refresh events to update available count
      const { data } = await axios.get('/api/events');
      setEvents(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking ticket');
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-16 relative">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
          Discover <span className="gradient-text">Incredible Events</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Get your tickets now using our secure QR code system.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 animate-pulse text-xl">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-slate-400 py-20 border border-slate-700/50 rounded-2xl glass mx-auto max-w-lg">
          No upcoming events available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event._id} className="glass-card flex flex-col group hover:border-indigo-500/50 transition-colors">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-500/30">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{event.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-slate-300">
                    <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                    {event.availableTickets} / {event.totalTickets} tickets available
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleBook(event._id)}
                disabled={event.availableTickets <= 0}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 uppercase tracking-wide text-sm ${
                  event.availableTickets > 0 
                  ? 'bg-white text-indigo-900 hover:bg-indigo-100 shadow-lg hover:shadow-white/20' 
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {event.availableTickets > 0 ? 'Book Ticket' : 'Sold Out'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
