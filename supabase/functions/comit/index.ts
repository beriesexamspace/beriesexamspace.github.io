// Edge Function "comit": stuurt een vrije vraag van een ingelogde student naar Gemini.
// De sleutel staat alleen in Supabase (Edge Functions, Secrets: GEMINI_API_KEY).
// Er gaat geen naam of e-mailadres mee, alleen de vraag en een kort anoniem voortgangsoverzicht.
// Per student geldt een maximum per dag (tabel comit_gebruik, alleen een teller); dat maximum hangt af van het plan (plan_van).
// Soort 'ezelsbrug' (ezelsbruggetjes voor een zwak hoofdstuk) is alleen voor Pro.
import { createClient } from 'npm:@supabase/supabase-js@2';

const MAX_PER_PLAN: Record<string, number> = { free: 10, plus: 30, pro: 60 };
// Van boven naar onder: is een model te druk of bestaat het niet (meer), dan het volgende.
const MODELLEN = [Deno.env.get('GEMINI_MODEL'), 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'].filter(Boolean) as string[];
const TOEGESTAAN = ['https://beriesexamspace.com', 'http://localhost:4477', 'http://localhost:4491'];

const REGELS = [
  "Je bent Comit, het studiemaatje van Berie's Exam Space, een oefensite voor psychologiestudenten aan de VUB.",
  'Antwoord altijd in het Nederlands, kort (hooguit vijf zinnen), vriendelijk en concreet. Spreek de student aan met je.',
  'Gebruik geen gedachtestreepjes en nooit het woord gratis. Gebruik geen opmaak zoals sterretjes of kopjes.',
  'Help met leerstof, studeren, examens voorbereiden en vragen over de site.',
  'Voorspel geen examencijfers. Geef geen medisch of juridisch advies. Gaat het echt niet goed met iemand, verwijs dan vriendelijk naar de pagina Leren leren op de site of naar de studentenpsychologen van de VUB.',
  'Weet je iets niet zeker, zeg dat eerlijk in plaats van iets te verzinnen.',
].join(' ');

const EZELSBRUG = [
  'De student vraagt ezelsbruggetjes voor een hoofdstuk waar hij nog moeite mee heeft.',
  'Je krijgt een paar oefenvragen met het juiste antwoord uit dat hoofdstuk.',
  'Maak drie korte ezelsbruggetjes (een zin, een beeld of een woordgrap) die helpen de kern van die begrippen te onthouden.',
  'Zet elk ezelsbruggetje op een eigen regel, zonder nummers of opmaak, en blijf bij de inhoud van de vragen.',
  'Schrijf geen inleiding en geen afsluiter: alleen de drie ezelsbruggetjes.',
].join(' ');

const kop = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && TOEGESTAAN.includes(origin) ? origin : TOEGESTAAN[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  Vary: 'Origin',
});

Deno.serve(async (req) => {
  const headers = kop(req.headers.get('Origin'));
  const antwoord = (inhoud: unknown, status = 200) => new Response(JSON.stringify(inhoud), { status, headers });
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return antwoord({ fout: 'methode' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const dienstSleutel = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
  if (!url || !dienstSleutel) return antwoord({ fout: 'config' }, 500);
  const beheer = createClient(url, dienstSleutel, { auth: { persistSession: false } });
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: { user } } = await beheer.auth.getUser(token);
  if (!user) return antwoord({ fout: 'niet-ingelogd' }, 401);

  let vraag = '';
  let context = '';
  let soort = 'vraag';
  try {
    const body = await req.json();
    vraag = String(body?.vraag ?? '').trim().slice(0, 1000);
    context = String(body?.context ?? '').trim().slice(0, 1500);
    if (body?.soort === 'ezelsbrug') soort = 'ezelsbrug';
  } catch {
    return antwoord({ fout: 'invoer' }, 400);
  }
  if (!vraag) return antwoord({ fout: 'leeg' }, 400);

  const { data: planData } = await beheer.rpc('plan_van', { p_user: user.id });
  const plan = typeof planData === 'string' && planData in MAX_PER_PLAN ? planData : 'free';
  if (soort === 'ezelsbrug' && plan !== 'pro') return antwoord({ fout: 'pro', tekst: 'Ezelsbruggetjes van Comit zitten in Pro.' }, 403);

  const { data: magNog, error: telFout } = await beheer.rpc('comit_tel', { p_user: user.id, p_max: MAX_PER_PLAN[plan] });
  if (telFout) return antwoord({ fout: 'teller' }, 500);
  if (!magNog) {
    const meer = plan === 'free' ? ' Met Plus of Pro kan je meer vragen per dag stellen.' : plan === 'plus' ? ' Met Pro kan je meer vragen per dag stellen.' : '';
    return antwoord({ tekst: `Je hebt vandaag al ${MAX_PER_PLAN[plan]} vragen gesteld. Morgen weer.${meer}`, limiet: true, plan });
  }

  const sleutel = Deno.env.get('GEMINI_API_KEY');
  if (!sleutel) return antwoord({ fout: 'geen-sleutel' }, 500);
  const inhoud = {
    system_instruction: { parts: [{ text: soort === 'ezelsbrug' ? `${REGELS} ${EZELSBRUG}` : REGELS }] },
    contents: [{ role: 'user', parts: [{ text: soort === 'ezelsbrug'
      ? `${vraag}\n\nOefenvragen uit dit hoofdstuk:\n${context}`
      : (context ? `Voortgang van de student, zonder naam: ${context}\n\n` : '') + `Vraag: ${vraag}` }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  };

  const vraagModel = (model: string, snel: boolean) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': sleutel },
    body: JSON.stringify(snel ? { ...inhoud, generationConfig: { ...inhoud.generationConfig, thinkingConfig: { thinkingBudget: 0 } } } : inhoud),
  });

  const pogingen: { model: string; status: number; melding?: string }[] = [];
  for (const model of MODELLEN) {
    let r = await vraagModel(model, true);
    if (r.status === 400) r = await vraagModel(model, false);
    if ([429, 500, 503].includes(r.status)) {
      await new Promise((klaar) => setTimeout(klaar, 900));
      r = await vraagModel(model, true);
    }
    if (!r.ok) {
      let melding = '';
      try { melding = String((await r.json())?.error?.message ?? '').slice(0, 160); } catch {}
      pogingen.push({ model, status: r.status, melding });
      if ([404, 429, 500, 503].includes(r.status)) continue;
      break;
    }
    const data = await r.json();
    const tekst = (data?.candidates?.[0]?.content?.parts ?? []).map((deel: { text?: string }) => deel.text ?? '').join('').trim();
    if (!tekst) { pogingen.push({ model, status: r.status, melding: 'leeg antwoord' }); break; }
    return antwoord({ tekst: tekst.replace(/\s*[\u2014\u2013]\s*/g, ', ').replace(/\*\*?/g, '').replace(/\bgratis\b/gi, 'zonder kosten'), model });
  }
  await beheer.rpc('comit_terug', { p_user: user.id });
  console.error('comit: geen antwoord', JSON.stringify(pogingen));
  return antwoord({ fout: 'ai', pogingen }, 502);
});
