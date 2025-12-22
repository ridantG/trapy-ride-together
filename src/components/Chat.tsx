import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { retryAsync, handleError } from '@/lib/errorHandling';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

interface TypingIndicator {
  booking_id: string;
  user_id: string;
  last_typed_at: string;
}

interface ChatProps {
  bookingId: string;
  otherUserId: string;
  otherUserName: string;
  onClose: () => void;
}

const MESSAGES_PER_PAGE = 50;

export default function Chat({ bookingId, otherUserId, otherUserName, onClose }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    
    // Subscribe to realtime messages
    const messagesChannel = supabase
      .channel(`chat-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          if (payload.new.sender_id !== user?.id) {
            markMessagesAsRead();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg))
          );
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          // Check if the typing indicator is from the other user (not ourselves)
          const typingUserId = payload.new?.user_id || payload.old?.user_id;
          if (typingUserId && typingUserId === otherUserId && typingUserId !== user?.id) {
            setIsTyping(true);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [bookingId, otherUserId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (before?: string) => {
    try {
      await retryAsync(async () => {
        let query = supabase
          .from('messages')
          .select('*')
          .eq('booking_id', bookingId)
          .limit(MESSAGES_PER_PAGE);

        if (before) {
          // For loading older messages, order descending and get messages before the timestamp
          query = query.lt('created_at', before).order('created_at', { ascending: false });
        } else {
          // For initial load, get most recent messages in ascending order
          query = query.order('created_at', { ascending: true });
        }

        const { data, error } = await query;

        if (error) throw error;
        
        if (before) {
          // Reverse the data since we fetched in descending order, then prepend to existing messages
          const reversedData = (data || []).reverse();
          setMessages((prev) => [...reversedData, ...prev]);
        } else {
          setMessages(data || []);
        }
        
        setHasMore((data?.length || 0) === MESSAGES_PER_PAGE);
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
    } catch (error) {
      handleError(error, 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;
    try {
      await supabase.rpc('mark_messages_read', {
        p_booking_id: bookingId,
        p_user_id: user.id,
      });
    } catch (error) {
      // Non-critical - marking messages as read is a background operation
      console.error('Error marking messages as read (non-critical):', error);
    }
  };

  const updateTypingIndicator = async () => {
    if (!user) return;
    try {
      await supabase.from('typing_indicators').upsert({
        booking_id: bookingId,
        user_id: user.id,
        last_typed_at: new Date().toISOString(),
      });
    } catch (error) {
      // Non-critical - typing indicators are for UX only, doesn't affect functionality
      console.error('Error updating typing indicator (non-critical):', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      await retryAsync(async () => {
        const { error } = await supabase.from('messages').insert({
          booking_id: bookingId,
          sender_id: user.id,
          content: newMessage.trim(),
        });

        if (error) throw error;
      }, {
        maxRetries: 1,
        retryDelay: 1000,
      });
      
      setNewMessage('');
    } catch (error) {
      handleError(error, 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    updateTypingIndicator();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-card w-full max-w-lg h-[80vh] md:h-[600px] md:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold">Chat with {otherUserName}</h3>
            <p className="text-xs text-muted-foreground">
              {isTyping ? 'Typing...' : 'Booking conversation'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => fetchMessages(messages[0]?.created_at)}
                >
                  Load older messages
                </Button>
              )}
              {messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-2 justify-between">
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                        {isOwn && message.is_read && (
                          <span className="text-xs text-primary-foreground/70">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
