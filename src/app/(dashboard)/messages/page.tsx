'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Search, Send, User, Clock, Check, CheckCheck } from 'lucide-react';

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    companyName: string | null;
    avatar: string | null;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Mock data for demo
    setConversations([
      {
        id: '1',
        participant: {
          id: 'u1',
          name: 'John Smith',
          companyName: 'TechParts Global',
          avatar: null
        },
        lastMessage: 'The shipment will arrive by Friday',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 2
      },
      {
        id: '2',
        participant: {
          id: 'u2',
          name: 'Sarah Chen',
          companyName: 'Premium Textiles',
          avatar: null
        },
        lastMessage: 'Thank you for your order!',
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 0
      },
      {
        id: '3',
        participant: {
          id: 'u3',
          name: 'Mike Johnson',
          companyName: 'Industrial Solutions',
          avatar: null
        },
        lastMessage: 'Can we discuss the pricing?',
        lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 1
      }
    ]);
    setLoading(false);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  selectedConversation === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.participant.avatar ? (
                      <img src={conv.participant.avatar} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900 truncate">
                        {conv.participant.companyName || conv.participant.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {conversations.find(c => c.id === selectedConversation)?.participant.companyName}
                  </h3>
                  <span className="text-sm text-green-500">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  <div className="flex justify-start">
                    <div className="max-w-xs bg-white rounded-lg px-4 py-2 shadow-sm">
                      <p className="text-gray-800">Hello! I wanted to discuss the order details.</p>
                      <span className="text-xs text-gray-400 mt-1 block">10:30 AM</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-xs bg-blue-600 text-white rounded-lg px-4 py-2">
                      <p>Sure, what would you like to know?</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-blue-200">10:32 AM</span>
                        <CheckCheck className="w-4 h-4 text-blue-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
