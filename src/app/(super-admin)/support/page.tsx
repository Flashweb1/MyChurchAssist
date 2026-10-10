'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import Link from 'next/link';
import {
  Plus,
  Search,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Ticket {
  id: string;
  churchId: string;
  churchName: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [formData, setFormData] = useState({
    churchName: '',
    subject: '',
    priority: 'Medium',
  });

  useEffect(() => {
    async function fetchTickets() {
      try {
        // For MVP, we'll read from a demo or create collection if it exists
        // In a real app, this would be from super_admin_tickets collection
        
        try {
          const q = query(collection(db, 'support_tickets'), where('active', '==', true));
          const ticketsSnap = await getDocs(q);
          
          const ticketsList: Ticket[] = ticketsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              churchId: (data.churchId as string) || '',
              churchName: (data.churchName as string) || '',
              subject: (data.subject as string) || '',
              priority: (data.priority as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
              status: (data.status as 'New' | 'In Progress' | 'Resolved' | 'Closed') || 'New',
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              messageCount: (data.messageCount as number) || 0,
            };
          });

          setTickets(ticketsList);
        } catch (e) {
          // Collection doesn't exist yet - create demo tickets
          setTickets([
            {
              id: '1',
              churchId: 'church_1',
              churchName: 'Grace Church',
              subject: 'Messages not sending via SMS',
              priority: 'High',
              status: 'In Progress',
              createdAt: new Date(Date.now() - 2 * 60 * 60000),
              updatedAt: new Date(Date.now() - 30 * 60000),
              messageCount: 4,
            },
            {
              id: '2',
              churchId: 'church_2',
              churchName: 'Zion Ministry',
              subject: 'Cannot add new members',
              priority: 'Medium',
              status: 'New',
              createdAt: new Date(Date.now() - 1 * 60 * 60000),
              updatedAt: new Date(Date.now() - 1 * 60 * 60000),
              messageCount: 1,
            },
            {
              id: '3',
              churchId: 'church_3',
              churchName: 'Hope Center',
              subject: 'Attendance tracking issue',
              priority: 'Low',
              status: 'Resolved',
              createdAt: new Date(Date.now() - 24 * 60 * 60000),
              updatedAt: new Date(Date.now() - 2 * 60 * 60000),
              messageCount: 3,
            },
          ]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  const handleCreateTicket = async () => {
    if (!formData.churchName || !formData.subject) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Add new ticket to Firestore
      const newTicket = {
        churchName: formData.churchName,
        subject: formData.subject,
        priority: formData.priority,
        status: 'New',
        messageCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        active: true,
      };

      const docRef = await addDoc(collection(db, 'support_tickets'), newTicket);

      const createdTicket: Ticket = {
        id: docRef.id,
        churchId: '',
        churchName: formData.churchName,
        subject: formData.subject,
        priority: formData.priority as 'Low' | 'Medium' | 'High' | 'Critical',
        status: 'New',
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTickets([
        ...tickets,
        createdTicket,
      ]);

      setFormData({ churchName: '', subject: '', priority: 'Medium' });
      setShowNewTicketForm(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-900/30 text-red-400 border-red-700/50';
      case 'High':
        return 'bg-orange-900/30 text-orange-400 border-orange-700/50';
      case 'Medium':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50';
      case 'Low':
        return 'bg-blue-900/30 text-blue-400 border-blue-700/50';
      default:
        return 'bg-slate-900/30 text-slate-400 border-slate-700/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Closed':
        return <XCircle className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  let filteredTickets = tickets;
  if (filter !== 'All') {
    filteredTickets = filteredTickets.filter((t) => t.status === filter);
  }
  if (search) {
    filteredTickets = filteredTickets.filter(
      (t) =>
        t.churchName.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-slate-400">Manage customer support requests</p>
        </div>
        <button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {/* New Ticket Form */}
      {showNewTicketForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Create New Ticket</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Church Name"
              value={formData.churchName}
              onChange={(e) =>
                setFormData({ ...formData, churchName: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-slate-500"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical Priority</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTicket}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewTicketForm(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'New', 'In Progress', 'Resolved', 'Closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {status}
            {status === 'All' && ` (${tickets.length})`}
            {status !== 'All' && ` (${tickets.filter((t) => t.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by church or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center p-8 text-slate-400">
            No tickets found
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/super-admin/support/${ticket.id}`}
              className="block bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(ticket.status)}
                    <h3 className="font-semibold text-white group-hover:text-blue-400">
                      {ticket.subject}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {ticket.churchName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Created {ticket.createdAt.toLocaleString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.messageCount} messages
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                    {ticket.status}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
