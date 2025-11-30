import { useState, useEffect, useRef } from 'react';
import { createClient } from '../utils/supabase/client';
import { Send, MessageCircle, X } from './Icons';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: number;
}

interface MultiplayerChatProps {
  roomId: string;
  playerName: string;
  playerAvatar: string;
}

export function MultiplayerChat({ roomId, playerName, playerAvatar }: MultiplayerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatChannel, setChatChannel] = useState<any>(null);
  const [isChatAvailable, setIsChatAvailable] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    try {
      setIsChatAvailable(true);
      
      // Subscribe to chat messages
      const channel = supabase
        .channel(`chat-${roomId}`, {
          config: {
            broadcast: { self: true }
          }
        })
        .on('broadcast', { event: 'message' }, ({ payload }) => {
          setMessages((prev) => [...prev, payload as ChatMessage]);
          if (!isOpen && payload.sender !== playerName) {
            setUnreadCount((prev) => prev + 1);
          }
        })
        .subscribe();

      setChatChannel(channel);

      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setIsChatAvailable(false);
    }
  }, [roomId, playerName, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatChannel) return;

    const newMessage = inputMessage.trim();
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: playerName,
      avatar: playerAvatar,
      text: newMessage,
      timestamp: Date.now(),
    };

    chatChannel.send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    });

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button - Bottom Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-full shadow-2xl z-40 transition-all border-2 border-blue-400 hover:scale-105 active:scale-95"
        style={{
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.5), 0 0 0 4px rgba(37, 99, 235, 0.1)',
        }}
      >
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <div
            className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-200"
            style={{
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.6)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Chat Window - Bottom Right Corner */}
        {isOpen && (
          <div
            className="fixed bottom-20 right-4 w-80 h-96 bg-gray-900/95 backdrop-blur-xl border-2 border-blue-500/50 rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-5 duration-200"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header - Compact */}
            <div className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-sm px-3 py-2 flex items-center justify-between border-b border-blue-400/30">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-white" />
                <h3 className="text-white text-sm font-semibold">Room Chat</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-blue-800/50 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages - Scrollable */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-2"
              style={{
                background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.9))',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(59, 130, 246, 0.5) rgba(31, 41, 55, 0.5)',
              }}
            >
              {!isChatAvailable ? (
                <div className="text-center text-yellow-400 mt-12">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">⚠️ Chat Unavailable</p>
                  <p className="text-xs text-gray-500">Realtime connection required</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-12">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs text-gray-500">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === playerName ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in ${msg.sender === playerName ? 'slide-in-from-right-5' : 'slide-in-from-left-5'} duration-200`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {msg.avatar && msg.avatar.startsWith('data:') ? (
                        <img
                          src={msg.avatar}
                          alt={msg.sender}
                          className="w-7 h-7 rounded-full border-2 border-blue-500/50"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-600/80 border-2 border-blue-400/50 flex items-center justify-center text-base">
                          {msg.avatar || '🎲'}
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex flex-col ${msg.sender === playerName ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className="text-xs text-gray-400 mb-0.5 px-1">{msg.sender}</div>
                      <div
                        className={`px-3 py-1.5 rounded-xl shadow-md ${
                          msg.sender === playerName
                            ? 'bg-blue-600/90 text-white'
                            : 'bg-gray-700/90 text-white'
                        }`}
                        style={{
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <p className="text-xs break-words leading-relaxed">{msg.text}</p>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Compact */}
            <div className="p-2.5 bg-gray-800/90 backdrop-blur-sm border-t border-blue-600/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isChatAvailable ? "Type a message..." : "Chat unavailable"}
                  maxLength={200}
                  disabled={!isChatAvailable}
                  className="flex-1 bg-gray-700/80 border border-gray-600/50 rounded-lg px-3 py-1.5 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || !isChatAvailable}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {inputMessage.length}/200
              </div>
            </div>
          </div>
        )}
    </>
  );
}