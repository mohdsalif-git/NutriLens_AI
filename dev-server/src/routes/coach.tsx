import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mic, MicOff, Send, Sparkles, Square, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { AuthGate } from "@/components/nutrilens/AuthGate";
import { AppShell } from "@/components/nutrilens/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/profile.functions";
import bgScan from "@/assets/bg-ai-scan.jpg";

export const Route = createFileRoute("/coach")({ component: Page });
function Page() { return <AuthGate><AppShell><Coach /></AppShell></AuthGate>; }

const SUGGESTIONS = [
  "Can I eat dosa during weight loss?",
  "Best protein foods for gym?",
  "What foods should diabetics avoid?",
  "Plan a low-sodium dinner for me",
  "I'm craving something sweet — what should I do?",
  "Quick high-protein breakfast under 400 kcal?",
];

function Coach() {
  const fetchProfile = useServerFn(getProfile);
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: "/api/chat",
      headers: () => (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
    }),
    [token],
  );

  const { messages, sendMessage, status, stop, error } = useChat({ transport });

  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Focus input
  useEffect(() => { inputRef.current?.focus(); }, [status]);

  // Speak assistant replies (TTS) when enabled
  const lastSpokenRef = useRef<string>("");
  useEffect(() => {
    if (!speakReplies || status === "streaming") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const text = last.parts.map((p: any) => (p.type === "text" ? p.text : "")).join("").trim();
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    try {
      const u = new SpeechSynthesisUtterance(text.replace(/[*_`#>]/g, ""));
      u.rate = 1; u.pitch = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch { /* noop */ }
  }, [messages, status, speakReplies]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || status === "streaming" || status === "submitted") return;
    sendMessage({ text: t });
    setInput("");
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input not supported on this browser"); return; }
    if (listening) { recognitionRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInput((finalText + interim).trim());
    };
    rec.onend = () => {
      setListening(false);
      if (finalText.trim()) send(finalText);
    };
    rec.onerror = () => { setListening(false); toast.error("Couldn't hear you, try again"); };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const busy = status === "streaming" || status === "submitted";
  const firstName = (profileQ.data?.full_name ?? "").split(" ")[0] || "there";

  return (
    <div className="space-y-4">
      {/* Cinematic coach header */}
      <section className="relative rounded-[2rem] overflow-hidden shadow-elevated isolate">
        <div className="absolute inset-0 -z-10">
          <img src={bgScan} alt="" className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,18,14,0.82)_0%,rgba(8,18,14,0.6)_55%,rgba(20,12,8,0.78)_100%)]" />
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[color-mix(in_oklch,var(--sage)_42%,transparent)] blur-3xl animate-float" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[color-mix(in_oklch,var(--ember)_30%,transparent)] blur-3xl" />
        </div>
        <div className="relative p-5 sm:p-7 flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-cream/60 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[color:var(--sage)]" /> AI Nutrition Coach · Always-on
            </p>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl font-semibold tracking-tight text-cream">Ask anything, {firstName}</h1>
            <p className="mt-1.5 text-sm text-cream/70 max-w-md">Conversational guidance tuned to your conditions, goals, and today's plate.</p>
          </div>
          <button
            onClick={() => { setSpeakReplies((v) => !v); if (speakReplies) speechSynthesis.cancel(); }}
            className="rounded-full px-3.5 py-2 text-xs inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-cream backdrop-blur hover:bg-white/15 transition"
            title="Toggle voice replies"
          >
            {speakReplies ? <Volume2 className="h-3.5 w-3.5 text-[color:var(--sage)]" /> : <VolumeX className="h-3.5 w-3.5" />}
            {speakReplies ? "Voice on" : "Voice off"}
          </button>
        </div>
      </section>

      {/* Transcript */}
      <div ref={scrollRef} className="glass-strong rounded-3xl p-4 sm:p-5 h-[55vh] min-h-[360px] overflow-y-auto space-y-4 relative">
        <span aria-hidden className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full bg-[color-mix(in_oklch,var(--sage)_22%,transparent)] blur-3xl" />
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4 relative">
            <div className="mx-auto h-16 w-16 grid place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              I know your goals, conditions, and what you've eaten today. Ask me anything about Indian food, nutrition, or your habits.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs rounded-full border border-border bg-background/60 hover:bg-primary hover:text-primary-foreground hover:border-primary transition px-3 py-1.5">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts.map((p: any) => (p.type === "text" ? p.text : "")).join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              {isUser ? (
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 gradient-primary text-primary-foreground text-sm leading-relaxed shadow-glow">
                  {text}
                </div>
              ) : (
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm px-4 py-2.5 glass text-sm leading-relaxed prose prose-sm prose-neutral max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_li]:my-0.5">
                  <ReactMarkdown>{text || "…"}</ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            Thinking…
          </div>
        )}

        {error && <p className="text-sm text-destructive">Couldn't reach the coach. Please try again.</p>}
      </div>

      {/* Composer */}
      <div className="glass rounded-3xl p-3 flex items-end gap-2">
        <button
          onClick={toggleVoice}
          className={`h-11 w-11 shrink-0 rounded-2xl grid place-items-center transition ${
            listening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-mist/60 hover:bg-mist"
          }`}
          title={listening ? "Stop listening" : "Voice input"}
        >
          {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
          }}
          rows={1}
          placeholder={listening ? "Listening…" : "Ask about a food, craving, or habit…"}
          className="flex-1 resize-none bg-transparent outline-none text-sm py-2.5 max-h-32"
        />
        {busy ? (
          <button onClick={() => stop()} className="h-11 w-11 shrink-0 rounded-2xl grid place-items-center bg-foreground/10">
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="h-11 w-11 shrink-0 rounded-2xl grid place-items-center bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        NutriLens learns from your profile and today's meals. Not medical advice.
      </p>
    </div>
  );
}
