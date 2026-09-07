export type Lang = "en" | "hi" | "ta" | "te";

export const LANGS = [
  { id: "en" as const, label: "English", native: "English", speech: "en-IN" },
  { id: "hi" as const, label: "Hindi", native: "हिन्दी", speech: "hi-IN" },
  { id: "ta" as const, label: "Tamil", native: "தமிழ்", speech: "ta-IN" },
  { id: "te" as const, label: "Telugu", native: "తెలుగు", speech: "te-IN" },
];

export function asLang(value: string): Lang {
  if (value === "hi" || value === "ta" || value === "te") return value;
  return "en";
}

export type Stage =
  | "idle"
  | "greet_consent"
  | "confirm_name"
  | "qualify_interest"
  | "qualify_amount"
  | "qualify_timeline"
  | "handle_objection"
  | "close"
  | "escalated"
  | "done";

export const STAGE_LABEL: Record<Stage, string> = {
  idle: "Waiting",
  greet_consent: "Hello",
  confirm_name: "Name",
  qualify_interest: "Interest",
  qualify_amount: "Amount",
  qualify_timeline: "Timing",
  handle_objection: "Note",
  close: "Close",
  escalated: "Handed over",
  done: "Done",
};

type Pack = {
  opener: (name: string) => string;
  spoken: (name: string) => string;
  confirmName: (name: string) => string;
  interest: string;
  amount: string;
  timeline: string;
  close: string;
  noConsent: string;
  notInterested: string;
  escalate: string;
  listenFail: string;
};

const PACK: Record<Lang, Pack> = {
  en: {
    opener: (n) =>
      `Hello ${n}, this is Warmline calling about your loan enquiry. Is now a good time?`,
    spoken: (n) =>
      `Hello ${n}, this is Warmline calling about your loan enquiry. Is now a good time?`,
    confirmName: (n) => `Just to confirm, am I speaking with ${n}?`,
    interest: "Are you still looking at a personal loan, or should I close this?",
    amount: "Roughly what amount — under 2 lakh, 2 to 5 lakh, or above 5 lakh?",
    timeline: "When would you want this — this month, in 1 to 3 months, or later?",
    close: "Thank you. I have noted this. Someone will call you if needed. Goodbye.",
    noConsent: "No problem. I will not continue. Thank you.",
    notInterested: "Understood. I will close this enquiry. Thank you, goodbye.",
    escalate: "I will pass this to a person, with the notes from this call.",
    listenFail: "I did not catch that. Could you say that again?",
  },
  hi: {
    opener: (n) =>
      `नमस्ते ${n}, मैं Warmline से आपके लोन के बारे में बात कर रहा हूँ। क्या अभी समय है?`,
    spoken: (n) => `Namaste ${n}, main Warmline se aapke loan ke baare mein baat kar raha hoon. Kya abhi samay hai?`,
    confirmName: (n) => `बस पुष्टि कर लूँ, क्या मैं ${n} से बात कर रहा हूँ?`,
    interest: "क्या आप अभी भी पर्सनल लोन देख रहे हैं, या इसे बंद कर दूँ?",
    amount: "लगभग कितनी राशि — 2 लाख से कम, 2 से 5 लाख, या 5 लाख से अधिक?",
    timeline: "यह कब चाहिए — इस महीने, 1 से 3 महीने में, या बाद में?",
    close: "धन्यवाद। मैंने यह नोट कर लिया है। जरूरत हो तो कोई आपको कॉल करेगा। नमस्ते।",
    noConsent: "कोई बात नहीं। मैं आगे नहीं बढ़ूँगा। धन्यवाद।",
    notInterested: "समझ गया। मैं यह पूछताछ बंद कर देता हूँ। धन्यवाद।",
    escalate: "मैं इसे एक व्यक्ति को सौंप रहा हूँ, इस कॉल के नोट्स के साथ।",
    listenFail: "समझ नहीं आया। क्या आप दोबारा कह सकते हैं?",
  },
  ta: {
    opener: (n) =>
      `வணக்கம் ${n}, நான் Warmline-ல இருந்து உங்க கடன் கேள்வி பத்தி பேசுறேன். இப்ப பேசலாமா?`,
    spoken: (n) =>
      `Vanakkam ${n}, naan Warmline-la irundhu unga kadan kelvi pathi pesuren. Ippa pesalama?`,
    confirmName: (n) => `உறுதி பண்ணிக்கிறேன், ${n} தானே பேசுறீங்க?`,
    interest: "நீங்க இன்னும் தனிப்பட்ட கடன் பார்க்கிறீங்களா, இல்ல இதை மூடிடட்டுமா?",
    amount: "ஏறக்குறைய எவ்வளவு — 2 லட்சத்துக்கு கீழ, 2 முதல் 5 லட்சம், இல்ல 5 லட்சத்துக்கு மேல?",
    timeline: "இது எப்போ வேணும் — இந்த மாசம், 1 முதல் 3 மாசத்துல, இல்ல அப்புறமா?",
    close: "நன்றி. இதை குறிச்சுக்கிறேன். தேவைப்பட்டா யாரும் உங்களை அழைப்பாங்க. வணக்கம்.",
    noConsent: "பிரச்சனை இல்ல. நான் தொடர மாட்டேன். நன்றி.",
    notInterested: "புரிஞ்சுது. இந்த கேள்வியை மூடிடறேன். நன்றி.",
    escalate: "இதை ஒரு நபரிடம் கொடுக்கிறேன், இந்த அழைப்பின் குறிப்புகளோடு.",
    listenFail: "பிடிக்கல. மறுபடியும் சொல்ல முடியுமா?",
  },
  te: {
    opener: (n) =>
      `నమస్కారం ${n}, నేను Warmline నుంచి మీ లోన్ విచారణ గురించి మాట్లాడుతున్నాను. ఇప్పుడు మాట్లాడవచ్చా?`,
    spoken: (n) =>
      `Namaskaram ${n}, nenu Warmline nunchi mee loan vicharana gurunchi matladutunnanu. Ippudu matladavaccha?`,
    confirmName: (n) => `నిర్ధారించుకుంటాను, ${n} తోనే మాట్లాడుతున్నానా?`,
    interest: "మీరు ఇంకా పర్సనల్ లోన్ చూస్తున్నారా, లేక దీన్ని మూసేయమా?",
    amount: "సుమారు ఎంత — 2 లక్షల లోపు, 2 నుంచి 5 లక్షలు, లేక 5 లక్షల పైన?",
    timeline: "ఇది ఎప్పుడు కావాలి — ఈ నెల, 1 నుంచి 3 నెలల్లో, లేక తర్వాత?",
    close: "ధన్యవాదాలు. ఇది నోట్ చేసుకున్నాను. అవసరమైతే ఎవరైనా మిమ్మల్ని కాల్ చేస్తారు. నమస్కారం.",
    noConsent: "సమస్య లేదు. నేను కొనసాగించను. ధన్యవాదాలు.",
    notInterested: "అర్థమైంది. ఈ విచారణను మూసేస్తాను. ధన్యవాదాలు.",
    escalate: "దీన్ని ఒక వ్యక్తికి అప్పగిస్తాను, ఈ కాల్ నోట్స్ తో.",
    listenFail: "అర్థం కాలేదు. మళ్లీ చెప్పగలరా?",
  },
};

export function packFor(lang: Lang): Pack {
  return PACK[lang] ?? PACK.en;
}

export function promptFor(stage: Stage, lang: Lang, name: string): { reply: string; spoken: string } {
  const p = packFor(lang);
  const first = name.split(" ")[0] ?? name;
  switch (stage) {
    case "greet_consent":
      return { reply: p.opener(first), spoken: p.spoken(first) };
    case "confirm_name":
      return { reply: p.confirmName(name), spoken: p.confirmName(name) };
    case "qualify_interest":
      return { reply: p.interest, spoken: p.interest };
    case "qualify_amount":
      return { reply: p.amount, spoken: p.amount };
    case "qualify_timeline":
      return { reply: p.timeline, spoken: p.timeline };
    case "close":
      return { reply: p.close, spoken: p.close };
    case "escalated":
      return { reply: p.escalate, spoken: p.escalate };
    default:
      return { reply: p.close, spoken: p.close };
  }
}

export const SAMPLE_REPLIES: Record<Lang, Partial<Record<Stage, string>>> = {
  en: {
    greet_consent: "Yes, now is fine.",
    confirm_name: "Yes, that's me.",
    qualify_interest: "Yes, still looking.",
    qualify_amount: "Around 3 lakh.",
    qualify_timeline: "This month.",
  },
  hi: {
    greet_consent: "हाँ, अभी ठीक है।",
    confirm_name: "हाँ, मैं ही हूँ।",
    qualify_interest: "हाँ, अभी देख रहा हूँ।",
    qualify_amount: "लगभग 3 लाख।",
    qualify_timeline: "इस महीने।",
  },
  ta: {
    greet_consent: "ஆமா, இப்ப பேசலாம்.",
    confirm_name: "ஆமா, நான்தான்.",
    qualify_interest: "ஆமா, இன்னும் பாக்குறேன்.",
    qualify_amount: "சுமார் 3 லட்சம்.",
    qualify_timeline: "இந்த மாசம்.",
  },
  te: {
    greet_consent: "అవును, ఇప్పుడు సరే.",
    confirm_name: "అవును, నేనే.",
    qualify_interest: "అవును, ఇంకా చూస్తున్నాను.",
    qualify_amount: "సుమారు 3 లక్షలు.",
    qualify_timeline: "ఈ నెల.",
  },
};

export function chipsFor(stage: Stage, lang: Lang): string[] {
  const map: Record<Lang, Record<string, string[]>> = {
    en: {
      greet_consent: ["Yes, now is fine", "Not now", "Talk to a person"],
      confirm_name: ["Yes, that's me", "Wrong person"],
      qualify_interest: ["Yes, still looking", "Not interested"],
      qualify_amount: ["Under 2 lakh", "2 to 5 lakh", "Above 5 lakh"],
      qualify_timeline: ["This month", "1 to 3 months", "Later"],
    },
    hi: {
      greet_consent: ["हाँ, अभी ठीक है", "अभी नहीं", "किसी व्यक्ति से बात"],
      confirm_name: ["हाँ, मैं ही हूँ", "गलत व्यक्ति"],
      qualify_interest: ["हाँ, देख रहा हूँ", "रुचि नहीं"],
      qualify_amount: ["2 लाख से कम", "2 से 5 लाख", "5 लाख से अधिक"],
      qualify_timeline: ["इस महीने", "1 से 3 महीने", "बाद में"],
    },
    ta: {
      greet_consent: ["ஆமா, இப்ப பேசலாம்", "இப்ப வேண்டாம்", "ஒரு நபரிடம் பேசு"],
      confirm_name: ["ஆமா, நான்தான்", "தவறான நபர்"],
      qualify_interest: ["ஆமா, பாக்குறேன்", "வேண்டாம்"],
      qualify_amount: ["2 லட்சத்துக்கு கீழ", "2 முதல் 5 லட்சம்", "5 லட்சத்துக்கு மேல"],
      qualify_timeline: ["இந்த மாசம்", "1 முதல் 3 மாசம்", "அப்புறம்"],
    },
    te: {
      greet_consent: ["అవును, ఇప్పుడు సరే", "ఇప్పుడు కాదు", "ఒక వ్యక్తితో మాట్లాడు"],
      confirm_name: ["అవును, నేనే", "తప్పు వ్యక్తి"],
      qualify_interest: ["అవును, చూస్తున్నాను", "అవసరం లేదు"],
      qualify_amount: ["2 లక్షల లోపు", "2 నుంచి 5 లక్షలు", "5 లక్షల పైన"],
      qualify_timeline: ["ఈ నెల", "1 నుంచి 3 నెలలు", "తర్వాత"],
    },
  };
  return map[lang][stage] ?? [];
}

function hasAny(text: string, needles: string[]) {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

export function parseHuman(text: string) {
  return hasAny(text, [
    "human",
    "person",
    "agent",
    "manager",
    "lawyer",
    "complaint",
    "व्यक्ति",
    "इंसान",
    "நபர்",
    "వ్యక్తి",
  ]);
}

export function parseNo(text: string) {
  return hasAny(text, [
    "no",
    "not now",
    "busy",
    "don't",
    "dont",
    "wrong",
    "नहीं",
    "नही",
    "अभी नहीं",
    "வேண்டாம்",
    "இல்ல",
    "కాదు",
    "వద్దు",
    "లేదు",
  ]);
}

export function parseYes(text: string) {
  return hasAny(text, [
    "yes",
    "yeah",
    "ok",
    "okay",
    "sure",
    "fine",
    "that's me",
    "ha",
    "haan",
    "हाँ",
    "हां",
    "ठीक",
    "ஆமா",
    "சரி",
    "அவును",
    "అవును",
    "సరే",
  ]);
}

export function parseAmount(text: string): "under_2L" | "2-5L" | "5L+" | null {
  const t = text.toLowerCase();
  if (hasAny(t, ["under 2", "2 लाख से कम", "2 லட்சத்துக்கு கீழ", "2 లక్షల లోపు", "below 2"]))
    return "under_2L";
  if (hasAny(t, ["above 5", "5 लाख से अधिक", "5 லட்சத்துக்கு மேல", "5 లక్షల పైన", "5l+"]))
    return "5L+";
  if (hasAny(t, ["3 lakh", "3 लाख", "3 லட்சம்", "3 లక్ష", "2 to 5", "2-5", "2 से 5", "2 முதல் 5", "2 నుంచి 5"]))
    return "2-5L";
  if (/\b5\b/.test(t) && !/\b2\b/.test(t)) return "5L+";
  if (/\b2\b/.test(t)) return "2-5L";
  return null;
}

export function parseTimeline(text: string): "this_month" | "1-3_months" | "later" | null {
  const t = text.toLowerCase();
  if (hasAny(t, ["this month", "इस महीने", "இந்த மாசம்", "ఈ నెల"])) return "this_month";
  if (hasAny(t, ["1 to 3", "1-3", "1 से 3", "1 முதல் 3", "1 నుంచి 3"])) return "1-3_months";
  if (hasAny(t, ["later", "बाद", "அப்புறம்", "తర్వాత"])) return "later";
  return "this_month";
}
