// src/components/AINavigator.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { generateNavigation } from '../utils/stadiumEngine';
import { sanitizeLength } from '../utils/sanitizer';
import type { DensityTier } from '../utils/crowdEngine';
import type { Stadium } from '../data/stadiumData';

/** A single chat message in the navigator conversation */
interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly text: string;
  readonly timestamp: Date;
}

/** Props for the AI Navigator chat component */
interface AINavigatorProps {
  readonly selectedStadium: Stadium;
  readonly crowdTier: DensityTier;
}

const QUICK_PROMPTS = [
  '🚻 Where is the nearest restroom?',
  '🍔 Where can I get food?',
  '🅿️ How do I get to parking?',
  '🚌 Where is the shuttle?',
  '♿ Accessible entrance?',
  '🚑 Where is first aid?',
  '🚪 How do I exit?',
  '🎟️ Help with my seat',
];

/**
 * AI Navigator — a natural language chat interface for stadium navigation.
 * Generates context-aware routing advice based on the selected stadium and crowd density.
 */
const AINavigator: React.FC<AINavigatorProps> = ({ selectedStadium, crowdTier }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👋 Welcome to ${selectedStadium.name}! I'm your AI stadium navigator powered by StadiumIQ. Ask me anything — directions, facilities, accessibility routes, transport, or crowd conditions. How can I help?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback((queryText?: string) => {
    const rawQuery = queryText ?? input;
    const clean = sanitizeLength(rawQuery, 300);
    if (!clean.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const nav = generateNavigation(clean, crowdTier, 'en');
      const responseText =
        `📍 **Route:** ${nav.route}\n\n` +
        `⏱️ **Estimated time:** ~${nav.estimatedMinutes} min\n\n` +
        `♿ **Accessible option:** ${nav.accessibleAlternative}\n\n` +
        `👥 **Crowd tip:** ${nav.crowdAvoidanceTip}`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  }, [input, crowdTier]);

  const crowdTierColor = useMemo(() => ({
    Low: '#10B981', Moderate: '#F59E0B', High: '#F97316', Critical: '#EF4444',
  }[crowdTier]), [crowdTier]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const formatMessage = (text: string) =>
    text.split('\n\n').map((para, i) => (
      <p key={i} style={{ margin: '4px 0' }}>
        {para.split(/\*\*(.*?)\*\*/).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
      </p>
    ));

  return (
    <section className="ai-navigator" aria-label="AI Stadium Navigator">
      <div className="nav-header">
        <div>
          <h2 className="section-title">🧭 AI Navigator</h2>
          <p className="section-sub">Natural language directions for {selectedStadium.name}</p>
        </div>
        <div className="crowd-status-badge" style={{ background: crowdTierColor + '22', color: crowdTierColor, border: `1px solid ${crowdTierColor}44` }}>
          <span className="status-dot" style={{ background: crowdTierColor }} aria-hidden="true" />
          Crowd: {crowdTier}
        </div>
      </div>

      {/* Quick prompts */}
      <div className="quick-prompts" role="group" aria-label="Quick navigation prompts">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            className="quick-prompt-btn"
            onClick={() => handleSend(prompt.slice(3))}
            aria-label={`Quick prompt: ${prompt}`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div
        className="chat-window glass-card"
        role="log"
        aria-label="AI Navigator conversation"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.role}`} aria-label={`${msg.role === 'user' ? 'You' : 'StadiumIQ AI'}: ${msg.text.slice(0, 60)}`}>
            {msg.role === 'assistant' && (
              <div className="bubble-avatar" aria-hidden="true">🤖</div>
            )}
            <div className="bubble-content">
              <div className="bubble-text">{formatMessage(msg.text)}</div>
              <div className="bubble-time">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble assistant" aria-live="polite" aria-label="AI is typing">
            <div className="bubble-avatar" aria-hidden="true">🤖</div>
            <div className="bubble-content">
              <div className="typing-indicator" aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-row" role="form" aria-label="Send navigation query">
        <input
          ref={inputRef}
          id="nav-input"
          type="text"
          className="chat-input"
          placeholder="Ask anything — &quot;Where is the nearest restroom?&quot;"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={300}
          aria-label="Type your navigation question"
          aria-describedby="nav-input-hint"
        />
        <button
          className="chat-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          aria-label="Send navigation query"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <p id="nav-input-hint" className="input-hint">Press Enter to send · Max 300 characters · All inputs are sanitized</p>
    </section>
  );
};

export default AINavigator;
