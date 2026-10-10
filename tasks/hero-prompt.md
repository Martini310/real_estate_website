# Nowe zdjęcie hero: propozycja i prompty (Nano Banana)

## Co i dlaczego

**Rekomendacja: koncepcja A, jasne, ciepłe wnętrze mieszkania w złotej godzinie.**

- **Zgodność z ofertą:** 6 z 8 ofert to mieszkania. Kupujący po kliknięciu „Zobacz oferty” trafia na to, co obiecało zdjęcie, i nie czuje rozczarowania jak przy willi nad morzem.
- **Obie grupy klientów:** wnętrze kojarzy się z „domem” (kupujący) i z dobrze przygotowaną nieruchomością (sprzedający: „tak pokażę Twoje mieszkanie”).
- **Spójność z marką:** beże, trawertyn, dąb i ciepłe światło to ta sama paleta co strona (espresso, beż, pomarańcz). Zdjęcie przestaje walczyć z UI.
- **Premium bez przesady:** premium ma tu oznaczać staranną prezentację, a nie luksusowy segment, którego w portfelu nie ma.
- **Kompozycja pod nowy hero (wariant A):** tekst stoi z lewej, na dole (desktop) i na dole (mobile), przyciemniony gradientem od dołu i od lewej. W tych miejscach zdjęcie musi być spokojne, a światło i okno z prawej.

Alternatywa **B** (niżej): nowoczesny dom w zieleni pod Poznaniem. Lepsza, jeśli w portfelu przybędzie domów i działek.

Czego unikać: rozpoznawalnych zabytków Poznania (AI je przekłamuje, a lokalni to wyłapią), ludzi, przepychu (marmury, złoto, żyrandole), widoku na morze i góry.

---

## Jak generować

1. **Model:** Nano Banana Pro (Gemini 3 Pro Image), bo daje lepszy fotorealizm i rozdzielczość do 4K. Zwykły Nano Banana też zadziała, ale w niższej rozdzielczości.
2. Ustaw **proporcje 16:9** (jeśli interfejs ma przełącznik). Wygeneruj 4–6 wersji i wybierz najspokojniejszą po lewej stronie.
3. Wersję mobilną zrób **z wybranego zdjęcia** (prompt nr 3), a nie od zera. Dzięki temu oba kadry pokazują to samo wnętrze.
4. Poprawki rób rozmową, np. „make the light slightly warmer”, „remove the vase”, „make the left wall plainer”. Model dobrze edytuje istniejący obraz.
5. Sprawdź róg zdjęcia: jeśli pojawi się widoczny znak wodny, wygeneruj w miejscu, które go nie dodaje (np. Google AI Studio), albo daj znać, przytniemy kadr.

**Wymagania techniczne:** desktop ≥ 2560×1440 px, mobile ≥ 1080×1920 px, JPEG jakość ~85 (lub WebP). Wrzuć pliki do `public/` (np. `hero.jpg`, `hero-mobile.jpg`), resztę podepnę w kodzie. Dolne ~10% kadru może być niewidoczne przez ruch parallax, więc nic ważnego tam nie umieszczaj.

---

## Prompt 1: desktop 16:9 (koncepcja A, rekomendowana)

```
A photorealistic interior photograph of a spacious, light-filled living room in a modern apartment in Poznań, Poland, captured at golden hour. Warm, low evening sunlight streams through a large floor-to-ceiling window on the right side of the frame, casting long, soft shadows across a wide-plank light oak floor.

The palette is warm and restrained: cream and soft beige walls, travertine and linen textures, a low oatmeal bouclé sofa, a slim walnut sideboard, a ceramic vase with dried grasses, a few subtle brushed-brass accents. Through the window, a gently out-of-focus view of mature trees and the low rooftops of a quiet European city at sunset.

Composition: the left third of the frame is calm and uncluttered — a plain warm wall in gentle shadow — and the lower third is a quiet expanse of floor, leaving clean negative space for text. The visual interest (window, sunlight, sofa) sits on the right and centre.

Shot on a full-frame camera with a 24mm tilt-shift lens at chest height, perfectly straight verticals, natural light only, soft film-like contrast, high dynamic range, crisp fine detail. Editorial real-estate photography: immaculate but lived-in, elegant and calm, not ostentatious or luxurious. No people, no text, no logos, no watermark. Landscape 16:9.
```

## Prompt 2: alternatywa B, desktop 16:9 (dom pod Poznaniem)

```
A photorealistic architectural photograph of a modern two-storey single-family house on the edge of a pine forest near Poznań, Poland, at golden hour. Simple contemporary form: light render facade, warm vertical larch-wood cladding, large black-framed windows glowing softly with warm interior light, a flat roof. A neat lawn and ornamental grasses in front, tall Scots pines behind catching the last warm sunlight.

Composition: the house sits on the right half of the frame; the left third is calm — soft evening sky and the dark, quiet silhouette of pine trees — and the lower third is a smooth lawn in gentle shadow, leaving clean negative space for text.

Shot on a full-frame camera with a 24mm tilt-shift lens from eye level, straight verticals, natural light only, warm and restrained colour grading, soft contrast, high dynamic range. Realistic, elegant, calm — a well-kept family home, not a luxury mansion. No people, no cars, no text, no logos, no watermark. Landscape 16:9.
```

## Prompt 3: wersja mobilna 9:16 (z wybranego zdjęcia)

Załącz wybrany obraz desktopowy i wpisz:

```
Using the attached image as the exact reference, recompose the same scene as a vertical 9:16 photograph for a mobile screen. Keep the same room, furniture, materials, colours and golden-hour light — it must look like the same photo shoot.

Place the window and the sunlight in the upper half of the frame. Keep the lower 40% calm and uncluttered (floor and soft shadow), with no important objects there, so text can sit on top. Straight verticals, natural light, same editorial style. No people, no text, no logos, no watermark. Portrait 9:16.
```

(Przy koncepcji B zamień „same room, furniture, materials” na „same house, facade, trees”, a „window and the sunlight” na „the house and the glowing windows”.)
