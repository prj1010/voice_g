import { create } from "zustand";
import { applyTurn, opener, type Lead, type Outcome, type Session } from "./agent";
import { LANGS, asLang, type Lang, type Stage } from "./locale";

const SEED: Lead[] = [
  {
    id: "rahul",
    name: "Rahul Sharma",
    city: "Delhi",
    language: "hi",
    languageLabel: "हिन्दी",
    phone: "+91 98xxx 44120",
    consent: "unknown",
    interested: "unknown",
    amountBand: null,
    timeline: null,
    outcome: "open",
    score: 0,
  },
  {
    id: "priya",
    name: "Priya Natarajan",
    city: "Chennai",
    language: "ta",
    languageLabel: "தமிழ்",
    phone: "+91 94xxx 22018",
    consent: "unknown",
    interested: "unknown",
    amountBand: null,
    timeline: null,
    outcome: "open",
    score: 0,
  },
  {
    id: "vikram",
    name: "Vikram Reddy",
    city: "Hyderabad",
    language: "te",
    languageLabel: "తెలుగు",
    phone: "+91 90xxx 77431",
    consent: "unknown",
    interested: "unknown",
    amountBand: null,
    timeline: null,
    outcome: "open",
    score: 0,
  },
  {
    id: "ananya",
    name: "Ananya Iyer",
    city: "Bengaluru",
    language: "en",
    languageLabel: "English",
    phone: "+91 80xxx 11904",
    consent: "unknown",
    interested: "unknown",
    amountBand: null,
    timeline: null,
    outcome: "open",
    score: 0,
  },
];

type DeskState = {
  leads: Lead[];
  calls: Session[];
  activeId: string | null;
  selectedId: string;
  startCall: (leadId: string) => { reply: string; spoken: string } | null;
  ingestLeadText: (text: string, latencyMs?: number) => { reply: string; spoken: string; done: boolean } | null;
  endCall: () => void;
  setLeadLanguage: (leadId: string, lang: Lang) => void;
  resetDesk: () => void;
};

let callN = 0;

export const useDesk = create<DeskState>((set, get) => ({
  leads: SEED,
  calls: [],
  activeId: null,
  selectedId: SEED[0].id,

  startCall: (leadId) => {
    const { leads, activeId } = get();
    if (activeId) return null;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;
    const line = opener(lead);
    callN += 1;
    const session: Session = {
      id: `c${callN}`,
      leadId,
      stage: "greet_consent",
      messages: [{ id: `s${callN}`, role: "agent", text: line.reply, at: Date.now() }],
      latenciesMs: [],
      costUsd: 0,
      startedAt: Date.now(),
    };
    set({
      selectedId: leadId,
      activeId: session.id,
      calls: [session, ...get().calls],
      leads: leads.map((l) => (l.id === leadId ? { ...l, outcome: "in_call" as Outcome } : l)),
    });
    return line;
  },

  ingestLeadText: (text, latencyMs = 40) => {
    const { activeId, calls, leads } = get();
    if (!activeId) return null;
    const session = calls.find((c) => c.id === activeId);
    if (!session) return null;
    const lead = leads.find((l) => l.id === session.leadId);
    if (!lead) return null;
    const res = applyTurn(lead, session, text);
    res.session.latenciesMs = [...session.latenciesMs, latencyMs];
    set({
      leads: leads.map((l) => (l.id === lead.id ? res.lead : l)),
      calls: calls.map((c) => (c.id === session.id ? res.session : c)),
      activeId: res.done ? null : activeId,
    });
    return { reply: res.reply, spoken: res.spoken, done: res.done };
  },

  endCall: () => {
    const { activeId, calls, leads } = get();
    if (!activeId) return;
    const session = calls.find((c) => c.id === activeId);
    set({
      activeId: null,
      calls: calls.map((c) =>
        c.id === activeId ? { ...c, stage: "done" as Stage, costUsd: c.costUsd || 0.01 } : c,
      ),
      leads: leads.map((l) =>
        l.id === session?.leadId && l.outcome === "in_call"
          ? { ...l, outcome: "abandoned" as Outcome }
          : l,
      ),
    });
  },

  setLeadLanguage: (leadId, lang) => {
    const meta = LANGS.find((l) => l.id === lang);
    set({
      selectedId: leadId,
      leads: get().leads.map((l) =>
        l.id === leadId
          ? { ...l, language: asLang(lang), languageLabel: meta?.native ?? "English" }
          : l,
      ),
    });
  },

  resetDesk: () => set({ leads: SEED.map((l) => ({ ...l })), calls: [], activeId: null, selectedId: SEED[0].id }),
}));

export function useActiveSession() {
  return useDesk((s) => s.calls.find((c) => c.id === s.activeId) ?? s.calls[0] ?? null);
}
