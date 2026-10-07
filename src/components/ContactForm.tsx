"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { buildWhatsAppUrl } from "@/application/contact.service";
import ServiceSelect from "@/components/ServiceSelect";
import {
  type ContactServiceValue,
  type ContactFormData,
  type ContactValidationErrors,
  validateContactForm
} from "@/domain/contact";
import { CONTACT_PRESET_EVENT, CONTACT_PRESET_KEY } from "@/domain/contact-preset";
import { WhatsAppIcon } from "@/components/icons";
import { trackWhatsAppClick } from "@/lib/google-analytics";

type ContactFormProps = {
  whatsappNumber: string;
};

type ContactFieldName = keyof ContactFormData;
type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

const initialForm: ContactFormData = {
  firstName: "",
  lastName: "",
  service: "",
  message: "",
  consent: false
};

const initialTouched: Record<ContactFieldName, boolean> = {
  firstName: false,
  lastName: false,
  service: false,
  message: false,
  consent: false
};
const SUBMIT_DELAY_MS = 320;
const DEFAULT_MESSAGE_PLACEHOLDER =
  "Contanos qué necesitás, para qué fecha y en qué localidad. Si ya tenés una idea del tipo de cobertura o producción, sumala también.";
const GUEST_MESSAGE_PLACEHOLDER =
  "Contanos brevemente tu propuesta, por qué te gustaría participar y tu disponibilidad.";

const ContactForm = ({ whatsappNumber }: ContactFormProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitLockRef = useRef(false);
  const [form, setForm] = useState<ContactFormData>(initialForm);
  const [touched, setTouched] = useState<Record<ContactFieldName, boolean>>(initialTouched);
  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const visibleErrors = useMemo(() => {
    const nextVisibleErrors: ContactValidationErrors = {};

    for (const field of Object.keys(errors) as ContactFieldName[]) {
      if (touched[field]) {
        nextVisibleErrors[field] = errors[field];
      }
    }

    return nextVisibleErrors;
  }, [errors, touched]);

  const markTouched = (field: ContactFieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateAndSync = (nextForm: ContactFormData) => {
    const nextErrors = validateContactForm(nextForm);
    setErrors(nextErrors);
    return nextErrors;
  };

  const trackWhatsAppSubmit = () => {
    try {
      trackWhatsAppClick();
    } catch {
      // Nunca bloquear la navegacion a WhatsApp por fallas de analytics.
    }
  };

  const updateForm = <K extends ContactFieldName>(field: K, value: ContactFormData[K]) => {
    setForm((prev) => {
      const nextForm = { ...prev, [field]: value };
      validateAndSync(nextForm);
      return nextForm;
    });
    setFeedback(null);
    setHasSubmitted(false);
  };

  const onTextChange = (field: "firstName" | "lastName" | "message") => {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateForm(field, event.target.value);
    };
  };

  const onConsentChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateForm("consent", event.target.checked);
  };

  useEffect(() => {
    const applyPreset = (service: ContactServiceValue) => {
      setForm((prev) => ({ ...prev, service }));
      setTouched((prev) => ({ ...prev, service: true }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.service;
        return next;
      });
      setFeedback(null);
      setHasSubmitted(false);
    };

    const initialPreset = window.sessionStorage.getItem(CONTACT_PRESET_KEY) as ContactServiceValue | null;
    if (initialPreset) {
      applyPreset(initialPreset);
      window.sessionStorage.removeItem(CONTACT_PRESET_KEY);
    }

    const onPreset = (event: Event) => {
      const customEvent = event as CustomEvent<{ service?: ContactServiceValue }>;
      const service = customEvent.detail?.service;
      if (!service) return;
      applyPreset(service);
    };

    window.addEventListener(CONTACT_PRESET_EVENT, onPreset as EventListener);
    return () => window.removeEventListener(CONTACT_PRESET_EVENT, onPreset as EventListener);
  }, []);

  const submitToWhatsApp = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const nextTouched = {
      ...initialTouched,
      firstName: true,
      lastName: true,
      service: true,
      message: true,
      consent: true
    };
    setTouched(nextTouched);

    const nextErrors = validateAndSync(form);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback(null);
      submitLockRef.current = false;
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(false);
    setFeedback(null);

    try {
      const url = buildWhatsAppUrl(whatsappNumber, form);
      trackWhatsAppSubmit();

      const popup = window.open(url, "_blank");
      if (popup) {
        popup.opener = null;
      } else {
        // Estado explicito de fallback cuando no abre nueva pestana.
        setFeedback({
          kind: "success",
          message: "Abrimos WhatsApp en esta misma pestaña porque el navegador bloqueó la nueva."
        });
        setHasSubmitted(true);
        setIsSubmitting(false);
        submitLockRef.current = false;
        window.location.assign(url);
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, SUBMIT_DELAY_MS));

      setForm(initialForm);
      setTouched(initialTouched);
      setErrors({});
      setHasSubmitted(true);
      setFeedback({
        kind: "success",
        message: "¡Listo! Abrimos WhatsApp en una nueva pestaña."
      });
    } catch {
      setHasSubmitted(false);
      setFeedback({
        kind: "error",
        message: "No pudimos abrir WhatsApp. Intentá nuevamente."
      });
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitToWhatsApp();
  };

  const onMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const messagePlaceholder =
    form.service === "guest-application" ? GUEST_MESSAGE_PLACEHOLDER : DEFAULT_MESSAGE_PLACEHOLDER;

  return (
    <form ref={formRef} className="contact-form" onSubmit={onSubmit}>
      <div className="grid two">
        <label>
          <span className="field-label">
            Nombre<span className="required-asterisk">*</span>
          </span>
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={onTextChange("firstName")}
            onBlur={() => markTouched("firstName")}
            placeholder="Ej: Juan"
          />
          {visibleErrors.firstName ? <small>{visibleErrors.firstName}</small> : null}
        </label>
        <label>
          <span className="field-label">
            Apellido<span className="required-asterisk">*</span>
          </span>
          <input
            type="text"
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={onTextChange("lastName")}
            onBlur={() => markTouched("lastName")}
            placeholder="Ej: Pérez"
          />
          {visibleErrors.lastName ? <small>{visibleErrors.lastName}</small> : null}
        </label>
      </div>

      <div className="contact-field">
        <span className="field-label">
          Servicio<span className="required-asterisk">*</span>
        </span>
        <ServiceSelect
          value={form.service}
          onChange={(value) => updateForm("service", value)}
          onBlur={() => markTouched("service")}
          invalid={Boolean(visibleErrors.service)}
        />
        {visibleErrors.service ? <small>{visibleErrors.service}</small> : null}
      </div>

      <label>
        <span className="field-label">
          Mensaje
        </span>
        <textarea
          name="message"
          value={form.message}
          onChange={onTextChange("message")}
          onBlur={() => markTouched("message")}
          onKeyDown={onMessageKeyDown}
          rows={6}
          placeholder={messagePlaceholder}
        />
        {visibleErrors.message ? <small>{visibleErrors.message}</small> : null}
        <div className="message-meta">
          <span>{form.message.length}/500</span>
        </div>
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={onConsentChange}
          onBlur={() => markTouched("consent")}
        />
        <span>Acepto el uso de mis datos para contacto comercial.</span>
      </label>
      {visibleErrors.consent ? <small>{visibleErrors.consent}</small> : null}

      {feedback ? (
        <p
          className={feedback.kind === "success" ? "form-feedback success" : "form-feedback error"}
          role={feedback.kind === "error" ? "alert" : "status"}
          aria-live={feedback.kind === "error" ? "assertive" : "polite"}
        >
          {feedback.message}
        </p>
      ) : null}

      <button
        type="submit"
        className="contact-submit-button"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        <WhatsAppIcon />
        <span>
          {isSubmitting
            ? "Enviando por WhatsApp..."
            : feedback?.kind === "error"
              ? "Reintentar envío"
              : hasSubmitted
                ? "Enviado por WhatsApp"
                : "Enviar por WhatsApp"}
        </span>
      </button>
    </form>
  );
};

export default ContactForm;
