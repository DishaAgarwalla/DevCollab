import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { FiSend, FiUser, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function TeamChat({ user }) {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user || !projectId) return;

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    // Join project room
    newSocket.emit('join-project', projectId);
    
    // Join user's personal room for notifications
    newSocket.emit('join-user', user._id);

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      console.log('New message received:', message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [projectId, user]);

  // Fetch chat history
  useEffect(() => {
    if (!projectId) return;
    fetchChatHistory();
  }, [projectId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/chat/${projectId}`);
      console.log('Chat history:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      projectId,
      userId: user._id,
      userName: user.name,
      content: newMessage,
      timestamp: new Date()
    };

    // Send message via socket
    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to={`/team/${projectId}`} 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <FiArrowLeft />
          Back to Project
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Team Chat</h1>
            <p className="text-primary-100 text-sm">Discuss and collaborate with your team</p>
          </div>

          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-6 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`flex ${msg.userId === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.userId === user._id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.userId !== user._id && (
                      <p className="text-xs font-semibold mb-1">{msg.userName}</p>
                    )}
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.userId === user._id ? 'text-primary-200' : 'text-gray-500'
                    }`}>
                      {format(new Date(msg.createdAt || msg.timestamp), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input with @mention hint */}
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message... Use @username to mention someone"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition duration-200 flex items-center gap-2"
              >
                <FiSend />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}