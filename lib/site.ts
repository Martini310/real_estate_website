/**
 * Dane firmy w jednym miejscu (telefon, e-mail, adres, godziny).
 * Docelowo z WordPressa (ACF Options Page) — komponenty czytają tylko stąd.
 */
export const siteConfig = {
  name: "Peritus Nieruchomości",
  agent: "Damian Rożewski",
  phone: {
    display: "+48 732 432 920",
    href: "tel:+48732432920",
  },
  // TODO: potwierdzić docelowy adres e-mail
  email: "damian@peritus-nieruchomosci.pl",
  address: {
    street: "Bobrownicka 44D/2",
    city: "61-306 Poznań",
  },
  hours: "Pon.–Pt. 9:00–18:00",
  // Sformułowania jak w ogłoszeniach Damiana na portalu.
  role: "Pośrednik w obrocie nieruchomościami",
  licenseNumber: "23975",
  // Tylko weryfikowalne liczby (dane od Damiana, 2026-10).
  stats: [
    { value: "10 lat", label: "doświadczenia na rynku" },
    { value: "150+", label: "sprzedanych nieruchomości" },
    { value: "1", label: "opiekun przez całą transakcję" },
  ],
} as const;
