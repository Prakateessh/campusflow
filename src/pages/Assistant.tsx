import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  chips?: string[];
}

const SUGGESTIONS = [
  'I need a Raspberry Pi for Tuesday afternoon',
  'Which lab has an FPGA board available?',
  'Show me a project idea using IoT sensors',
  'What welding slots are open this week?',
];

const CHIP_ROUTES: Record<string, string> = {
  'Open E-09':            '/facilities/20',
  'E-08 · VLSI UG':       '/facilities/18',
  'E-07 · DSP':           '/facilities/17',
  'View C-02':            '/facilities/23',
  'Open canteen':         '/canteen',
  'See full menu':        '/canteen',
  'Open library':         '/library',
  'Renew now':            '/library',
  'Book Thursday':        '/facilities/45',
  'Book Friday':          '/facilities/45',
  'Request components':   '/facilities',
  'Add sponsor':          '/facilities',
  'Pick a slot':          '/facilities',
  'See past projects':    '/facilities/20',
};

const CANNED: Array<{ match: RegExp; reply: string; chips?: string[] }> = [
  {
    match: /raspberry\s*pi|rpi/i,
    reply:
      'Embedded Computing Laboratory (E-09) has 6 Raspberry Pi 4 (4GB) units available. You will need a faculty sponsor and can book a bench slot alongside the loan. Typical loan period is 7 days.',
    chips: ['Open E-09', 'Pick a slot', 'Add sponsor'],
  },
  {
    match: /fpga/i,
    reply:
      'Two labs currently have FPGA boards in stock. VLSI Design – UG (E-08) has Basys 3 and Zybo Z7-10 boards. DSP Laboratory (E-07) has ATLYS and ANVYL Spartan-6 boards. Both require an induction certificate.',
    chips: ['E-08 · VLSI UG', 'E-07 · DSP'],
  },
  {
    match: /iot|sensor|project\s*idea/i,
    reply:
      'A strong fit is a low-cost air quality monitor: ESP32 + PMS5003 + MQ-135, streaming to a Grafana dashboard. The Intelligent Electronics System Laboratory (C-02) has all three components plus LoRa gateways for remote deployments. Two similar projects were completed here in the last 6 months — both succeeded.',
    chips: ['View C-02', 'See past projects', 'Request components'],
  },
  {
    match: /weld/i,
    reply:
      'Welding Lab (M-05) is open 08:00–18:00. This week, slots on Thursday and Friday afternoon are free. Welding requires a faculty sponsor and a supervised session with Mr. Senthilkumar. Bring your own material if the part is custom — the lab supplies rods.',
    chips: ['Book Thursday', 'Book Friday'],
  },
  {
    match: /canteen|food|lunch|dosa/i,
    reply:
      'The canteen has 12 items available right now. Masala Dosa takes 10 min to prepare. To skip the queue, pre-order in-app and pay — the kitchen starts preparing exactly when your pickup window opens.',
    chips: ['Open canteen', 'See full menu'],
  },
  {
    match: /library|book/i,
    reply:
      'You have 3 books borrowed. One is overdue — "Microelectronic Circuits" by Sedra & Smith, due 3 days ago. Renewals for the other two are available.',
    chips: ['Renew now', 'Open library'],
  },
];

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
  const endRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: Message = { id: counterRef.current++, role: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setStreaming(true);

    const canned = CANNED.find((c) => c.match.test(trimmed));
    const replyText = canned
      ? canned.reply
      : 'I can help with labs, equipment, canteen, library, sports, and stores. Try asking about a specific lab, component, or service.';

    const id = counterRef.current++;
    setMessages((m) => [...m, { id, role: 'assistant', text: '' }]);

    let i = 0;
    const chunk = Math.max(2, Math.round(replyText.length / 60));
    const timer = setInterval(() => {
      i += chunk;
      setMessages((m) =>
        m.map((msg) =>
          msg.id === id ? { ...msg, text: replyText.slice(0, i) } : msg,
        ),
      );
      if (i >= replyText.length) {
        clearInterval(timer);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === id
              ? { ...msg, text: replyText, chips: canned?.chips }
              : msg,
          ),
        );
        setStreaming(false);
      }
    }, 24);
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
                    {streaming && m.role === 'assistant' && m.id === messages[messages.length - 1].id && (
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
              Responses come from the campus knowledge base. Confirm any booking before submission.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}