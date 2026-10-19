/* eslint-disable */
/**
 * ChatBot.jsx — EstateXAI Floating AI Assistant
 * ================================================
 * A premium floating chat widget powered by the /api/chat backend.
 * Features:
 * - 8 Core Real-World Capabilities with direct quick-action chips:
 *   1. ⚖️ Price Fairness & Counter-Offer Strategy
 *   2. 🚗 Commute vs Rent Net Savings Tradeoff
 *   3. 🔍 Hidden Costs & True Monthly Budget
 *   4. 🚩 Rental Agreement Red Flags & Clause Checker
 *   5. 🏘️ Neighborhood Safety & Water/Power Intelligence
 *   6. 🤝 Flatmate Lifestyle Compatibility Matching
 *   7. 📈 Property Investment ROI & Rental Yield
 *   8. 🏠 Smart Listing & PG Search
 * - Clean Markdown table, header, and list rendering
 * - Animated open/close, minimize, reset, unread count badge
 * - Mobile responsive, glassmorphic styling
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Sparkles, ChevronDown,
    Bot, User, Minimize2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL
    ? (import.meta.env.VITE_API_URL.replace(/\/+$/, '') + '/api')
    : (import.meta.env.DEV ? '/api' : 'https://estatexai.onrender.com/api');

// ── 8 Core Capability Quick Action Chips ───────────────────────────────────────
const QUICK_TOOLS = [
    { label: '⚖️ Fair Price', query: 'Is ₹25,000 fair for a 2BHK in Baner, Pune?' },
    { label: '🚗 Commute vs Rent', query: 'Is it worth paying ₹5,000 more rent to save 10km daily commute?' },
    { label: '🔍 Hidden Costs', query: 'Calculate true monthly living costs and hidden expenses for ₹25,000 rent' },
    { label: '🚩 Contract Check', query: 'What are the biggest red flags and painting deduction traps in rent agreements?' },
    { label: '🏘️ Neighborhood', query: 'What is the safety, water supply, and nightlife score for Koramangala?' },
    { label: '🤝 Flatmate Quiz', query: 'How to test lifestyle and roommate compatibility before sharing a flat?' },
    { label: '📈 Rental Yield & ROI', query: 'Calculate rental yield and break-even years for an 85 Lakh flat with ₹25,000 rent' },
    { label: '🏠 Find PGs', query: 'Find verified girls and boys PGs in Bangalore under ₹12,000' },
];

// ── Markdown Parser with Table Support ─────────────────────────────────────────
function renderMessage(text) {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let tableBuffer = [];
    let inTable = false;

    const flushTable = (keyPrefix) => {
        if (tableBuffer.length === 0) return;
        const rows = tableBuffer.map(r => r.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1));
        const headerRow = rows[0] || [];
        const bodyRows = rows.slice(2); // skip separator row (|---|---|)

        elements.push(
            <div key={`${keyPrefix}-table`} style={{ overflowX: 'auto', margin: '8px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(201,163,94,0.12)', borderBottom: '1px solid rgba(201,163,94,0.2)' }}>
                            {headerRow.map((h, hi) => (
                                <th key={hi} style={{ padding: '6px 10px', color: '#c9a35e', fontWeight: 600 }}>{renderInline(h)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bodyRows.map((row, ri) => (
                            <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                {row.map((cell, ci) => (
                                    <td key={ci} style={{ padding: '6px 10px', color: '#d4d4d8' }}>{renderInline(cell)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
        tableBuffer = [];
        inTable = false;
    };

    const renderInline = (str) => {
        if (!str) return '';
        // Bold: **text**
        const parts = str.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} style={{ color: '#fafafa' }}>{part.slice(2, -2)}</strong>;
            }
            // Inline links: [text](url)
            const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g).map((lp, k) => {
                const m = lp.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (m) return <a key={k} href={m[2]} style={{ color: '#c9a35e', textDecoration: 'underline' }}>{m[1]}</a>;
                return lp;
            });
            return linkParts;
        });
        return parts;
    };

    lines.forEach((line, i) => {
        // Table line detection
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            inTable = true;
            tableBuffer.push(line.trim());
            return;
        } else if (inTable) {
            flushTable(i);
        }

        // Heading: ### Heading or ## Heading
        if (line.startsWith('### ') || line.startsWith('## ')) {
            const headingText = line.replace(/^#{2,3}\s+/, '');
            elements.push(
                <div key={i} style={{ color: '#dfc288', fontWeight: 700, fontSize: 14.5, marginTop: i > 0 ? 8 : 2, marginBottom: 4 }}>
                    {renderInline(headingText)}
                </div>
            );
            return;
        }

        // Bullet points
        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('✅') || line.startsWith('🟢') || line.startsWith('🟡') || line.startsWith('🟠') || line.startsWith('🔴') || line.startsWith('⚠️')) {
            elements.push(
                <div key={i} style={{ paddingLeft: 4, marginBottom: 3, display: 'flex', gap: 6 }}>
                    <span style={{ flexShrink: 0 }}>{line.slice(0, 2)}</span>
                    <span>{renderInline(line.slice(2))}</span>
                </div>
            );
            return;
        }

        // Numbered list: 1. text
        if (/^\d+\.\s+/.test(line)) {
            elements.push(
                <div key={i} style={{ paddingLeft: 4, marginBottom: 3 }}>
                    {renderInline(line)}
                </div>
            );
            return;
        }

        if (line.trim() === '') {
            elements.push(<div key={i} style={{ height: 6 }} />);
            return;
        }

        elements.push(
            <div key={i} style={{ marginBottom: 2 }}>
                {renderInline(line)}
            </div>
        );
    });

    if (inTable) flushTable('end');
    return elements;
}

// ── Typing Indicator ───────────────────────────────────────────────────────────
function TypingIndicator() {
    return (
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a35e', opacity: 0.4 }}
                    animate={{ opacity: [0.4, 1, 0.4], y: [0, -3, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                />
            ))}
        </div>
    );
}

// ── Main ChatBot Component ─────────────────────────────────────────────────────
export default function ChatBot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `### 👋 Hi${user ? `, ${user.name?.split(' ')[0]}` : ''}! I'm EstateXAI Assistant.
Your elite real estate AI advisor for Indian cities.

Try asking about **price fairness**, **commute vs rent tradeoffs**, **hidden costs**, **agreement red flags**, or **neighborhood vibes**!`,
            ts: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasOpened, setHasOpened] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const userRole = user?.role || 'guest';

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 250);
            setUnreadCount(0);
        }
    }, [isOpen, isMinimized]);

    // Auto badge nudge on first load
    useEffect(() => {
        const t = setTimeout(() => {
            if (!hasOpened && !isOpen) {
                setUnreadCount(1);
            }
        }, 3500);
        return () => clearTimeout(t);
    }, []);

    const sendMessage = useCallback(async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput('');

        const userMessage = { role: 'user', content: msg, ts: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const historyForAPI = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

            const { data } = await axios.post(`${API}/chat`, {
                message: msg,
                history: historyForAPI,
                userRole,
                context: {}
            }, { timeout: 15000 });

            const assistantMessage = {
                role: 'assistant',
                content: data.response,
                ts: Date.now(),
                intent: data.intent,
                engine: data.engine
            };
            setMessages(prev => [...prev, assistantMessage]);

            if (!isOpen) setUnreadCount(n => n + 1);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I experienced a brief connection hiccup. Please try again in a moment, or browse listings directly via the navigation bar! 😊",
                ts: Date.now(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, userRole, isOpen]);

    useEffect(() => {
        const handleCustomOpen = (e) => {
            setIsOpen(true);
            setIsMinimized(false);
            setHasOpened(true);
            setUnreadCount(0);
            if (e.detail?.query) {
                sendMessage(e.detail.query);
            }
        };
        window.addEventListener('open-estatexai-chat', handleCustomOpen);
        return () => window.removeEventListener('open-estatexai-chat', handleCustomOpen);
    }, [sendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);
        setHasOpened(true);
        setUnreadCount(0);
    };

    const handleReset = () => {
        setMessages([{
            role: 'assistant',
            content: `### 👋 Chat reset!
What real estate challenge can I help you solve today?`,
            ts: Date.now()
        }]);
    };

    return (
        <>
            {/* ── Floating Launcher Button ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        id="estatexai-chat-btn"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={handleOpen}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
                            width: 60, height: 60, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #c9a35e 0%, #dfc288 50%, #a38246 100%)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(201,163,94,0.45), 0 2px 8px rgba(0,0,0,0.3)',
                            color: '#000',
                        }}
                        aria-label="Open EstateXAI Chat"
                    >
                        <MessageCircle size={26} strokeWidth={2.2} />
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                    position: 'absolute', top: -3, right: -3,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: '#ef4444', color: 'white',
                                    fontSize: 11, fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid #09090b'
                                }}
                            >
                                {unreadCount}
                            </motion.div>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Chat Modal Window ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="estatexai-chat-window"
                        initial={{ opacity: 0, scale: 0.88, y: 40, originX: 1, originY: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 40 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        style={{
                            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                            width: 'min(440px, calc(100vw - 32px))',
                            height: isMinimized ? 'auto' : 'min(620px, calc(100vh - 100px))',
                            background: '#0d0d0f',
                            border: '1px solid rgba(201,163,94,0.28)',
                            borderRadius: 20,
                            boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,163,94,0.1)',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden',
                            fontFamily: 'Inter, sans-serif',
                        }}
                        role="dialog"
                        aria-label="EstateXAI Chat Assistant"
                    >
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(201,163,94,0.18) 0%, rgba(163,130,70,0.09) 100%)',
                            borderBottom: '1px solid rgba(201,163,94,0.18)',
                            padding: '12px 16px',
                            display: 'flex', alignItems: 'center', gap: 10,
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #c9a35e, #dfc288)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Sparkles size={17} color="#000" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#fafafa', fontWeight: 700, fontSize: 13.5, lineHeight: 1.2 }}>EstateXAI Assistant</div>
                                <div style={{ color: '#c9a35e', fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a5', boxShadow: '0 0 6px #22d3a5' }} />
                                    Real-World Real Estate Intelligence
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                    onClick={handleReset}
                                    title="Reset chat"
                                    style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                                >
                                    <RefreshCw size={14} />
                                </button>
                                <button
                                    onClick={() => setIsMinimized(m => !m)}
                                    title={isMinimized ? 'Expand' : 'Minimize'}
                                    style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                                >
                                    {isMinimized ? <ChevronDown size={15} /> : <Minimize2 size={14} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Close chat"
                                    style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Capability Quick-Chips Ribbon */}
                                <div style={{
                                    display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 12px',
                                    background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    scrollbarWidth: 'none', flexShrink: 0,
                                }}>
                                    {QUICK_TOOLS.map((t, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(t.query)}
                                            style={{
                                                whiteSpace: 'nowrap',
                                                background: 'rgba(201,163,94,0.09)',
                                                border: '1px solid rgba(201,163,94,0.22)',
                                                borderRadius: 14,
                                                color: '#dfc288',
                                                fontSize: 11,
                                                padding: '4px 10px',
                                                cursor: 'pointer',
                                                fontFamily: 'Inter, sans-serif',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,163,94,0.2)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,163,94,0.09)'; }}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Messages Stream */}
                                <div style={{
                                    flex: 1, overflowY: 'auto', padding: '14px 14px',
                                    display: 'flex', flexDirection: 'column', gap: 12,
                                    scrollbarWidth: 'thin', scrollbarColor: '#c9a35e transparent',
                                }}>
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={msg.ts || i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                display: 'flex',
                                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                                gap: 8, alignItems: 'flex-start',
                                            }}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,163,94,0.15)', border: '1px solid rgba(201,163,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                                    <Bot size={14} color="#c9a35e" />
                                                </div>
                                            )}
                                            <div style={{
                                                maxWidth: '86%',
                                                background: msg.role === 'user'
                                                    ? 'linear-gradient(135deg, #c9a35e, #dfc288)'
                                                    : msg.isError
                                                    ? 'rgba(239,68,68,0.08)'
                                                    : 'rgba(255,255,255,0.04)',
                                                color: msg.role === 'user' ? '#000' : '#e4e4e7',
                                                border: msg.role === 'user' ? 'none' : `1px solid ${msg.isError ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`,
                                                borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                                                padding: '10px 14px',
                                                fontSize: 13,
                                                lineHeight: 1.5,
                                                wordBreak: 'break-word',
                                            }}>
                                                {renderMessage(msg.content)}
                                            </div>
                                            {msg.role === 'user' && (
                                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,163,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                                    <User size={14} color="#c9a35e" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                                        >
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,163,94,0.15)', border: '1px solid rgba(201,163,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Bot size={14} color="#c9a35e" />
                                            </div>
                                            <TypingIndicator />
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Text Input Footer */}
                                <div style={{
                                    borderTop: '1px solid rgba(255,255,255,0.07)',
                                    padding: '10px 14px',
                                    display: 'flex', gap: 8, alignItems: 'flex-end',
                                    flexShrink: 0,
                                    background: 'rgba(255,255,255,0.015)',
                                }}>
                                    <textarea
                                        ref={inputRef}
                                        id="chat-input"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask about fair price, commute, contracts, hidden costs…"
                                        rows={1}
                                        disabled={loading}
                                        style={{
                                            flex: 1, resize: 'none', border: '1px solid rgba(255,255,255,0.09)',
                                            borderRadius: 12, background: 'rgba(255,255,255,0.04)',
                                            color: '#fafafa', fontSize: 13, padding: '9px 12px',
                                            fontFamily: 'Inter, sans-serif', outline: 'none',
                                            maxHeight: 90, overflowY: 'auto',
                                            lineHeight: 1.45, opacity: loading ? 0.6 : 1,
                                        }}
                                        onInput={e => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px';
                                        }}
                                    />
                                    <motion.button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || loading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
                                            background: input.trim() && !loading
                                                ? 'linear-gradient(135deg, #c9a35e, #dfc288)'
                                                : 'rgba(255,255,255,0.06)',
                                            color: input.trim() && !loading ? '#000' : '#555',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, transition: 'background 0.2s',
                                        }}
                                        aria-label="Send message"
                                    >
                                        <Send size={15} strokeWidth={2.5} />
                                    </motion.button>
                                </div>

                                <div style={{ padding: '2px 14px 8px', textAlign: 'center' }}>
                                    <span style={{ color: '#52525b', fontSize: 10.5, fontFamily: 'Inter, sans-serif' }}>
                                        EstateXAI Intelligence · Verified India Metros
                                    </span>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
