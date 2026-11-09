#!/usr/bin/env node
// Generuje odchudzone pliki czcionek → app/fonts/ (Google Fonts API, parametr `text=`).
//
// Dlaczego: pełne podzbiory latin + latin-ext ważyły 236 KB (Inter 133 + Montserrat 103),
// a z latin-ext polski potrzebuje tylko 16 liter. Montserrat jest używany wyłącznie
// wersalikami (logo, eyebrow) → same wielkie litery. Wynik: ~64 KB.
//
// Uruchom po zmianie zestawu znaków albo grubości:  node scripts/subset-fonts.mjs
// Czcionki: Inter i Montserrat — SIL Open Font License 1.1 (wolno je przycinać i hostować).

import { writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join("");

// Treść: ASCII + Latin-1 (ó, ², ×, «») + polskie litery + typografia i symbole używane w opisach.
const INTER_TEXT = range(0x20, 0x7e) + range(0xa0, 0xff) + "ĄąĆćĘęŁłŃńŚśŹźŻż" + "–—‘’‚“”„†•…‰‹›€™−→←↑↓";
// Wersaliki marki: wielkie litery (także polskie), cyfry, interpunkcja.
const CAPS_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZĄĆĘŁŃÓŚŹŻ0123456789 .,:;-–—·&/()!?'\"„”@+%";

const FONTS = [
  // Inter: używane grubości 300 (light), 400, 500 (medium) — jeden plik zmienny.
  { family: "Inter:wght@300..500", text: INTER_TEXT, out: "app/fonts/inter-pl.woff2" },
  // Montserrat: 500 i 600 — jeden plik zmienny.
  { family: "Montserrat:wght@500..600", text: CAPS_TEXT, out: "app/fonts/montserrat-caps.woff2" },
];

for (const { family, text, out } of FONTS) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&display=swap&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl, { headers: { "User-Agent": UA } })).text();
  const fontUrl = css.match(/src: url\(([^)]+)\) format\('woff2'\)/)?.[1];
  if (!fontUrl) throw new Error(`Brak woff2 w odpowiedzi dla ${family}`);
  const font = Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
  await writeFile(new URL(`../${out}`, import.meta.url), font);
  console.log(`${out}: ${(font.length / 1024).toFixed(1)} KB`);
}
