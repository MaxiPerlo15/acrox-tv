"use client";

import { useState, type FormEvent } from "react";
import { buildWhatsAppUrl } from "@/application/contact.service";
import { type ContactFormData, validateContactForm } from "@/domain/contact";

type ContactFormProps = {
  whatsappNumber: string;
};

const initialForm: ContactFormData = {
  firstName: "",
  lastName: "",
  subject: "",
  message: ""
};

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

const ContactForm = ({ whatsappNumber }: ContactFormProps) => {
  const [form, setForm] = useState<ContactFormData>(initialForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const trackWhatsAppSubmit = () => {
    const analyticsData = {
      event: "click_enviar_whatsapp",
      channel: "contact_form",
      platform: "whatsapp"
    };
    const typedWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
      gtag?: (...args: unknown[]) => void;
    };

    if (typedWindow.dataLayer) {
      typedWindow.dataLayer.push(analyticsData);
    }

    if (typeof typedWindow.gtag === "function") {
      typedWindow.gtag("event", "click_enviar_whatsapp", {
        channel: "contact_form",
        platform: "whatsapp"
      });
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateContactForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback(null);
      return;
    }

    const url = buildWhatsAppUrl(whatsappNumber, form);
    const openedWindow = window.open(url, "_blank");
    if (!openedWindow) {
      setFeedback({
        kind: "error",
        message: "No pudimos abrir WhatsApp. Habilita pop-ups e intenta nuevamente."
      });
      return;
    }

    openedWindow.opener = null;

    trackWhatsAppSubmit();
    setFeedback({
      kind: "success",
      message: "Listo! Te redirigimos a WhatsApp para que puedas enviar tu consulta."
    });
    setForm(initialForm);
    setAcceptedTerms(false);
    setErrors({});
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="grid two">
        <label>
          Nombre*
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, firstName: event.target.value }));
              setFeedback(null);
            }}
            placeholder="Ej: Juan"
          />
          {errors.firstName ? <small>{errors.firstName}</small> : null}
        </label>
        <label>
          Apellido*
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, lastName: event.target.value }));
              setFeedback(null);
            }}
            placeholder="Ej: Perez"
          />
          {errors.lastName ? <small>{errors.lastName}</small> : null}
        </label>
      </div>

      <label>
        Asunto*
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, subject: event.target.value }));
            setFeedback(null);
          }}
          placeholder="Ej: Cobertura de evento"
        />
        {errors.subject ? <small>{errors.subject}</small> : null}
      </label>

      <label>
        Mensaje*
        <textarea
          name="message"
          value={form.message}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, message: event.target.value }));
            setFeedback(null);
          }}
          rows={6}
          placeholder="Contanos qué necesitás y en qué fecha."
        />
        <div className="message-meta">
          <span>{form.message.length}/500</span>
          {errors.message ? <small>{errors.message}</small> : null}
        </div>
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          required
          checked={acceptedTerms}
          onChange={(event) => {
            setAcceptedTerms(event.target.checked);
            setFeedback(null);
          }}
        />
        <span>Acepto el uso de mis datos para contacto comercial.</span>
      </label>

      {feedback ? (
        <p className={feedback.kind === "success" ? "form-feedback success" : "form-feedback error"}>
          {feedback.message}
        </p>
      ) : null}

      <button type="submit">Enviar por WhatsApp</button>
    </form>
  );
};

export default ContactForm;
