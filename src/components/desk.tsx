import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Phone, PhoneOff, Play, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LANGS, SAMPLE_REPLIES, STAGE_LABEL, asLang, chipsFor, type Stage } from "@/lib/locale";
import { speak, startListening, stopSpeaking } from "@/lib/speech";
import { useDesk } from "@/lib/store";
import { cn } from "@/lib/utils";

function outcomeTone(outcome: string) {
  if (outcome === "qualified" || outcome === "granted") return "ok" as const;
  if (outcome === "escalated" || outcome === "callback") return "warn" as const;
  if (outcome === "in_call") return "live" as const;
  if (["not_interested", "no_consent", "abandoned"].includes(outcome)) return "danger" as const;
  return "muted" as const;
}

function outcomeLabel(outcome: string) {
  const labels: Record<string, string> = {
    open: "open",
    in_call: "on a call",
    qualified: "ready",
    callback: "call back",
    escalated: "handed over",
    not_interested: "not interested",
    no_consent: "declined",
    abandoned: "ended early",
  };
  return labels[outcome] ?? outcome.replaceAll("_", " ");
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

export function Desk() {
  const leads = useDesk((s) => s.leads);
  const calls = useDesk((s) => s.calls);
  const selectedId = useDesk((s) => s.selectedId);
  const activeId = useDesk((s) => s.activeId);
  const startCall = useDesk((s) => s.startCall);
  const ingestLeadText = useDesk((s) => s.ingestLeadText);
  const endCall = useDesk((s) => s.endCall);
  const setLeadLanguage = useDesk((s) => s.setLeadLanguage);
  const resetDesk = useDesk((s) => s.resetDesk);

  const [tab, setTab] = useState<"leads" | "live" | "record">("live");
  const [draft, setDraft] = useState("");
  const [sampleRunning, setSampleRunning] = useState(false);
  const [listening, setListening] = useState(false);
  const sampleLock = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lead = leads.find((l) => l.id === selectedId) ?? leads[0];
  const lang = asLang(lead.language);
  const active = calls.find((c) => c.id === activeId) ?? null;
  const shown = active ?? calls.find((c) => c.leadId === lead.id) ?? calls[0] ?? null;
  const liveMessages = shown && (active || shown.leadId === lead.id) ? shown.messages : [];
  const chipStage: Stage = active?.stage ?? "greet_consent";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [liveMessages.length]);

  const stats = useMemo(() => {
    const finished = calls.filter((c) => c.stage === "close" || c.stage === "done" || c.stage === "escalated");
    const qualified = leads.filter((l) => l.outcome === "qualified").length;
    const escalated = leads.filter((l) => l.outcome === "escalated").length;
    const ourCost = calls.reduce((s, c) => s + c.costUsd, 0);
    const turns = calls.reduce((s, c) => s + c.messages.filter((m) => m.role === "lead").length, 0);
    const afCost = turns * 0.12;
    const lats = calls.flatMap((c) => c.latenciesMs);
    const avgLat = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0;
    return { finished: finished.length, qualified, escalated, ourCost, afCost, avgLat };
  }, [calls, leads]);

  async function speakReply(reply: string, spoken?: string) {
    await speak(reply, lang, spoken);
  }

  async function begin() {
    const line = startCall(lead.id);
    if (line) await speakReply(line.reply, line.spoken);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !active) return;
    setDraft("");
    const res = ingestLeadText(trimmed, 28);
    if (res?.reply) await speakReply(res.reply, res.spoken);
  }

  async function runSample() {
    if (sampleLock.current) return;
    sampleLock.current = true;
    setSampleRunning(true);
    stopSpeaking();
    const line = startCall(lead.id);
    if (line) await speakReply(line.reply, line.spoken);
    const path: Stage[] = [
      "greet_consent",
      "confirm_name",
      "qualify_interest",
      "qualify_amount",
      "qualify_timeline",
    ];
    const samples = SAMPLE_REPLIES[asLang(useDesk.getState().leads.find((l) => l.id === lead.id)?.language ?? lang)];
    for (const stage of path) {
      await new Promise((r) => setTimeout(r, 420));
      const next = samples[stage];
      if (!next) break;
      const res = ingestLeadText(next, 22);
      if (res?.reply) await speakReply(res.reply, res.spoken);
      if (res?.done) break;
    }
    setSampleRunning(false);
    sampleLock.current = false;
  }

  function hangup() {
    stopSpeaking();
    endCall();
    setSampleRunning(false);
    sampleLock.current = false;
  }

  function listen() {
    if (listening) return;
    const rec = startListening(lang, (text) => {
      setListening(false);
      void send(text);
    });
    if (rec) setListening(true);
  }

  const chips = active ? chipsFor(chipStage, lang) : [];

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-xl tracking-tight text-balance">Warmline</p>
          <p className="truncate text-xs text-muted">A simple way to talk with customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={active ? "live" : "muted"}>{active ? "On a line" : "Idle"}</Badge>
          <Button variant="ghost" size="sm" onClick={resetDesk} aria-label="Start over">
            <RotateCcw />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </header>

      <nav className="grid grid-cols-3 border-b border-border lg:hidden">
        {(["leads", "live", "record"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "h-12 text-sm capitalize transition-colors duration-150",
              tab === id ? "text-fg" : "text-muted",
            )}
          >
            {id === "leads" ? "People" : id === "live" ? "Call" : "File"}
          </button>
        ))}
      </nav>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside
          className={cn(
            "border-b border-border lg:border-b-0 lg:border-r",
            tab === "leads" ? "block" : "hidden lg:block",
          )}
        >
          <p className="px-4 pt-4 text-[10px] uppercase tracking-[0.14em] text-subtle">People</p>
          <ul className="mt-2">
            {leads.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => useDesk.setState({ selectedId: item.id })}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors duration-150",
                    item.id === lead.id ? "bg-surface" : "hover:bg-raised",
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium">{item.name}</span>
                    <span className="font-indic block text-xs text-muted">
                      {item.city} · {item.languageLabel}
                    </span>
                  </span>
                  <Badge tone={outcomeTone(item.outcome)}>{outcomeLabel(item.outcome)}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section
          className={cn(
            "flex min-h-0 flex-col",
            tab === "live" ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{lead.name}</p>
              <p className="text-xs text-muted">
                {STAGE_LABEL[active?.stage ?? "idle"]} · score{" "}
                <span className="tabular-nums">{lead.score}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {!active ? (
                <>
                  <Button size="sm" variant="outline" onClick={runSample} disabled={sampleRunning}>
                    <Play />
                    Try a call
                  </Button>
                  <Button size="sm" variant="accent" onClick={begin}>
                    <Phone />
                    Dial
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="danger" onClick={hangup}>
                  <PhoneOff />
                  Hang up
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2">
            {LANGS.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={Boolean(active)}
                onClick={() => setLeadLanguage(lead.id, item.id)}
                className={cn(
                  "h-9 rounded-full px-3 font-indic text-xs transition-colors duration-150",
                  lang === item.id ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
                  active && "opacity-40",
                )}
                aria-pressed={lang === item.id}
                aria-label={item.label}
              >
                {item.native}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="min-h-[280px] flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {liveMessages.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                <p className="font-display text-3xl tracking-tight text-balance">
                  Talk with people in their language.
                </p>
                <p className="mt-3 max-w-md text-sm text-pretty text-muted">
                  Choose Hindi, Tamil, Telugu, or English. Then try a call.
                </p>
              </div>
            ) : (
              liveMessages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[86%] rounded-xl px-3 py-2.5 text-sm leading-relaxed",
                    m.role === "agent"
                      ? "bg-raised font-indic text-fg"
                      : "ml-auto bg-accent text-accent-fg",
                  )}
                >
                  {m.text}
                </div>
              ))
            )}
          </div>

          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void send(chip)}
                  className="h-9 rounded-full bg-raised px-3 font-indic text-xs text-fg transition-colors duration-150 hover:bg-surface"
                >
                  {chip}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={active ? "Type a reply" : "Start a call first"}
              disabled={!active}
              className="font-indic"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={listen}
              disabled={!active}
              aria-label="Listen"
            >
              <Mic className={listening ? "text-accent" : undefined} />
            </Button>
            <Button type="submit" size="sm" disabled={!active || !draft.trim()}>
              Send
            </Button>
          </form>
        </section>

        <aside
          className={cn(
            "space-y-6 border-t border-border p-4 lg:border-l lg:border-t-0",
            tab === "record" ? "block" : "hidden lg:block",
          )}
        >
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-subtle">File</p>
            <dl className="grid grid-cols-2 gap-2">
              {[
                ["Consent", lead.consent],
                ["Interest", lead.interested],
                ["Amount", lead.amountBand ?? "—"],
                ["Timeline", lead.timeline ?? "—"],
                ["Outcome", outcomeLabel(lead.outcome)],
                ["Score", String(lead.score)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md bg-surface px-2.5 py-2">
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-subtle">{k}</dt>
                  <dd className="truncate font-indic font-mono text-xs tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-subtle">Today</p>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Completed" value={String(stats.finished)} />
              <Stat label="Ready" value={String(stats.qualified)} />
              <Stat label="Handed over" value={String(stats.escalated)} />
              <Stat label="Reply time" value={stats.avgLat ? "Quick" : "—"} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Cost</p>
            <p className="mt-2 font-display text-3xl tabular-nums tracking-tight">
              ${stats.ourCost.toFixed(2)}
            </p>
            <p className="text-xs text-muted">These calls</p>
            <p className="mt-3 text-sm tabular-nums text-muted">
              A typical calling tool: ${stats.afCost.toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-pretty text-subtle">You can try this here at no charge.</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-subtle">Recent</p>
            <ul className="space-y-2">
              {calls.slice(0, 6).map((c) => {
                const who = leads.find((l) => l.id === c.leadId);
                return (
                  <li key={c.id} className="flex items-center justify-between text-xs">
                    <span className="truncate font-indic text-fg">
                      {who?.name ?? "Lead"}
                      {who ? ` · ${who.languageLabel}` : ""}
                    </span>
                    <span className="ml-2 shrink-0 text-muted tabular-nums">
                      {outcomeLabel(who?.outcome ?? "open")} · ${c.costUsd.toFixed(3)}
                    </span>
                  </li>
                );
              })}
              {calls.length === 0 ? (
                <li className="text-xs text-muted">No calls yet. Try a call.</li>
              ) : null}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
