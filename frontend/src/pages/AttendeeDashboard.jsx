import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AttendeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/bookings/my-tickets', config);
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-xl">Loading your tickets...</div>;

  return (
    <div className="py-6">
      <h1 className="text-4xl font-bold mb-8">My <span className="gradient-text">Tickets</span></h1>

      {tickets.length === 0 ? (
        <div className="glass-card text-center py-20 border-dashed border-slate-600">
          <p className="text-xl text-slate-400 mb-4">You haven't booked any tickets yet.</p>
          <a href="/" className="btn-primary inline-block">Browse Events</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <div key={ticket._id} className="relative overflow-hidden group">
              {/* Ticket stub realistic design */}
              <div className="bg-white rounded-2xl flex flex-col h-full shadow-xl shadow-indigo-500/10">
                {/* Event Info (Top half) */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-t-xl group-hover:from-indigo-900 group-hover:to-slate-800 transition-colors">
                  <div className="uppercase tracking-widest text-[10px] text-indigo-400 font-bold mb-2">Entry-Way Admit One</div>
                  <h3 className="font-bold text-2xl mb-1 truncate">{ticket.event.title}</h3>
                  <p className="text-slate-300 text-sm">{ticket.event.location}</p>
                  <p className="text-indigo-300 text-sm font-semibold">{new Date(ticket.event.date).toLocaleDateString()}</p>
                </div>

                {/* Perforation line */}
                <div className="flex items-center w-full px-2 mt-[-5px] z-10">
                  <div className="w-5 h-5 rounded-full bg-slate-900 -ml-4"></div>
                  <div className="flex-grow border-b-2 border-dashed border-slate-300 opacity-50"></div>
                  <div className="w-5 h-5 rounded-full bg-slate-900 -mr-4"></div>
                </div>

                {/* QR Code (Bottom half) */}
                <div className="p-6 mt-[-5px] flex flex-col items-center justify-center bg-white rounded-b-xl">
                  {ticket.status === 'valid' ? (
                    <>
                      <img src={ticket.qrCode} alt="Ticket QR Code" className="w-40 h-40 shadow-sm border p-1 rounded-xl" />
                      <p className="text-xs text-slate-500 mt-4 font-mono select-all bg-slate-100 px-3 py-1 rounded-md">
                        ID: {ticket.ticketId.split('-')[0]}...
                      </p>
                    </>
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center border-4 border-slate-200 rounded-xl bg-slate-50 opacity-50">
                      <div className="transform -rotate-45 text-slate-400 font-black text-2xl uppercase tracking-widest">Scanned</div>
                    </div>
                  )}
                  
                  <div className={`mt-4 w-full text-center py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    ticket.status === 'valid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {ticket.status === 'valid' ? 'Valid Ticket' : 'Used Ticket'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendeeDashboard;
