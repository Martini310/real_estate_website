// Opis oferty z portalu (gołe linie tekstu) → bloki do ładnego wyświetlenia.
//
// Portale oddają opis jako linie bez znaczników: śródtytuły, listy i „Etykieta: wartość”
// wyglądają tak samo jak zwykłe zdania. Ten moduł odtwarza strukturę regułami
// wyprowadzonymi z prawdziwych opisów (nieruchomosci-online.pl i Otodom). Treść zostaje
// ta sama — zmieniamy tylko interpunkcję na końcach pozycji listy, wielkość pierwszej
// litery i KRZYCZĄCE wstępy („0% PROWIZJI” → „0% prowizji”). Usuwamy podpis agenta
// (pokazuje go karta opiekuna), a formułkę prawną oddajemy osobno jako drobny tekst.

export interface DescriptionItem {
  /** „Powierzchnia” z „Powierzchnia: 64 m²”; brak = zwykła pozycja */
  label?: string;
  text: string;
}

export type DescriptionBlock =
  | { type: "lead"; text: string }
  | { type: "heading"; text: string; level: 3 | 4; meta?: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: DescriptionItem[] }
  /** Lista „etykieta: krótka wartość” → tabelka */
  | { type: "facts"; items: DescriptionItem[] };

export interface FormattedDescription {
  blocks: DescriptionBlock[];
  /** „Powyższe ogłoszenie ma charakter informacyjny…” — drobnym drukiem na końcu */
  disclaimer?: string;
}

const BULLET = /^[-–•*]\s+/;
const SENTENCE_END = /[.!?]$/;
const STARTS_UPPER = /^[\p{Lu}\d]/u;
const STARTS_LOWER = /^\p{Ll}/u;
const STARTS_CAPITAL = /^\p{Lu}/u;
const LABEL = /^(\p{Lu}[^:]{0,38}?):\s+(\S.*)$/u;
/** „Parter (54,70 m²) strefa dzienna…” → nazwa, metraż, reszta */
const AREA_HEADING = /^(\p{Lu}[^()]{0,60}?)\s*\(([\d\s,.]+m²)\)\s*(.*)$/u;
const SIGNATURE_LINE = /^(Pośrednik w obrocie|Licencja zawodowa)/i;
const DISCLAIMER = /^Powyższe ogłoszenie ma charakter informacyjny/i;
/** Linia dublująca nagłówek sekcji „O nieruchomości” */
const REDUNDANT = /^opis nieruchomości:?$/i;
/** Krótka linia = kandydat na pozycję listy / śródtytuł (dłuższe to akapity) */
const SHORT = 80;
/** Pozycja listy bez znacznika może być nieco dłuższa niż „krótka linia” */
const ITEM_MAX = 100;

const wordCount = (line: string) => line.split(" ").length;
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const isBullet = (line: string) => BULLET.test(line);
const endsColon = (line: string) => line.endsWith(":");
const isShort = (line: string) => line.length <= SHORT && !SENTENCE_END.test(line);
const hasLabel = (line: string) => {
  const match = line.match(LABEL);
  return match !== null && wordCount(match[1]) <= 5;
};

/**
 * KRZYCZĄCY wstęp linii → zwykłe litery: „BRAK PODATKU PCC (0%) oszczędzasz” →
 * „Brak podatku PCC (0%) oszczędzasz”. Tylko ciąg wersalików na początku linii
 * (marki w środku zdania, np. „pompa INNOVA”, zostają); skróty bez samogłosek (PCC, WC) też.
 */
function calmShouting(line: string): string {
  const tokens = line.split(" ");
  let end = 0;
  while (end < tokens.length && !/\p{Ll}/u.test(tokens[end])) end++;
  const run = tokens.slice(0, end);
  if (!run.some((token) => (token.match(/\p{Lu}/gu) ?? []).length >= 4)) return line;

  const calmed = run.map((token) => (/[AEIOUYĄĘÓ]/.test(token) ? token.toLowerCase() : token));
  return capitalize([...calmed, ...tokens.slice(end)].join(" "));
}

/** Tekst → linie; podpis i formułka sklejone w jedną linię zostają rozdzielone. */
function toLines(text: string): string[] {
  return text
    .replace(/\s+(?=Pośrednik w obrocie|Licencja zawodowa nr|Powyższe ogłoszenie ma charakter informacyjny)/g, "\n")
    .split("\n")
    .map((line) => calmShouting(line.replace(/\s+/g, " ").trim()))
    .filter((line) => line && !REDUNDANT.test(line));
}

/** Odcina formułkę prawną i podpis agenta z końca opisu. */
function splitFooter(lines: string[]): { body: string[]; disclaimer?: string } {
  const disclaimerAt = lines.findIndex((line) => DISCLAIMER.test(line));
  const body = disclaimerAt === -1 ? [...lines] : lines.slice(0, disclaimerAt);
  const disclaimer = disclaimerAt === -1 ? undefined : lines.slice(disclaimerAt).join(" ");

  let removedSignature = false;
  while (body.length && SIGNATURE_LINE.test(body[body.length - 1])) {
    body.pop();
    removedSignature = true;
  }
  // Nad „Pośrednik w obrocie…” stoi imię i nazwisko agenta.
  const last = body[body.length - 1];
  if (removedSignature && last && wordCount(last) <= 4 && !/[\d.!?:,]/.test(last)) body.pop();

  return { body, disclaimer };
}

function toItem(line: string): DescriptionItem {
  let text = line.replace(BULLET, "").replace(/[,;]$/, "");
  // Kropka na końcu pozycji tylko, gdy pozycja ma kilka zdań — lista ma spójną interpunkcję.
  if (text.endsWith(".") && !/\.\s/.test(text)) text = text.slice(0, -1);
  const match = text.match(LABEL);
  if (match && wordCount(match[1]) <= 5) return { label: match[1], text: match[2] };
  return { text: capitalize(text) };
}

/** Lista „etykieta: wartość” z krótkimi wartościami czyta się lepiej jako tabelka. */
function listBlock(items: DescriptionItem[]): DescriptionBlock {
  const labeled = items.filter((item) => item.label);
  const lengths = labeled.map((item) => item.text.length);
  const isFacts =
    labeled.length >= items.length * 0.6 &&
    Math.max(...lengths) <= 60 &&
    lengths.reduce((sum, n) => sum + n, 0) / lengths.length <= 32;
  return { type: isFacts ? "facts" : "list", items };
}

/** Śródtytuł zakończony dwukropkiem: „Układ pomieszczeń:”, „Lokalizacja – osiedle…:”. */
function isColonHeading(line: string): boolean {
  // „się” = zdanie-wstęp („W okolicy znajdują się:”); `\b` nie działa z polskimi literami.
  if (!STARTS_UPPER.test(line) || /\.\s/.test(line) || /(^|\s)się[\s:]/.test(line)) return false;
  const beforeDash = line.split(" – ")[0];
  return wordCount(line) <= 6 || (beforeDash !== line && wordCount(beforeDash) <= 3);
}

/** Śródtytuł bez dwukropka: „Media i infrastruktura”, „Atrakcyjna lokalizacja”. */
function isPlainHeading(line: string): boolean {
  return (
    STARTS_UPPER.test(line) &&
    line.length <= 70 &&
    wordCount(line) <= 9 &&
    !/[.,;:!?]$/.test(line) &&
    !hasLabel(line)
  );
}

function headingBlocks(line: string): DescriptionBlock[] {
  const text = line.replace(/:$/, "");
  const area = text.match(AREA_HEADING);
  if (area && wordCount(area[1]) <= 7) {
    const [, name, meta, rest] = area;
    // „Parter”, „Piętro” = podsekcje układu pomieszczeń
    const blocks: DescriptionBlock[] = [{ type: "heading", text: capitalize(name), meta, level: wordCount(name) <= 2 ? 4 : 3 }];
    if (rest) blocks.push({ type: "paragraph", text: capitalize(rest) });
    return blocks;
  }
  return [{ type: "heading", text: capitalize(text), level: 3 }];
}

export function formatDescription(text: string): FormattedDescription {
  const { body: lines, disclaimer } = splitFooter(toLines(text));
  const blocks: DescriptionBlock[] = [];
  let i = 0;

  // Linia-hasło nad opisem: „Nowoczesny dom 112 m² z ogrodem | 6 pokoi | Gruszczyn”.
  const first = lines[0];
  if (first && !/[.:]$/.test(first) && first.length <= 160 && (first.includes("|") || isPlainHeading(first))) {
    blocks.push({ type: "lead", text: first.split(/\s*\|\s*/).join(", ") });
    i = 1;
  }

  /** Lista z myślnikami; linie bez myślnika doklejamy, gdy wyglądają na jej ciąg dalszy. */
  const readBullets = () => {
    const items: DescriptionItem[] = [];
    while (i < lines.length) {
      const line = lines[i];
      const continues =
        !endsColon(line) && line.length <= ITEM_MAX && (STARTS_LOWER.test(line) || line.endsWith(","));
      if (!isBullet(line) && !continues) break;
      items.push(toItem(line));
      i++;
    }
    blocks.push(listBlock(items));
  };

  /** Pozycje bez znaczników pod „Nagłówek:” (Otodom gubi `<li>`, część autorów nie pisze myślników). */
  const readUnmarked = () => {
    const run: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      if (isBullet(line) || endsColon(line) || line.length > ITEM_MAX) break;
      const prev = run[run.length - 1];
      // Wyliczanie małymi literami kończy się na linii od wielkiej litery („Lokalizacja i okolica”).
      // Pozycja od cyfry („3 pokoje,”) nie przerywa.
      if (run.length && run.every((item) => !STARTS_CAPITAL.test(item)) && STARTS_CAPITAL.test(line)) break;
      // Zdanie po liście bez kropek to już akapit podsumowania, nie pozycja.
      if (prev && SENTENCE_END.test(line) && !prev.endsWith(",") && !run.some((item) => SENTENCE_END.test(item))) break;
      run.push(line);
      i++;
    }
    if (run.length === 1 && SENTENCE_END.test(run[0]) && !hasLabel(run[0])) {
      blocks.push({ type: "paragraph", text: run[0] });
    } else if (run.length) {
      blocks.push(listBlock(run.map(toItem)));
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (isBullet(line)) {
      readBullets();
      continue;
    }

    if (endsColon(line)) {
      if (AREA_HEADING.test(line) || isColonHeading(line)) blocks.push(...headingBlocks(line));
      else blocks.push({ type: "paragraph", text: line }); // „W okolicy znajdują się:” — wstęp do listy
      i++;
      readUnmarked();
      continue;
    }

    // Seria krótkich linii z etykietami/przecinkami bez nagłówka nad nią: „Cena mieszkania: 473 040 zł”.
    if (isShort(line)) {
      let end = i;
      while (end < lines.length && !isBullet(lines[end]) && !endsColon(lines[end]) && isShort(lines[end])) end++;
      const run = lines.slice(i, end);
      if (run.length >= 2 && run.some((item) => hasLabel(item) || item.endsWith(","))) {
        blocks.push(listBlock(run.map(toItem)));
        i = end;
        continue;
      }
    }

    blocks.push(...(isPlainHeading(line) ? headingBlocks(line) : [{ type: "paragraph" as const, text: line }]));
    i++;
  }

  return { blocks, disclaimer };
}
