import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  chips?: string[];
}

const SUGGESTIONS = [
  'Which lab has an FPGA board available?',
  'I need a Raspberry Pi for Tuesday afternoon',
  'Which labs do nanomaterial synthesis?',
  'Show me a project idea using IoT sensors',
  'What welding slots are open this week?',
];

const CHIP_ROUTES: Record<string, string> = {
  'Open E-09': '/facilities/20',
  'E-08 · VLSI UG': '/facilities/18',
  'E-07 · DSP': '/facilities/17',
  'View C-02': '/facilities/23',
  'Open canteen': '/canteen',
  'See full menu': '/canteen',
  'Open library': '/library',
  'Renew now': '/library',
  'Book Thursday': '/facilities/45',
  'Book Friday': '/facilities/45',
  'Request components': '/facilities',
  'Add sponsor': '/facilities',
  'Pick a slot': '/facilities',
  'See past projects': '/facilities/20',
};

export default function Assistant() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Ask me anything about campus facilities, equipment, or bookings. I can also suggest project ideas based on what is in stock.',
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);

    const userMsg: Message = {
      id: counterRef.current++,
      role: 'user',
      text: trimmed,
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantId = counterRef.current++;
    setMessages((m) => [...m, { id: assistantId, role: 'assistant', text: '' }]);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message ?? `AI request failed: ${res.status}`);
      }

      const data = await res.json();
      const replyText: string = data.reply ?? 'No response.';

      // Simulate streaming: append chars progressively for the typewriter effect
      let i = 0;
      const chunk = Math.max(2, Math.round(replyText.length / 60));
      const timer = setInterval(() => {
        i += chunk;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? { ...msg, text: replyText.slice(0, i) }
              : msg,
          ),
        );
        if (i >= replyText.length) {
          clearInterval(timer);
          setMessages((m) =>
            m.map((msg) =>
              msg.id === assistantId ? { ...msg, text: replyText } : msg,
            ),
          );
          setStreaming(false);
        }
      }, 20);
    } catch (err: any) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                text: 'AI is temporarily unavailable. Please try again.',
              }
            : msg,
        ),
      );
      setError(err.message ?? 'AI request failed');
      setStreaming(false);
    }
  };

  const handleChip = (chip: string) => {
    const route = CHIP_ROUTES[chip];
    if (route) navigate(route);
    else send(chip);
  };

  const clear = () => {
    setMessages([
      {
        id: counterRef.current++,
        role: 'assistant',
        text: 'Cleared. Ask me anything about campus facilities, equipment, or bookings.',
      },
    ]);
    setError(null);
  };

  return (
    <Layout>
      {/* HEADING */}
      <section className="pt-14 pb-8">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">Assistant</h1>
          </div>
          <button
            onClick={clear}
            className="label hover:text-[var(--color-ink)] transition"
          >
            Clear chat
          </button>
        </div>
      </section>

      {/* SUGGESTIONS */}
      {messages.length <= 1 && (
        <section className="pb-8">
          <span className="label">Try asking</span>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="tag hover:border-[var(--color-ink)] cursor-pointer transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* CHAT */}
      <section className="pb-8">
        <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
          <div className="px-6 py-3 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)] flex items-center justify-between">
            <span className="label">Chat</span>
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 ${
                  streaming ? 'bg-[var(--color-accent)] animate-pulse' : 'bg-[var(--color-ink-4)]'
                }`}
              />
              <span className="label">{streaming ? 'Thinking' : 'Ready'}</span>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {messages.map((m) => (
              <div key={m.id} className="grid grid-cols-12 gap-4">
                <span className="col-span-2 md:col-span-1 label mt-1">
                  {m.role === 'user' ? 'You' : 'AI'}
                </span>
                <div className="col-span-10 md:col-span-11">
                  <p
                    className={`text-[16px] leading-relaxed whitespace-pre-line ${
                      m.role === 'user' ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-2)]'
                    }`}
                  >
                    {m.text}
                    {streaming &&
                      m.role === 'assistant' &&
                      m.id === messages[messages.length - 1].id && (
                        <span className="inline-block w-2 h-4 bg-[var(--color-accent)] ml-1 align-text-bottom animate-pulse" />
                      )}
                  </p>
                  {m.chips && m.chips.length > 0 && !streaming && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.chips.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleChip(c)}
                          className="tag hover:border-[var(--color-ink)] cursor-pointer transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* INPUT */}
          <div className="px-6 py-4 border-t border-[var(--color-rule)]">
            {error && (
              <div className="mb-3 border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2">
                <span className="text-[12px] text-[var(--color-accent)]">{error}</span>
              </div>
            )}
            <div className="flex items-end gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about a lab, component, or service…"
                disabled={streaming}
                className="input flex-1"
              />
              <button
                onClick={() => send(input)}
                disabled={streaming || input.trim() === ''}
                className="btn btn-accent text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <p className="mt-3 text-[12px] text-[var(--color-ink-4)] leading-relaxed">
              Powered by Cloudflare Workers AI. Verify any booking before submission.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}