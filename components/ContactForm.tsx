"use client";

import { useState } from "react";

interface ContactFormProps {
  /** Tytuł oferty, której dotyczy zapytanie. Pominięty na ogólnej stronie kontaktu. */
  propertyTitle?: string;
}

export default function ContactForm({ propertyTitle }: ContactFormProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // TODO (Faza 4): podłączyć realną wysyłkę (API route / e-mail / WP)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Form submitted:", {
        ...formState,
        ...(propertyTitle ? { property: propertyTitle } : {}),
      });

      setSubmitStatus("success");
      setFormState({ name: "", email: "", message: "" });

      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (error) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-text-secondary text-sm mb-2">
          Imię i nazwisko
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/8 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
          placeholder="Jan Kowalski"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-text-secondary text-sm mb-2">
          Adres e-mail
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/8 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-text-secondary text-sm mb-2">
          Wiadomość
        </label>
        <textarea
          id="message"
          name="message"
          value={formState.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/8 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors resize-none"
          placeholder="Napisz, czym jesteś zainteresowany/a w tej nieruchomości..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 border border-accent/50 text-accent font-light uppercase tracking-widest hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Wysyłanie..." : "Wyślij zapytanie"}
      </button>

      {submitStatus === "success" && (
        <p className="text-accent text-sm text-center">
          Dziękujemy! Wkrótce się odezwiemy.
        </p>
      )}
      {submitStatus === "error" && (
        <p className="text-red-400 text-sm text-center">
          Coś poszło nie tak. Spróbuj ponownie.
        </p>
      )}
    </form>
  );
}
