import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { ChatMessageItem } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import {
  Bot,
  X,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MessageSquareCode
} from 'lucide-react';

export const AiChatBot: React.FC = () => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or restore sessionId from localStorage
  useEffect(() => {
    let sid = localStorage.getItem('cybershield_chat_session');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('cybershield_chat_session', sid);
    }
    setSessionId(sid);
  }, []);

  // Fetch conversation history when sessionId is ready
  useEffect(() => {
    if (!sessionId) return;

    async function loadHistory() {
      try {
        const res = await api.chat.getHistory(sessionId);
        if (res.success && res.messages && res.messages.length > 0) {
          setMessages(res.messages);
        } else {
          // Default welcoming greeting if no prior history
          setMessages([
            {
              id: 'welcome_msg',
              sender: 'bot',
              message: `### 👋 Greetings! I am CyberBot AI\n\nI am your intelligent cybersecurity assistant. Ask me anything about online safety, ethical hacking, 2FA, password security, or paste suspicious links, SMS messages, and UPI details for real-time analysis!`,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
      }
    }

    loadHistory();
  }, [sessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    // Optimistic user message
    const tempUserMsg: ChatMessageItem = {
      id: 'temp_' + Date.now(),
      sender: 'user',
      message: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.chat.sendMessage(textToSend, sessionId);
      if (res.success) {
        if (res.sessionId && res.sessionId !== sessionId) {
          setSessionId(res.sessionId);
          localStorage.setItem('cybershield_chat_session', res.sessionId);
        }

        const botMsg: ChatMessageItem = {
          id: res.messageId || 'bot_' + Date.now(),
          sender: 'bot',
          message: res.reply,
          detectedType: res.detectedType,
          riskScore: res.riskScore,
          riskLevel: res.riskLevel,
          resultStatus: res.resultStatus,
          scanId: res.scanId,
          createdAt: res.createdAt || new Date().toISOString()
        };

        setMessages(prev => [...prev, botMsg]);

        if (res.isThreatCheck && res.scanId) {
          showToast(`Threat check recorded to Scan History (${res.riskLevel || 'ANALYSIS'})`, 'info');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error communicating with CyberBot.', 'error');
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'bot',
          message: `⚠️ **Connection issue**: Could not reach threat intelligence services. Please check your backend connection and try again.`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.chat.clearHistory(sessionId);
      setMessages([
        {
          id: 'cleared_' + Date.now(),
          sender: 'bot',
          message: `✨ Conversation history cleared. Ask me anything or paste a suspicious link/message to begin a new threat check!`,
          createdAt: new Date().toISOString()
        }
      ]);
      showToast('Chat history cleared.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear history.', 'error');
    }
  };

  const suggestionChips = [
    { label: '👋 Hello!', text: 'Hello! How can you help me stay safe online?' },
    { label: '🔍 Spot fake links', text: 'How do I spot a phishing URL and check for typosquatting?' },
    { label: '🔐 Passwords & 2FA', text: 'What is the safest way to create and manage strong passwords?' },
    { label: '🚨 Clicked a bad link', text: 'I clicked on a suspicious link by mistake, what should I do right now?' },
    { label: '💳 UPI PIN fraud trap', text: 'Someone asked me to enter my UPI PIN to receive cashback. Is that safe?' },
    { label: '🦠 Ransomware defense', text: 'How does ransomware work and how do I protect my system?' }
  ];

  // Helper to render markdown-like text smoothly
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-white font-display pt-1 border-b border-slate-700/50 pb-1 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }

          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-blue-400 mt-1 text-[10px]">●</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.substring(2)) }} />
              </div>
            );
          }

          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^\d+\./)?.[0];
            const text = line.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-mono text-cyan-400 font-bold text-xs">{num}</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />
              </div>
            );
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800">$1</code>');
  };

  return (
    <aside aria-label="CyberBot AI Threat Copilot" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div
          className={`w-[92vw] sm:w-[410px] bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-950/50 overflow-hidden flex flex-col transition-all duration-200 mb-3 ${
            isMinimized ? 'h-14' : 'h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/60 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white font-display tracking-tight">CyberBot AI</span>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    COPILOT
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Live Threat Defense Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear conversation history"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand window' : 'Minimize window'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (Messages & Input) - Hidden when Minimized */}
          {!isMinimized && (
            <>
              {/* Message Thread */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-750">
                
                {/* Suggestion Chips Banner */}
                {messages.length <= 2 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Suggested Threat Queries:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestionChips.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(chip.text)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 transition-all text-left active:scale-[0.98]"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Bubbles */}
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <Bot className="w-3.5 h-3.5 text-cyan-300" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-850/90 text-slate-200 border border-slate-750 rounded-bl-none'
                        }`}
                      >
                        {/* Threat Vector / Severity Tag for Bot */}
                        {!isUser && (
                          (msg.scanId || (msg.detectedType && msg.detectedType !== 'GENERAL' && (msg.riskScore || 0) > 0)) ? (
                            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-700/60">
                              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800">
                                {msg.detectedType || 'THREAT EVAL'}
                              </span>
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                  msg.riskLevel === 'CRITICAL'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    : msg.riskLevel === 'HIGH'
                                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                    : msg.riskLevel === 'MODERATE'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                }`}
                              >
                                {msg.riskLevel}
                              </span>
                              {msg.riskScore !== undefined && msg.riskScore !== null && msg.riskScore > 0 && (
                                <span className="text-[10px] font-mono text-slate-400 ml-auto">
                                  Risk Index: <strong className="text-white">{msg.riskScore}</strong>/100
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-850">
                              <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-blue-500/20 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> AI Agent
                              </span>
                            </div>
                          )
                        )}

                        {/* Content */}
                        {isUser ? (
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        ) : (
                          renderFormattedMessage(msg.message)
                        )}

                        {/* Action link if scan was created in Scan History */}
                        {!isUser && msg.scanId && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono">Logged to Scan History</span>
                            <Link
                              to={`/result/${msg.scanId}`}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              <span>View Full Threat Report</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading / Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-850/90 border border-slate-750 text-slate-400 text-xs flex items-center gap-1.5">
                      <span>Analyzing security signals</span>
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask CyberBot or paste a link/SMS to verify..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 border border-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:hover:bg-blue-600 active:scale-95 shrink-0 shadow-md shadow-blue-600/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
                  <span>Privacy Guard: OTPs masked automatically</span>
                  <Link to="/history" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition-colors">
                    Audit Log &rarr;
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Button (Bottom-Right) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isMinimized) setIsMinimized(false);
        }}
        aria-label="Open CyberBot AI cybersecurity assistant"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/40 border border-blue-400/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
        </span>
        <Bot className="w-5 h-5 text-white animate-pulse" />
        <span className="text-xs sm:text-sm font-display tracking-tight pr-1">
          {isOpen ? 'Close CyberBot' : 'Chat with CyberBot AI'}
        </span>
      </button>

    </aside>
  );
};
