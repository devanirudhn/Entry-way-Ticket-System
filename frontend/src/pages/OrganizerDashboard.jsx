import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const OrganizerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  
  // Scanner state
  const [scanTicketId, setScanTicketId] = [useState(''), (val) => setScanTicketIdState(val)];
  const [scanEventId, setScanEventId] = useState('');
  const [scanMessage, setScanMessage] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('/api/events');
      // Filter only events created by this organizer
      setEvents(data.filter(e => e.organizer._id === user._id));
    } catch (error) {
      console.error('Error fetching organizer events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events', { title, description, date, location, totalTickets: Number(totalTickets) }, config);
      setTitle(''); setDescription(''); setDate(''); setLocation(''); setTotalTickets('');
      fetchEvents();
      alert('Event created successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating event');
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/bookings/scan', { ticketId: scanTicketId, eventId: scanEventId }, config);
      setScanMessage({ type: 'success', text: `Success! Valid ticket for ${data.attendee.name}` });
      setScanTicketId('');
    } catch (error) {
      setScanMessage({ type: 'error', text: error.response?.data?.message || 'Invalid Ticket' });
    }
  };

  const setScanTicketIdState = setScanTicketId;

  return (
    <div className="py-6">
      <h1 className="text-4xl font-bold mb-8">Organizer <span className="gradient-text">Dashboard</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Create Event Form */}
        <div className="glass-card">
          <h2 className="text-2xl font-semibold mb-6">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <input type="text" placeholder="Event Title" required className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <textarea placeholder="Event Description" required className="input-field min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" required className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
              <input type="text" placeholder="Location" required className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <input type="number" placeholder="Total Tickets" required className="input-field" value={totalTickets} onChange={(e) => setTotalTickets(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full shadow-indigo-500/20">Publish Event</button>
          </form>
        </div>

        {/* Validate Ticket Form */}
        <div className="glass-card">
          <h2 className="text-2xl font-semibold mb-6">Validate Ticket</h2>
          <p className="text-slate-400 mb-6 text-sm">Select an event and enter the Ticket ID from an attendee's QR code to validate entry.</p>
          
          <form onSubmit={handleScan} className="space-y-4">
            <select required className="input-field appearance-none" value={scanEventId} onChange={(e) => setScanEventId(e.target.value)}>
              <option value="" disabled>Select Event...</option>
              {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
            </select>
            
            <input type="text" placeholder="Scan/Enter Ticket ID" required className="input-field font-mono text-sm" value={scanTicketId} onChange={(e) => setScanTicketIdState(e.target.value)} />
            
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20">
              Validate Entry
            </button>
          </form>

          {scanMessage && (
            <div className={`mt-6 p-4 rounded-xl border ${scanMessage.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-red-500/20 border-red-500/50 text-red-300'}`}>
              <div className="flex items-center gap-3 font-semibold">
                {scanMessage.type === 'success' ? '✅' : '❌'} {scanMessage.text}
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-b border-slate-700/50 pb-4">Your Hosted Events</h2>
      {events.length === 0 ? (
        <p className="text-slate-400 italic">You haven't created any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event._id} className="glass p-5 rounded-2xl border-l-4 border-l-indigo-500">
              <h3 className="font-bold text-xl mb-2">{event.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
              <div className="text-sm bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Total:</span> <span>{event.totalTickets}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Available:</span> <span>{event.availableTickets}</span>
                </div>
                <div className="flex justify-between font-semibold text-indigo-400">
                  <span>Sold:</span> <span>{event.totalTickets - event.availableTickets}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
