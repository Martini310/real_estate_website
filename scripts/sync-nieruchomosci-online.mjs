#!/usr/bin/env node
// Import ofert agenta z nieruchomosci-online.pl → data/properties.json.
//
// Od Fazy 3 źródłem ofert na stronie jest WordPress (wtyczka peritus-core,
// importer w PHP z tymi samymi regułami). Ten skrypt służy do odświeżenia pliku
// awaryjnego `data/properties.json` (używany bez WORDPRESS_API_URL i przy buildzie,
// gdy WP jest niedostępny). Zmiany w parserze wprowadzaj w obu miejscach.
//
// Portal nie ma publicznego API do odczytu, więc czytamy publiczne strony:
// profil agenta (lista ofert + tytuły) i każde ogłoszenie (JSON-LD, galeria
// `photos.x`, tabela „Szczegóły ogłoszenia”, pełny opis). Wynik mapujemy na
// typ `Property` z types/property.ts.
//
// Skrypt jest idempotentny — każde uruchomienie odtwarza listę 1:1 z portalem
// (oferty zdjęte z portalu znikają ze strony). Użycie:
//   node scripts/sync-nieruchomosci-online.mjs [url-profilu-agenta]
//
// Uwaga: to parser HTML cudzego serwisu — po zmianie ich szablonu może wymagać
// poprawek. Skrypt przerywa działanie (nie nadpisuje danych), gdy coś nie pasuje.

import { writeFile } from "node:fs/promises";

const AGENT_URL =
  process.argv[2] ?? "https://www.nieruchomosci-online.pl/agenci/damian-rozewski";
const OUTPUT = new URL("../data/properties.json", import.meta.url);
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

const AGENT = {
  name: "Damian Rożewski",
  phone: "+48 732 432 920",
  email: "damian@peritus-nieruchomosci.pl",
  image: "/damian.webp",
};

/** Wiersze tabeli szczegółów, których nie pokazujemy jako „cechy”. */
const SKIPPED_DETAILS = new Set(["Typ oferty", "Cena", "Źródło", "Adres"]);

// --- pomocnicze -------------------------------------------------------------

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.text();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", sup2: "²", ndash: "–", mdash: "—", bdquo: "„", rdquo: "”", hellip: "…" };

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (match, code) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return String.fromCodePoint(n);
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** HTML → czysty tekst w jednej linii. */
const toText = (html) =>
  decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").replace(/\s+([,;)])/g, "$1").replace(/\(\s+/g, "(").trim();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** „63.60 m²” / „386,00m²” → 63.6 */
const parseNumber = (value) => {
  const match = String(value ?? "").replace(",", ".").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

// --- parsowanie -------------------------------------------------------------

/** Profil agenta → [{ id, url, title }] */
function parseAgentPage(html) {
  const offers = new Map();
  const linkRe = /<a[^>]+href="(https:\/\/[a-z-]+\.nieruchomosci-online\.pl\/[^"]+\/(\d+)\.html)"[^>]*>([\s\S]*?)<\/a>/g;
  for (const [, url, id, inner] of html.matchAll(linkRe)) {
    const title = toText(inner);
    if (title && !offers.has(id)) offers.set(id, { id: Number(id), url, title });
  }
  return [...offers.values()];
}

function parseListingJsonLd(html) {
  const scripts = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const [, json] of scripts) {
    const data = JSON.parse(json);
    if (Array.isArray(data.offers) && data.address) return data;
  }
  throw new Error("Brak JSON-LD ogłoszenia");
}

function parsePhotos(html) {
  const match = html.match(/photos:\s*(\{[\s\S]*?\}),\s*\n/);
  if (!match) throw new Error("Brak galerii (photos)");
  const photos = JSON.parse(match[1]).x ?? [];
  if (photos.length === 0) throw new Error("Pusta galeria");
  return photos;
}

/** Tabela „Szczegóły ogłoszenia” → [{ label, value }]; wiersze-kontynuacje doklejane do poprzednich. */
function parseDetails(html) {
  const start = html.indexOf('id="detailsTable"');
  const end = html.indexOf("Opis nieruchomości", start);
  if (start === -1 || end === -1) throw new Error("Brak tabeli szczegółów");

  const rows = [];
  const rowRe = /<li[^>]*>\s*<strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/li>/g;
  for (const [, rawLabel, rawValue] of html.slice(start, end).matchAll(rowRe)) {
    const label = toText(rawLabel).replace(/:$/, "");
    const value = toText(rawValue).replace(/\s*\(zobacz inne.*$/, "");
    if (!value) continue;
    if (label) rows.push({ label, value });
    else if (rows.length) rows[rows.length - 1].value += `; ${value}`;
  }
  return rows;
}

function parseDescription(html) {
  const match = html.match(/<div class="estate-desc-more"[^>]*>([\s\S]*?)<\/div>/);
  if (!match) throw new Error("Brak opisu");
  return decodeEntities(match[1].replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""))
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/** Oznaczenia typu „Kupujący nie płaci prowizji”, „Oferta na wyłączność”. */
function parseHighlights(html) {
  return ["Oferta na wyłączność", "Kupujący nie płaci prowizji"].filter((text) => html.includes(text));
}

// --- mapowanie na Property --------------------------------------------------

function mapType(ld, details) {
  const offerType = details.find((d) => d.label === "Typ oferty")?.value ?? "";
  if (ld["@type"] === "House" || offerType.startsWith("dom")) return "house";
  if (offerType.startsWith("działka")) return "plot";
  if (offerType.startsWith("lokal") || offerType.startsWith("budynek")) return "commercial";
  return "apartment";
}

function toProperty({ id, url, title }, html) {
  const ld = parseListingJsonLd(html);
  const details = parseDetails(html);
  const photos = parsePhotos(html);
  const props = Object.fromEntries((ld.additionalProperty ?? []).map((p) => [p.name, p.value]));
  const detail = (label) => details.find((d) => d.label.startsWith(label))?.value ?? "";
  const type = mapType(ld, details);

  const city = ld.address.addressLocality;
  // Bez ulicy w JSON-LD bierzemy pierwszą część adresu (zwykle osiedle/dzielnica).
  const district = detail("Adres").split(",")[0].trim();
  const street = ld.address.streetAddress;
  const charakterystyka = detail("Charakterystyka");

  // Liczba poziomów lokalu: tylko gdy portal ją podaje (0 = brak danych, UI ukrywa).
  const layout = detail("Rozkład");
  const floors = /dwupoziomowe/.test(layout) ? 2 : /jednopoziomowe/.test(layout) ? 1 : 0;

  return {
    id,
    slug: `${slugify(`${title} ${title.includes(city) ? "" : city}`)}-${id}`,
    title,
    location: street ? `${city}, ul. ${street}` : district && district !== city ? `${city}, ${district}` : city,
    price: Number(ld.offers[0].price),
    area: parseNumber(props["Floor size"] ?? props["House area"] ?? props["Land area"]),
    type,
    bedrooms: Number(props["Number of rooms"]) || parseNumber(charakterystyka.match(/(\d+) pok/)?.[1]),
    bathrooms: Number(props["Number of bathrooms"]) || parseNumber(charakterystyka.match(/(\d+) łazien/)?.[1]),
    floors,
    yearBuilt: Number(props["Year built"]) || 0,
    featured: false,
    image: photos[0],
    description: parseDescription(html),
    features: [
      ...parseHighlights(html),
      ...details
        .filter((d) => !SKIPPED_DETAILS.has(d.label))
        .map((d) => `${d.label}: ${d.value}`),
    ],
    agent: AGENT,
    gallery: photos,
    sourceUrl: url,
  };
}

// --- main -------------------------------------------------------------------

const offers = parseAgentPage(await fetchHtml(AGENT_URL));
if (offers.length === 0) throw new Error(`Nie znaleziono ofert na ${AGENT_URL}`);
console.log(`Znaleziono ${offers.length} ofert`);

const properties = [];
for (const offer of offers) {
  await sleep(1000); // grzecznie wobec serwisu
  const property = toProperty(offer, await fetchHtml(offer.url));
  properties.push(property);
  console.log(`  ✓ ${property.id} ${property.title} — ${property.gallery.length} zdjęć`);
}

// Najnowsze ogłoszenia (najwyższe ID) jako wyróżnione — priorytet ładowania zdjęć.
[...properties]
  .sort((a, b) => b.id - a.id)
  .slice(0, 2)
  .forEach((property) => (property.featured = true));

await writeFile(OUTPUT, `${JSON.stringify(properties, null, 2)}\n`);
console.log(`Zapisano ${properties.length} ofert → data/properties.json`);
