'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

interface TicketMessage {
  from: string;
  email: string;
  text: string;
  timestamp: Date;
}

interface Ticket {
  id: string;
  churchName: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPriority, setNewPriority] = useState<string>('');

  useEffect(() => {
    async function fetchTicket() {
      try {
        const docSnap = await getDoc(doc(db, 'support_tickets', ticketId));

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTicket({
            id: docSnap.id,
            churchName: data.churchName || '',
            subject: data.subject || '',
            priority: data.priority || 'Medium',
            status: data.status || 'New',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            messages: (data.messages || []).map((m: any) => ({
              ...m,
              timestamp: m.timestamp?.toDate() || new Date(),
            })),
          });
          setNewStatus(data.status || 'New');
          setNewPriority(data.priority || 'Medium');
        } else {
          // Demo data for ticket
          setTicket({
            id: ticketId,
            churchName: 'Grace Church',
            subject: 'Messages not sending via SMS',
            priority: 'High',
            status: 'In Progress',
            createdAt: new Date(Date.now() - 2 * 60 * 60000),
            updatedAt: new Date(Date.now() - 30 * 60000),
            messages: [
              {
                from: 'Customer',
                email: 'john@grace.church',
                text: 'Our SMS campaign started failing yesterday. We tried sending 500 messages but only 12 went through.',
                timestamp: new Date(Date.now() - 2 * 60 * 60000),
              },
              {
                from: 'Support',
                email: 'support@churchassist.com',
                text: 'Thanks for reporting. I can see the issue - your wallet balance was low. I\'ve increased your SMS quota. Can you try again?',
                timestamp: new Date(Date.now() - 1 * 60 * 60000),
              },
              {
                from: 'Customer',
                email: 'john@grace.church',
                text: 'Great! It\'s working now. Thanks for the quick fix!',
                timestamp: new Date(Date.now() - 30 * 60000),
              },
            ],
          });
          setNewStatus('In Progress');
          setNewPriority('High');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setLoading(false);
      }
    }

    fetchTicket();
  }, [ticketId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket) return;

    try {
      const messageData = {
        from: 'Support',
        email: 'support@churchassist.com',
        text: newMessage,
        timestamp: Timestamp.now(),
      };

      await updateDoc(doc(db, 'support_tickets', ticketId), {
        messages: arrayUnion(messageData),
        updatedAt: Timestamp.now(),
      });

      setTicket({
        ...ticket,
        messages: [
          ...ticket.messages,
          {
            ...messageData,
            timestamp: new Date(),
          },
        ],
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUpdateStatus = async (newVal: string) => {
    if (!ticket) return;

    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status: newVal,
        updatedAt: Timestamp.now(),
      });

      setTicket({
        ...ticket,
        status: newVal as any,
      });
      setNewStatus(newVal);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading ticket...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/super-admin/support"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        <div className="text-slate-400">Ticket not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-900/30 text-blue-400 border-blue-700/50';
      case 'In Progress':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50';
      case 'Resolved':
        return 'bg-green-900/30 text-green-400 border-green-700/50';
      case 'Closed':
        return 'bg-slate-900/30 text-slate-400 border-slate-700/50';
      default:
        return 'bg-slate-900/30 text-slate-400 border-slate-700/50';
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Link */}
      <Link
        href="/super-admin/support"
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      {/* Ticket Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              {ticket.subject}
            </h1>
            <p className="text-slate-400">{ticket.churchName}</p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                ticket.status
              )}`}
            >
              {ticket.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(
                ticket.priority
              )}`}
            >
              {ticket.priority}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-700">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-slate-500"
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-slate-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Conversation ({ticket.messages.length})
        </h3>

        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {ticket.messages.map((message, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${
                message.from === 'Support'
                  ? 'bg-blue-900/20 border border-blue-700/30'
                  : 'bg-slate-700/50 border border-slate-600/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{message.from}</span>
                <span className="text-xs text-slate-400">
                  {message.timestamp.toLocaleString()}
                </span>
              </div>
              <p className="text-slate-300">{message.text}</p>
              {message.email && (
                <p className="text-xs text-slate-500 mt-2">{message.email}</p>
              )}
            </div>
          ))}
        </div>

        {/* Reply Box */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your response..."
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none h-24"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            Send Reply
          </button>
        </div>
      </div>

      {/* Ticket Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">
            Ticket Details
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-400">Created</p>
              <p className="text-white">
                {ticket.createdAt.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Last Updated</p>
              <p className="text-white">
                {ticket.updatedAt.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Time Since Creation</p>
              <p className="text-white">
                {Math.floor(
                  (new Date().getTime() - ticket.createdAt.getTime()) /
                    (1000 * 60)
                )}{' '}
                minutes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              Mark as Resolved
            </button>
            <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
              Escalate
            </button>
            <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
              Close Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
