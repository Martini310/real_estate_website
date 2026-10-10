"use client";

import { useId, useState } from "react";
import { useLeadSubmit } from "@/lib/useLeadSubmit";
import { siteConfig } from "@/lib/site";
import Button from "./ui/Button";
import Field from "./ui/Field";

interface ContactFormProps {
  /** Tytuł oferty, której dotyczy zapytanie. Pominięty na ogólnej stronie kontaktu. */
  propertyTitle?: string;
}

export default function ContactForm({ propertyTitle }: ContactFormProps) {
  // Unikalne id pól — formularz może wystąpić kilka razy na stronie (panel + podstrona).
  const fieldId = useId();
  // Przy ofercie wiadomość jest gotowa — wystarczy podać imię i telefon (mniej pisania = więcej zapytań).
  const initialState = {
    name: "",
    phone: "",
    email: "",
    message: propertyTitle ? `Dzień dobry, proszę o kontakt w sprawie oferty: ${propertyTitle}.` : "",
  };
  const [formState, setFormState] = useState(initialState);

  const { status, isSubmitting, submit } = useLeadSubmit(propertyTitle ? "oferta" : "kontakt");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sent = await submit({ ...formState, ...(propertyTitle ? { property: propertyTitle } : {}) });
    if (sent) setFormState(initialState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        id={`${fieldId}-name`}
        label="Imię i nazwisko"
        type="text"
        name="name"
        value={formState.name}
        onChange={handleChange}
        required
        autoComplete="name"
        placeholder="Jan Kowalski"
      />

      {/* Telefon wymagany — w nieruchomościach to najszybsza droga do umówienia prezentacji */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id={`${fieldId}-phone`}
          label="Telefon"
          type="tel"
          name="phone"
          value={formState.phone}
          onChange={handleChange}
          required
          autoComplete="tel"
          placeholder="np. 600 100 200"
        />
        <Field
          id={`${fieldId}-email`}
          label="E-mail (opcjonalnie)"
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          autoComplete="email"
          placeholder="twoj@email.pl"
        />
      </div>

      <Field
        id={`${fieldId}-message`}
        label="Wiadomość"
        multiline
        name="message"
        value={formState.message}
        onChange={handleChange}
        required
        rows={4}
        placeholder="W czym mogę pomóc? Np. dogodny termin prezentacji"
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Wysyłanie..." : propertyTitle ? "Umów prezentację" : "Wyślij wiadomość"}
      </Button>

      {/* TODO (Faza 4): zgoda RODO + link do polityki prywatności (wymaga strony i treści prawnej) */}

      {/* Region aria-live istnieje stale — czytnik ekranu ogłosi zmianę komunikatu */}
      <div aria-live="polite" className="text-small text-center">
        {status === "success" && (
          <p className="text-beige">
            Dziękuję, wiadomość dotarła. Odezwę się zwykle tego samego dnia roboczego.
          </p>
        )}
        {status === "error" && (
          <p className="text-red-400">
            Nie udało się wysłać wiadomości. Spróbuj ponownie albo zadzwoń: {siteConfig.phone.display}.
          </p>
        )}
      </div>
    </form>
  );
}
