'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SubjectPrediction, SimulationSettings } from '../types/attendance';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  User, 
  Loader2,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';

interface ChatbotWidgetProps {
  section: string;
  sectionDisplayName: string;
  targetDate: string;
  totalClassesRemaining: number;
  subjects: SubjectPrediction[];
  simulation: SimulationSettings;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  section,
  sectionDisplayName,
  targetDate,
  totalClassesRemaining,
  subjects,
  simulation,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **Academic Advisor & Campus AI Copilot** 🎓🏛️.\n\nI have live access to your timetable, current percentages, internal marks, leave simulations for **${sectionDisplayName || section}**, AND real-time vacant classroom schedules across the college!\n\n💡 **உதாரணக் கேள்விகள் (Try asking):**\n• *"Leave எடுத்தா Mark குறையுமா? Regain பண்ண என்ன செய்யணும்?"*\n• *"Leave எடுத்திட்டு எதுவும் செய்யாட்டி என்ன Loss ஆகும்?"*\n• *"3-day Medical Leave எடுத்தா percentage எவ்ளோ குறையும்?"*\n• *"2 days OD எடுத்தா percentage எவ்ளோ ஏறும்?"*\n• *"entha class ippo free ah iruku? (Free Class Locator)"*\n• *"find best AC room for study"*\n• *"IST 108 Lab afternoon eppo free?"*`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Construct current state context to inject into every API request
  const buildCurrentContext = () => ({
    section,
    sectionDisplayName,
    targetDate,
    totalClassesRemaining,
    odDays: simulation.odDays,
    sickDays: simulation.sickDays,
    subjects: subjects.map(s => ({
      name: s.name,
      currentPercentage: s.currentPercentage,
      targetPercentage: s.targetPercentage,
      tPast: s.tPast || 0,
      tFuture: s.tFuture || s.remainingClasses || 0,
      tTotal: s.tTotal || 0,
      requiredClassesToAttend: s.requiredClassesToAttend,
      status: s.status,
      isIrreversibleDetention: s.isIrreversibleDetention,
      statusText: s.statusText,
      odCredit: s.odCredit || 0,
      sickDeduction: s.sickDeduction || 0,
    })),
  });

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: buildCurrentContext(), // INJECTS LIVE STATE
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get advisor response');
      }

      const data = await response.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I analyzed your attendance data but could not generate a response.',
      };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Sorry, I could not connect to the advisor server right now. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: '📉 Leave Drop & Mark Loss', query: 'Leave eduka poren, percentage evlo korayum? Mark reduce aguma?' },
    { label: '🛠️ Regain Blueprint', query: 'Lost attendance and mark regain panna enna visayangal seiyanum?' },
    { label: '🚨 Inaction Severe Penalties', query: 'Leave eduthutu ethuvum seyalati ethelam loss agum?' },
    { label: '🎖️ 2-Day OD Boost', query: '2 days OD edutha percentage evlo yerum?' },
    { label: '🛡️ Safe Missable Classes', query: 'How many classes can I safely bunk without detention?' },
  ];

  // Helper to parse bold, italic, code inline styles
  const formatInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-extrabold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={pIdx} className="italic text-slate-600 font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pIdx} className="font-mono text-[11px] bg-slate-100 text-indigo-700 px-1 py-0.5 rounded border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Upgraded markdown renderer grouping ASCII boxes into a unified dark terminal card
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBoxLines: string[] = [];

    const flushBox = () => {
      if (currentBoxLines.length > 0) {
        const boxText = currentBoxLines.join('\n');
        elements.push(
          <div key={`box-${elements.length}`} className="my-2.5 rounded-xl overflow-hidden shadow-md border border-slate-800 bg-slate-950">
            <div className="bg-slate-900/90 px-3 py-1 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>ATTENDANCE &amp; MARKS IMPACT MATRIX</span>
              </span>
              <span className="text-emerald-400 font-semibold">AUTOMATIC CALCULATION</span>
            </div>
            <pre className="p-3 font-mono text-[10.5px] leading-tight text-emerald-400 overflow-x-auto whitespace-pre selection:bg-emerald-700 selection:text-white">
              {boxText}
            </pre>
          </div>
        );
        currentBoxLines = [];
      }
    };

    lines.forEach((line, idx) => {
      if (line.startsWith('│') || line.startsWith('┌') || line.startsWith('└') || line.startsWith('├')) {
        currentBoxLines.push(line);
        return;
      } else {
        flushBox();
      }

      if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-3 border-slate-200" />);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={idx} className="font-extrabold text-indigo-950 text-xs sm:text-[13px] mt-3.5 mb-1.5 pb-1 border-b border-indigo-100 flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h4>
        );
        return;
      }

      if (line.startsWith('• ') || line.startsWith('- ')) {
        const bulletContent = line.replace(/^[•-]\s*/, '');
        elements.push(
          <div key={idx} className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-indigo-600 font-bold text-sm leading-none shrink-0">•</span>
            <span className="text-slate-700 text-xs">
              {formatInlineStyles(bulletContent)}
            </span>
          </div>
        );
        return;
      }

      const numberedMatch = line.match(/^(\d+)\.\s*(.*)$/);
      if (numberedMatch) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1.5 pl-1 bg-slate-50/80 p-2 rounded-xl border border-slate-200/70">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              {numberedMatch[1]}
            </span>
            <span className="text-slate-800 text-xs leading-relaxed">
              {formatInlineStyles(numberedMatch[2])}
            </span>
          </div>
        );
        return;
      }

      if (line.trim() === '') {
        elements.push(<div key={idx} className="h-1.5" />);
        return;
      }

      elements.push(
        <div key={idx} className="text-slate-800 text-xs my-0.5 leading-relaxed">
          {formatInlineStyles(line)}
        </div>
      );
    });

    flushBox();
    return elements;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-3.5 rounded-full shadow-2xl shadow-indigo-500/35 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></span>
            </div>
            <span className="text-xs font-bold tracking-wide">
              Attendance Advisor AI
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[390px] sm:max-w-[470px] h-[610px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight">Academic Advisor AI</h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Context
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate max-w-[240px]">
                  {sectionDisplayName} • OD: {simulation.odDays}d, Sick: {simulation.sickDays}d
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([{
                  id: 'welcome-reset',
                  role: 'assistant',
                  content: `Conversation reset. I am ready to calculate your attendance drop, marks reduction, and recovery strategy for **${sectionDisplayName || section}**.\n\nAsk me anything!`,
                }])}
                title="Reset conversation"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Pill */}
          <div className="bg-blue-50/90 px-4 py-2 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-700 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Timetable, Internal Marks &amp; Leaves Automatically Computed
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`relative group max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs rounded-tl-xs'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div>
                      {renderFormattedContent(msg.content)}
                      
                      {/* Copy Message Action Button */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Academic Counselor Copilot</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs pl-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Advisor is computing attendance drop &amp; marks impact...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt.query)}
                disabled={loading}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/90 transition-all cursor-pointer flex-shrink-0 font-medium active:scale-95 shadow-2xs hover:border-indigo-300"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask attendance, mark drop or recovery (e.g. leave eduka poren)..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
