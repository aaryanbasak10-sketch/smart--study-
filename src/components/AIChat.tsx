import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X, Send, Bot, Sparkles, User, RefreshCw, BookOpen, AlertCircle } from "lucide-react";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubject?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

// Lightweight custom Markdown renderer to avoid React 19 compatibility issues
const renderMarkdown = (text: string) => {
  if (!text) return "";
  
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
  
  // Italic (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400 rounded">$1</code>');

  // Headers (### Header)
  html = html.replace(/^### (.*?)$/gm, '<h4 class="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1 font-display">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 class="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 font-display">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 class="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2 font-display">$1</h2>');

  // Bullet points
  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>');
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>');

  // Convert line breaks to <br /> (except inside lists)
  // Simple replace
  html = html.split("\n").map(line => {
    if (line.trim().startsWith("<li") || line.trim().startsWith("<h") || line.trim() === "") {
      return line;
    }
    return line + "<br/>";
  }).join("\n");

  return <div dangerouslySetInnerHTML={{ __html: html }} className="space-y-1.5 leading-relaxed text-sm text-slate-700 dark:text-slate-300" />;
};

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, activeSubject }) => {
  const { userProfile } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: `Welcome to your **Study Hub AI Tutor**! 🎓
      
I can assist you in mastering **Class ${userProfile?.studentClass || '9th-12th'}** syllabus concepts. Ask me anything about ${activeSubject ? `**${activeSubject}**` : "Physics, Chemistry, Mathematics, Biology, English, or Social Science"}! 

For example, try asking:
* *"Can you explain Newton's Second Law with real-world examples?"*
* *"Explain why quadratic equations have at most two roots."*
* *"Show me the step-by-step balancing of a chemical equation."*`,
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput("");
    
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: userMsgText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build conversation history format for API payload
      const historyPayload = messages.slice(1).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Post to our full-stack server endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history: historyPayload,
          studentClass: userProfile?.studentClass || "10th",
          subject: activeSubject || "General"
        })
      });

      if (!response.ok) {
        throw new Error("Tutor service encountered an issue. Let's try again!");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error("AI chat communication error:", err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: `❌ **Error:** ${err.message || "I am currently offline. Please check your connectivity and try again."}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        content: `Hello again! I am ready for your next study questions. Ask away!`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 animate-slide-in">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">AI Tutor Assistant</h3>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Class {userProfile?.studentClass || '9th-12th'} Board Specialist</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            title="Reset Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
        
        {messages.map((msg) => {
          const isAi = msg.role === "model";
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30">
                  <Bot className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm border ${
                isAi 
                  ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800" 
                  : "bg-blue-600 text-white border-blue-600"
              }`}>
                {isAi ? (
                  renderMarkdown(msg.content)
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
                <span className={`text-[10px] block text-right mt-1.5 ${
                  isAi ? "text-slate-400" : "text-blue-200"
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0 border border-blue-100/30">
              <Bot className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeSubject ? `Ask about ${activeSubject}...` : "Ask a study question..."}
          className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          id="chat-input-text"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:opacity-40 transition-all flex items-center justify-center shrink-0"
          id="chat-btn-send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
