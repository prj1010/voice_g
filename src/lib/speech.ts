import { LANGS, asLang, type Lang } from "./locale";

function speechLang(lang: Lang) {
  return LANGS.find((l) => l.id === lang)?.speech ?? "en-IN";
}

function pickVoice(lang: Lang) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const code = speechLang(lang);
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((v) => v.lang.toLowerCase() === code.toLowerCase());
  if (exact) return exact;
  const prefix = code.slice(0, 2).toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}

export function speak(text: string, lang: Lang, spoken?: string) {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    stopSpeaking();
    const voice = pickVoice(lang);
    const utter = new SpeechSynthesisUtterance(voice ? text : (spoken ?? text));
    utter.lang = voice?.lang ?? (lang === "en" ? "en-IN" : speechLang(lang));
    if (voice) utter.voice = voice;
    utter.rate = 1.02;
    const t = window.setTimeout(() => resolve(), 8000);
    utter.onend = () => {
      window.clearTimeout(t);
      resolve();
    };
    utter.onerror = () => {
      window.clearTimeout(t);
      resolve();
    };
    window.speechSynthesis.speak(utter);
  });
}

export function startListening(lang: Lang, onText: (text: string) => void) {
  const w = window as unknown as {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  type Rec = {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
    start: () => void;
    stop: () => void;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = speechLang(asLang(lang));
  rec.continuous = false;
  rec.interimResults = false;
  rec.onresult = (ev) => {
    const text = ev.results[0]?.[0]?.transcript?.trim();
    if (text) onText(text);
  };
  rec.start();
  return rec;
}
