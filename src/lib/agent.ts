import {
  asLang,
  packFor,
  parseAmount,
  parseHuman,
  parseNo,
  parseTimeline,
  parseYes,
  promptFor,
  type Lang,
  type Stage,
} from "./locale";

export type Outcome =
  | "open"
  | "in_call"
  | "qualified"
  | "callback"
  | "escalated"
  | "not_interested"
  | "no_consent"
  | "abandoned";

export type Message = {
  id: string;
  role: "agent" | "lead";
  text: string;
  at: number;
};

export type Lead = {
  id: string;
  name: string;
  city: string;
  language: Lang;
  languageLabel: string;
  phone: string;
  consent: string;
  interested: string;
  amountBand: string | null;
  timeline: string | null;
  outcome: Outcome;
  score: number;
};

export type Session = {
  id: string;
  leadId: string;
  stage: Stage;
  messages: Message[];
  latenciesMs: number[];
  costUsd: number;
  startedAt: number;
};

let msgN = 0;
function mid() {
  msgN += 1;
  return `m${msgN}`;
}

export function opener(lead: Lead) {
  return promptFor("greet_consent", asLang(lead.language), lead.name);
}

export function applyTurn(
  lead: Lead,
  session: Session,
  text: string,
): { lead: Lead; session: Session; reply: string; spoken: string; done: boolean } {
  const lang = asLang(lead.language);
  const pack = packFor(lang);
  const nextLead = { ...lead };
  const nextSession: Session = {
    ...session,
    messages: [
      ...session.messages,
      { id: mid(), role: "lead", text, at: Date.now() },
    ],
  };

  const finish = (stage: Stage, outcome: Outcome, reply: string, spoken: string, done: boolean) => {
    nextLead.outcome = outcome;
    nextSession.stage = stage;
    nextSession.messages = [
      ...nextSession.messages,
      { id: mid(), role: "agent", text: reply, at: Date.now() },
    ];
    if (done) nextSession.costUsd = 0.02;
    return { lead: nextLead, session: nextSession, reply, spoken, done };
  };

  if (parseHuman(text)) {
    const line = promptFor("escalated", lang, lead.name);
    nextLead.score = Math.max(nextLead.score, 40);
    return finish("escalated", "escalated", line.reply, line.spoken, true);
  }

  const stage = session.stage;

  if (stage === "greet_consent") {
    if (parseNo(text) && !parseYes(text)) {
      return finish("done", "no_consent", pack.noConsent, pack.noConsent, true);
    }
    nextLead.consent = "granted";
    const line = promptFor("confirm_name", lang, lead.name);
    return finish("confirm_name", "in_call", line.reply, line.spoken, false);
  }

  if (stage === "confirm_name") {
    if (parseNo(text) && !parseYes(text)) {
      return finish("done", "no_consent", pack.noConsent, pack.noConsent, true);
    }
    const line = promptFor("qualify_interest", lang, lead.name);
    return finish("qualify_interest", "in_call", line.reply, line.spoken, false);
  }

  if (stage === "qualify_interest") {
    if (parseNo(text) && !parseYes(text)) {
      nextLead.interested = "no";
      nextLead.score = 10;
      return finish("done", "not_interested", pack.notInterested, pack.notInterested, true);
    }
    nextLead.interested = "yes";
    nextLead.score += 30;
    const line = promptFor("qualify_amount", lang, lead.name);
    return finish("qualify_amount", "in_call", line.reply, line.spoken, false);
  }

  if (stage === "qualify_amount") {
    const band = parseAmount(text) ?? "2-5L";
    nextLead.amountBand = band;
    nextLead.score += band === "5L+" ? 25 : band === "2-5L" ? 20 : 10;
    const line = promptFor("qualify_timeline", lang, lead.name);
    return finish("qualify_timeline", "in_call", line.reply, line.spoken, false);
  }

  if (stage === "qualify_timeline") {
    const when = parseTimeline(text) ?? "this_month";
    nextLead.timeline = when;
    nextLead.score += when === "this_month" ? 25 : when === "1-3_months" ? 15 : 5;
    const outcome: Outcome = nextLead.score >= 60 ? "qualified" : "callback";
    const line = promptFor("close", lang, lead.name);
    return finish("close", outcome, line.reply, line.spoken, true);
  }

  return finish("done", nextLead.outcome === "in_call" ? "abandoned" : nextLead.outcome, pack.close, pack.close, true);
}
