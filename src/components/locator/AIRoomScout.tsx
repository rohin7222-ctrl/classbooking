'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Copy,
  Zap,
  Snowflake,
  MapPin,
  Clock
} from 'lucide-react';
import { DayOfWeek } from '@/data/roomData';

interface AIRoomScoutProps {
  selectedDay: DayOfWeek;
  selectedPeriod: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const PRESET_QUERIES = [
  { label: '❄️ 2 AC room venum inum 2 hours la', query: 'enaku 2 ac room venum inum 2 hours la' },
  { label: '🟢 Entha class ippo free ah iruku?', query: 'entha class ippo free ah iruku?' },
  { label: '❄️ Best AC room with longest free time', query: 'Which AC rooms are free right now with the longest time window?' },
  { label: '🏢 Which rooms are free on 2nd Floor?', query: '2nd floor la entha rooms free ah iruku?' },
  { label: '🔬 Is IST 108 Lab free this afternoon?', query: 'IST 108 Lab afternoon eppo free?' },
  { label: '🕒 Rooms free for 3+ continuous periods', query: 'Find rooms with 3 or more consecutive free periods for study' },
];

export const AIRoomScout: React.FC<AIRoomScoutProps> = ({ selectedDay, selectedPeriod }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Hello! I am your Campus Room Scout AI.**\n\nI have live mathematical access to all 10 college classrooms and lab timetables for **${selectedDay} &bull; Period ${selectedPeriod}**.\n\nAsk me anything in **English, Tanglish, or Tamil** (e.g., *"entha class free ah iruku?"*, *"ac room venum"*, *"2 hours project work panna room sollunga"*), or click any quick prompt chip below!`,
    },
  ]);

  const handleSendMessage = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          day: selectedDay,
          period: selectedPeriod,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: json.reply || 'Calculation completed successfully.',
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Server returned an error');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Could not reach the AI service right now. Please verify your connection or inspect the live room schedule cards below.`,
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mb-8 rounded-3xl bg-white border border-slate-200/90 shadow-md overflow-hidden transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white flex items-center justify-between cursor-pointer border-b border-slate-100 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                AI Campus Room Scout &bull; Live Assistant
              </h3>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ask in Tanglish, Tamil, or English for instant verified free room calculations & advice.
            </p>
          </div>
        </div>

        <button 
          type="button" 
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white/80 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Quick Query Prompt Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick One-Click AI Prompts
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.query)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-200 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation History */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1 rounded-2xl bg-slate-50/70 p-3.5 border border-slate-200/60">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copy response"
                      className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-slate-500 font-medium p-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Computing room schedules & availability...</span>
                </div>
              </div>
            )}
          </div>

          {/* User Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI: e.g. 'entha class free ah iruku?', 'find ac room on 4th floor'..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
