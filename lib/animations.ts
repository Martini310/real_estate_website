import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const initParallaxCard = (cardRef: HTMLElement, imageRef: HTMLElement) => {
  const card = cardRef;
  const image = imageRef;

  if (!card || !image) return null;

  const scrollTrigger = ScrollTrigger.create({
    trigger: card,
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const translateY = gsap.utils.mapRange(0, 1, -40, 40, progress);
      gsap.set(image, {
        y: translateY,
        force3D: true,
      });
    },
  });

  return () => {
    scrollTrigger.kill();
  };
};

export const initCardHover = (cardRef: HTMLElement, imageRef: HTMLElement) => {
  const card = cardRef;
  const image = imageRef;

  if (!card || !image) return;

  const handleMouseEnter = () => {
    gsap.to(card, {
      scale: 1.02,
      duration: 0.6,
      ease: "power2.out",
    });
    gsap.to(image, {
      scale: 1.1,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(card, {
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });
    gsap.to(image, {
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  card.addEventListener("mouseenter", handleMouseEnter);
  card.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    card.removeEventListener("mouseenter", handleMouseEnter);
    card.removeEventListener("mouseleave", handleMouseLeave);
  };
};

export const initHeroParallax = (sectionRef: HTMLElement, imageRef: HTMLElement) => {
  if (!sectionRef || !imageRef) return null;

  const scrollTrigger = ScrollTrigger.create({
    trigger: sectionRef,
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      // Background moves up slower than scroll (parallax: image lags behind).
      // Łagodny współczynnik + zapas wysokości obrazu (h-[110%] w Hero), żeby
      // parallax nigdy nie odsłonił dolnej krawędzi zdjęcia.
      const y = -progress * sectionRef.offsetHeight * 0.22;
      gsap.set(imageRef, { y });
    },
  });

  return () => {
    scrollTrigger.kill();
  };
};

export const initFadeIn = (elementRef: HTMLElement) => {
  if (!elementRef) return;

  gsap.fromTo(
    elementRef,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: elementRef,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
};
