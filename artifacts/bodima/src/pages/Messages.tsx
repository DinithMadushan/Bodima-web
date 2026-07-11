import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useGetConversations, useGetConversation, useSendMessage } from '@workspace/api-client-react';
import { Send, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Messages() {
  const { user, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [msgInput, setMsgInput] = useState('');

  useEffect(() => {
    if (!isLoggedIn) setLocation('/login');
  }, [isLoggedIn, setLocation]);

  const { data: conversations, refetch: refetchConvs } = useGetConversations({
    query: { enabled: isLoggedIn }
  });

  const { data: activeConv, refetch: refetchMsgs } = useGetConversation(activeConvId!, {
    query: { enabled: !!activeConvId, refetchInterval: 5000 }
  });

  const sendMsg = useSendMessage();

  useEffect(() => {
    if (conversations?.length && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeConvId) return;

    sendMsg.mutate({ id: activeConvId, data: { body: msgInput } }, {
      onSuccess: () => {
        setMsgInput('');
        refetchMsgs();
        refetchConvs();
      }
    });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="bg-[#f7f4ef] h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl h-full max-h-[800px] bg-white rounded-3xl shadow-lg border border-[#e8e0d5] overflow-hidden flex">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-[#e8e0d5] flex flex-col h-full bg-gray-50/30">
          <div className="p-5 border-b border-[#e8e0d5] bg-white">
            <h2 className="font-serif text-xl font-bold text-[#1a3c5e]">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations?.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${activeConvId === conv.id ? 'bg-blue-50/50 border-l-4 border-l-[#1a3c5e]' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <img src={conv.listing_img || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt=""/>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-[#2c3e50] text-sm truncate">{user?.role === 'owner' ? conv.student_name : conv.owner_name}</h4>
                      {conv.unread_count && conv.unread_count > 0 ? (
                        <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{conv.unread_count}</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">{conv.listing_name}</p>
                    <p className={`text-sm truncate ${conv.unread_count && conv.unread_count > 0 ? 'text-[#1a3c5e] font-medium' : 'text-gray-400'}`}>
                      {conv.last_message || 'New conversation'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!conversations || conversations.length === 0) && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No messages yet
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          {activeConvId && activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-5 border-b border-[#e8e0d5] flex items-center justify-between shadow-sm z-10 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a3c5e]/10 text-[#1a3c5e] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2c3e50]">
                      {user?.role === 'owner' ? activeConv.student_name : activeConv.owner_name}
                    </h3>
                    <p className="text-xs text-gray-500">Inquiry for: <span className="font-medium text-[#e8a045]">{activeConv.listing_name}</span></p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#f7f4ef]/30">
                {activeConv.messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isMine ? 'bg-[#1a3c5e] text-white rounded-br-sm' : 'bg-gray-100 text-[#2c3e50] rounded-bl-sm border border-gray-200'}`}>
                        {msg.body}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[#e8e0d5] bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input 
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-12 bg-gray-50 border-transparent focus-visible:ring-[#e8a045] rounded-xl"
                  />
                  <button type="submit" disabled={!msgInput.trim() || sendMsg.isPending} className="h-12 w-12 bg-[#e8a045] hover:bg-[#d99035] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50">
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-300" />
              </div>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
