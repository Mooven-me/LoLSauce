import { useState, useEffect, useRef } from 'react';

// Main App Component
export default function RealtimeChatApp() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [hasSetUsername, setHasSetUsername] = useState(false);
  const eventSourceRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Connect to Mercure hub
  useEffect(() => {
    if (!hasSetUsername) return;
    
    const connectToMercure = () => {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create a new EventSource to connect to Mercure
      const url = new URL('http://localhost:3000/.well-known/mercure');
      url.searchParams.append('topic', 'http://localhost/chat');
      
      const eventSource = new EventSource(url, {
        withCredentials: false
      });
      
      eventSource.onopen = () => {
        console.log('Connected to Mercure');
        setIsConnected(true);
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prevMessages => [...prevMessages, data]);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setIsConnected(false);
        
        // Try to reconnect after a delay
        setTimeout(() => {
          connectToMercure();
        }, 3000);
      };
      
      eventSourceRef.current = eventSource;
    };
    
    connectToMercure();
    
    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [hasSetUsername]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          username: username,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle key press for message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle username submission
  const handleSetUsername = () => {
    if (username.trim()) {
      setHasSetUsername(true);
    }
  };

  // Handle key press for username input
  const handleUsernameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSetUsername();
    }
  };

  // Username entry screen
  if (!hasSetUsername) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Realtime Chat App</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Choose a username to continue
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleUsernameKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <button
              onClick={handleSetUsername}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Join Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Realtime Chat App</h1>
          <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></span>
            <span className="text-sm">{isConnected ? 'Connected' : 'Reconnecting...'}</span>
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 my-8">
              No messages yet. Be the first to say something!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index}
                className={`mb-4 ${msg.username === username ? 'text-right' : ''}`}
              >
                <div 
                  className={`inline-block rounded-lg px-4 py-2 max-w-xs sm:max-w-md break-words ${
                    msg.username === username 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.username !== username && (
                    <div className="font-bold text-sm mb-1">{msg.username}</div>
                  )}
                  <div>{msg.message}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto max-w-4xl flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}