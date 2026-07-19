// src/components/FanHub.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generateMultilingualResponse } from '../utils/stadiumEngine';
import { sanitizeLength } from '../utils/sanitizer';
import { SUPPORTED_LANGUAGES } from '../data/stadiumData';
import type { SupportedLanguage } from '../data/stadiumData';
import type { Stadium } from '../data/stadiumData';

interface FanHubProps {
  readonly selectedStadium: Stadium;
}

interface FAQMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly text: string;
  readonly language: SupportedLanguage;
}

const MATCH_INFO = [
  { time: '15:00', teams: '🇫🇷 France vs 🇦🇷 Argentina', group: 'Group C', venue: 'MetLife Stadium' },
  { time: '18:00', teams: '🇧🇷 Brazil vs 🇵🇹 Portugal', group: 'Group D', venue: 'SoFi Stadium' },
  { time: '21:00', teams: '🇩🇪 Germany vs 🇪🇸 Spain',   group: 'Group A', venue: 'AT&T Stadium' },
];

const QUICK_QUESTIONS: Record<SupportedLanguage, string[]> = {
  en: ['How do I use my ticket?', 'Where is food available?', 'Where can I park?', 'What is the wifi password?'],
  es: ['¿Cómo uso mi boleto?', '¿Dónde hay comida?', '¿Dónde puedo estacionar?', '¿Cuál es la contraseña del wifi?'],
  fr: ['Comment utiliser mon billet?', 'Où trouver à manger?', 'Où puis-je me garer?', 'Quel est le mot de passe wifi?'],
  ar: ['كيف أستخدم تذكرتي؟', 'أين يوجد الطعام؟', 'أين يمكنني ركن سيارتي؟', 'ما كلمة مرور الواي فاي؟'],
  pt: ['Como uso meu bilhete?', 'Onde tem comida?', 'Onde posso estacionar?', 'Qual é a senha do wifi?'],
  de: ['Wie nutze ich mein Ticket?', 'Wo gibt es Essen?', 'Wo kann ich parken?', 'Was ist das WLAN-Passwort?'],
};

/**
 * Fan Hub — multilingual AI assistant and match information center.
 */
const FanHub: React.FC<FanHubProps> = ({ selectedStadium }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<FAQMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentLang = useMemo(() => SUPPORTED_LANGUAGES.find((l) => l.code === language), [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleAsk = useCallback((queryText?: string) => {
    const raw = queryText ?? input;
    const clean = sanitizeLength(raw, 300);
    if (!clean.trim()) return;

    const userMsg: FAQMessage = {
      id: `u-${Date.now()}`, role: 'user', text: clean, language,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const res = generateMultilingualResponse(clean, language);
      const aiMsg: FAQMessage = {
        id: `a-${Date.now()}`, role: 'assistant', text: res.response, language,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  }, [input, language]);

  return (
    <section className="fan-hub" aria-label="Multilingual Fan Hub">
      <div className="nav-header">
        <div>
          <h2 className="section-title">🌍 Fan Hub</h2>
          <p className="section-sub">AI-powered multilingual assistant for {selectedStadium.name}</p>
        </div>
      </div>

      {/* Language Selector */}
      <div className="glass-card lang-selector-card">
        <h3 className="card-title">🗣️ Select Your Language</h3>
        <div className="lang-grid" role="group" aria-label="Language selection">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`lang-btn ${language === lang.code ? 'active' : ''}`}
              onClick={() => setLanguage(lang.code)}
              role="radio"
              aria-checked={language === lang.code}
              aria-label={`Select ${lang.label} language`}
            >
              <span className="lang-native">{lang.nativeName}</span>
              <span className="lang-english">{lang.label}</span>
            </button>
          ))}
        </div>
        <p className="lang-note" dir={currentLang?.direction ?? 'ltr'}>
          {language === 'en' && '🤖 AI assistant is ready to help in English'}
          {language === 'es' && '🤖 El asistente de IA está listo para ayudarte en español'}
          {language === 'fr' && '🤖 L\'assistant IA est prêt à vous aider en français'}
          {language === 'ar' && '🤖 المساعد الذكي مستعد لمساعدتك باللغة العربية'}
          {language === 'pt' && '🤖 O assistente de IA está pronto para ajudá-lo em português'}
          {language === 'de' && '🤖 Der KI-Assistent ist bereit, Ihnen auf Deutsch zu helfen'}
        </p>
      </div>

      {/* Match Day Schedule */}
      <div className="glass-card match-schedule-card" role="region" aria-label="Match Day Schedule">
        <h3 className="card-title">⚽ Today's Matches — FIFA World Cup 2026</h3>
        <div className="match-list" role="list">
          {MATCH_INFO.map((match) => (
            <div key={match.teams} className="match-row" role="listitem">
              <span className="match-time">{match.time}</span>
              <div className="match-teams">{match.teams}</div>
              <div className="match-meta">
                <span className="match-group">{match.group}</span>
                <span className="match-venue">📍 {match.venue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Questions */}
      <div className="glass-card faq-card">
        <h3 className="card-title">❓ Quick Questions</h3>
        <div className="quick-prompts" role="group" aria-label="Quick FAQ prompts">
          {(QUICK_QUESTIONS[language] ?? QUICK_QUESTIONS.en).map((q) => (
            <button
              key={q}
              className="quick-prompt-btn"
              onClick={() => handleAsk(q)}
              aria-label={`Ask: ${q}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* AI FAQ Chat */}
      <div
        className="chat-window glass-card"
        role="log"
        aria-label="Multilingual AI assistant conversation"
        aria-live="polite"
        style={{ minHeight: messages.length === 0 ? '120px' : '280px' }}
      >
        {messages.length === 0 && (
          <p className="chat-placeholder" aria-label="No messages yet">
            Ask a question above to start the conversation in {currentLang?.label ?? 'your language'}...
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.role}`} dir={currentLang?.direction ?? 'ltr'}>
            {msg.role === 'assistant' && <div className="bubble-avatar" aria-hidden="true">🤖</div>}
            <div className="bubble-content">
              <div className="bubble-text">{msg.text}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble assistant" aria-live="polite" aria-label="AI is generating response">
            <div className="bubble-avatar" aria-hidden="true">🤖</div>
            <div className="bubble-content">
              <div className="typing-indicator" aria-hidden="true"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Row */}
      <div className="chat-input-row" dir={currentLang?.direction ?? 'ltr'}>
        <input
          type="text"
          className="chat-input"
          placeholder={language === 'ar' ? 'اكتب سؤالك هنا…' : language === 'fr' ? 'Tapez votre question ici…' : language === 'es' ? 'Escribe tu pregunta aquí…' : language === 'de' ? 'Schreibe deine Frage hier…' : language === 'pt' ? 'Escreva sua pergunta aqui…' : 'Type your question here…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(); }}
          maxLength={300}
          aria-label="Ask the multilingual AI assistant"
          dir={currentLang?.direction ?? 'ltr'}
        />
        <button
          className="chat-send-btn"
          onClick={() => handleAsk()}
          disabled={!input.trim() || isTyping}
          aria-label="Send question to AI assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </section>
  );
};

export default FanHub;
