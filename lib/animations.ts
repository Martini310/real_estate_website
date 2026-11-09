// GSAP ładowany dynamicznie (osobny chunk po pierwszym wyświetleniu strony), a nie
// w początkowym JS: parallax i tak działa dopiero przy przewijaniu, a na telefonie
// każdy kilobajt przed LCP konkuruje ze zdjęciem hero.
type Gsap = typeof import("gsap").gsap;
type ScrollTriggerStatic = typeof import("gsap/ScrollTrigger").ScrollTrigger;
type Cleanup = () => void;

let gsapPromise: Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerStatic }> | null = null;

/** Wspólne, jednorazowe załadowanie GSAP + ScrollTrigger. */
export function loadGsap() {
  gsapPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    }
  );
  return gsapPromise;
}

/**
 * Do `useEffect`: uruchamia asynchroniczną animację i zwraca sprzątanie, które działa
 * także wtedy, gdy komponent zniknie, zanim GSAP zdąży się załadować.
 */
export function startAnimation(init: () => Promise<Cleanup>): Cleanup {
  let cleanup: Cleanup | undefined;
  let disposed = false;
  init().then((fn) => {
    if (disposed) fn();
    else cleanup = fn;
  });
  return () => {
    disposed = true;
    cleanup?.();
  };
}

/**
 * Wspólne warunki ruchu (gsap.matchMedia):
 * - `reduce`  — użytkownik ma w systemie „ogranicz ruch” → brak animacji (WCAG 2.3.3);
 * - `touch`   — telefon / tablet → mniejsza amplituda (mniej „pływania” pod palcem);
 * - pozostałe — pełny efekt (desktop z myszą).
 */
const MOTION_QUERIES = {
  // `all` musi być: gsap.matchMedia z obiektem warunków odpala funkcję tylko, gdy
  // pasuje KTÓRYKOLWIEK z nich — bez tego na zwykłym desktopie parallax nie startował.
  all: "all",
  reduce: "(prefers-reduced-motion: reduce)",
  touch: "(pointer: coarse), (max-width: 767px)",
};

// Miękkie „dociąganie” za przewijaniem (sekundy). `scrub: true` = sztywne 1:1,
// które na kółku myszy daje schodkowy ruch; 0.6 wygładza go jak w aplikacjach premium.
const SCRUB = 0.6;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(MOTION_QUERIES.reduce).matches;
}

/**
 * Parallax zdjęcia w karcie oferty. Warstwa obrazu ma 120% wysokości ramki
 * (po 10% zapasu u góry i dołu = 8,33% wysokości warstwy), więc ruch ±7%
 * wysokości warstwy nigdy nie odsłania krawędzi — niezależnie od rozmiaru karty.
 */
export async function initParallaxCard(card: HTMLElement, image: HTMLElement): Promise<Cleanup> {
  const { gsap } = await loadGsap();
  const mm = gsap.matchMedia();

  mm.add(MOTION_QUERIES, (context) => {
    const { reduce, touch } = context.conditions as { reduce: boolean; touch: boolean };
    if (reduce) return;
    const amplitude = touch ? 4 : 7;

    gsap.fromTo(
      image,
      { yPercent: -amplitude },
      {
        yPercent: amplitude,
        ease: "none",
        force3D: true,
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: SCRUB },
      }
    );
  });

  return () => mm.revert();
}

/**
 * Parallax hero z warstwową głębią: zdjęcie przesuwa się wolniej niż strona,
 * a treść (nagłówek, przyciski) — pośrednio i płynnie wygasa. Trzy prędkości
 * (strona 1 · treść ~0,9 · zdjęcie ~0,8) dają wrażenie przestrzeni.
 *
 * Zapas obrazu MUSI być ≥ przesunięciu: warstwa ma 120% wysokości sekcji
 * (patrz Hero), a przesunięcie to maks. 20% wysokości sekcji.
 */
export async function initHeroParallax(section: HTMLElement, image: HTMLElement, content?: HTMLElement | null): Promise<Cleanup> {
  const { gsap } = await loadGsap();
  const mm = gsap.matchMedia();

  mm.add(MOTION_QUERIES, (context) => {
    const { reduce, touch } = context.conditions as { reduce: boolean; touch: boolean };
    if (reduce) return;
    const imageShift = touch ? 0.12 : 0.2;
    const scrollTrigger = { trigger: section, start: "top top", end: "bottom top", scrub: SCRUB, invalidateOnRefresh: true };

    gsap.to(image, { y: () => -section.offsetHeight * imageShift, ease: "none", scrollTrigger });

    if (content) {
      gsap.to(content, {
        y: () => section.offsetHeight * 0.1,
        opacity: 0,
        ease: "none",
        scrollTrigger: { ...scrollTrigger, end: "80% top" },
      });
    }
  });

  return () => mm.revert();
}

/**
 * Miękkie wejście elementu przy przewinięciu. Bez migotania: jeśli element jest
 * już widoczny przy starcie (nad linią zgięcia), nie animujemy go wcale —
 * wcześniej SSR pokazywał treść, GSAP ją chował i dopiero wtedy odsłaniał.
 */
export async function initReveal(element: HTMLElement): Promise<Cleanup> {
  // Sprawdzenie od razu przy montażu (zanim użytkownik przewinie i zanim GSAP się załaduje).
  if (prefersReducedMotion()) return () => {};
  if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return () => {};

  const { gsap } = await loadGsap();
  const tween = gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: { trigger: element, start: "top 85%", once: true },
    }
  );

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(element, { clearProps: "opacity,transform" });
  };
}
