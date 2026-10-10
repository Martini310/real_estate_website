# Lessons

## Efekty „podpisowe”, które właściciel lubi → dopracowywać, nie usuwać
- **Sytuacja (2026-10-10):** w audycie UX zarekomendowałem ograniczenie parallaxu do hero (szum wizualny, wydajność). Właściciel: efekt mu się podoba, jest częścią premium charakteru — zostaje.
- **Reguła:** gdy element jest świadomym wyborem estetycznym właściciela (parallax, panel-overlay itp.), domyślnie proponuję **dopracowanie** (płynność, amplituda, reduced-motion, wydajność), a usunięcie tylko jako opcję z uzasadnieniem — nigdy jako jedyną rekomendację.

## Liczby w audycie mierzyć na buildzie produkcyjnym, nie na plikach w node_modules
- **Sytuacja:** oszacowałem koszt `gsap/all` z rozmiaru `node_modules/gsap/dist/all.js` (792 KB); build prod pokazał 0 różnicy (tree-shaking Turbopacka).
- **Reguła:** wagę bundla podaję dopiero po `next build` (w kopii, jeśli `.next` należy do działającego serwera dev); do tego czasu oznaczam jako „do weryfikacji”.

## `gsap.matchMedia` z obiektem warunków = „którykolwiek pasuje”
- **Sytuacja (etap 4):** warunki `{ reduce, touch }` — na zwykłym desktopie żaden nie pasował, więc funkcja (cały parallax) w ogóle się nie wykonała.
- **Reguła:** przy obiekcie warunków zawsze dodawać warunek bazowy `all: "all"`; weryfikować, że animacja faktycznie startuje (np. `ScrollTrigger.getAll()`, `ticker.tick()` w ukrytym panelu), a nie tylko, że kod się kompiluje.


## Bez „AI slop” w detalach — plakietki-pigułki z kropką, ozdobne separatory
- **Sytuacja (2026-10-10):** licencję podałem jako zaokrągloną „pigułkę” z ramką i ozdobną kropką („Pośrednik · Licencja…”). Właściciel: „typowy ai slop”.
- **Reguła:** informacje (licencja, rola, fakty) podaję zwykłym tekstem w hierarchii typograficznej (rozmiar/kolor), bez ramek-pigułek, kropek-ozdobników i dekoracyjnych „·” w zdaniach. Ramka/tło tylko tam, gdzie pełnią funkcję (np. etykieta na zdjęciu dla czytelności). Ozdobnik musi mieć uzasadnienie UX — inaczej go nie ma.
