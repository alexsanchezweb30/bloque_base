// Robot de actualización de noticias cripto.
// Se ejecuta automáticamente cada hora mediante GitHub Actions
// (ver .github/workflows/update-news.yml).
//
// Qué hace:
// 1. Descarga los RSS públicos de varios medios cripto.
// 2. Se queda con titular + resumen corto + enlace a la fuente (nunca copia el artículo entero).
// 3. Le asigna una categoría automáticamente según palabras clave.
// 4. Añade una "lectura rápida" (una frase orientativa, no consejo financiero).
// 5. Guarda todo en data/news.json, que es lo que lee la web.

import Parser from "rss-parser";
import { writeFile, readFile } from "fs/promises";

const parser = new Parser({ timeout: 15000 });

// Puedes añadir o quitar fuentes aquí. Todas son feeds RSS públicos y oficiales.
const FEEDS = [
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk" },
  { url: "https://cointelegraph.com/rss", source: "Cointelegraph" },
  { url: "https://decrypt.co/feed", source: "Decrypt" },
  { url: "https://www.theblock.co/rss.xml", source: "The Block" },
  { url: "https://news.bitcoin.com/feed/", source: "Bitcoin.com News" },
];

const MAX_ITEMS = 40;
const MAX_AGE_HOURS = 72;

// Reglas simples de categoría: primera coincidencia gana.
const TAG_RULES = [
  { tag: "Bitcoin", words: ["bitcoin", "btc", "satoshi"] },
  { tag: "Ethereum", words: ["ethereum", "eth", "vitalik", "layer 2", "rollup"] },
  { tag: "Regulación", words: ["sec", "regulat", "ley", "gobierno", "prohib", "impuesto", "comisión", "tribunal", "demanda"] },
  { tag: "DeFi", words: ["defi", "staking", "protocolo", "liquidez", "yield", "dex"] },
  { tag: "Mercado", words: [] }, // categoría por defecto
];

function detectTag(text) {
  const lower = text.toLowerCase();
  for (const rule of TAG_RULES) {
    if (rule.words.some(w => lower.includes(w))) return rule.tag;
  }
  return "Mercado";
}

// Genera una frase orientativa muy breve según el contenido.
// Esto NO es asesoramiento financiero, es solo una guía de lectura.
function quickTake(tag, text) {
  const lower = text.toLowerCase();
  if (/hack|robo|exploit|vulnerabilidad|breach/.test(lower)) {
    return "Incidente de seguridad — conviene revisar si te afecta antes de operar.";
  }
  if (/aprueba|aprobación|luz verde/.test(lower)) {
    return "Avance regulatorio o institucional — puede mover el sentimiento del mercado.";
  }
  if (/prohíbe|prohibición|bloquea|multa/.test(lower)) {
    return "Endurecimiento regulatorio — vigila cómo reacciona el mercado en las próximas horas.";
  }
  if (tag === "Bitcoin") return "Novedad relacionada con Bitcoin — relevante si sigues el activo de referencia.";
  if (tag === "Ethereum") return "Movimiento en el ecosistema Ethereum — puede afectar a tokens y protocolos asociados.";
  if (tag === "DeFi") return "Novedad del sector DeFi — revisa el protocolo concreto antes de interactuar con él.";
  return "Noticia de mercado — contrástala con más de una fuente antes de tomar decisiones.";
}

function cleanSummary(raw) {
  const text = (raw || "").replace(/<[^>]*>/g, "").trim();
  return text.length > 220 ? text.slice(0, 217).trim() + "…" : text;
}

async function main() {
  const collected = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const entry of parsed.items || []) {
        const title = (entry.title || "").trim();
        const link = entry.link || "";
        const pubDate = entry.isoDate || entry.pubDate || new Date().toISOString();
        if (!title || !link) continue;

        const rawSummary = entry.contentSnippet || entry.summary || entry.content || "";
        const summary = cleanSummary(rawSummary) || "Sin resumen disponible — consulta la fuente original.";
        const tag = detectTag(`${title} ${rawSummary}`);

        collected.push({
          id: Buffer.from(link).toString("base64").slice(0, 24),
          title,
          source: feed.source,
          link,
          pubDate,
          tag,
          summary,
          take: quickTake(tag, `${title} ${rawSummary}`),
        });
      }
    } catch (err) {
      console.error(`Fallo al leer ${feed.source}:`, err.message);
      // seguimos con las demás fuentes aunque una falle
    }
  }

  const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;

  // quita duplicados por id, filtra por antigüedad y ordena por fecha descendente
  const seen = new Set();
  const deduped = collected.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return new Date(item.pubDate).getTime() >= cutoff;
  });

  deduped.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const output = {
    lastUpdated: new Date().toISOString(),
    items: deduped.slice(0, MAX_ITEMS),
  };

  // Si no se consiguió nada nuevo (todas las fuentes fallaron), no pisamos el archivo anterior.
  if (output.items.length === 0) {
    console.warn("No se obtuvieron noticias nuevas; se conserva el archivo anterior.");
    return;
  }

  await writeFile(new URL("../data/news.json", import.meta.url), JSON.stringify(output, null, 2));
  console.log(`Guardadas ${output.items.length} noticias.`);
}

main().catch(err => {
  console.error("Error inesperado en el robot de noticias:", err);
  process.exit(0); // no rompemos el workflow: mejor mantener el sitio con datos viejos que caerse
});
