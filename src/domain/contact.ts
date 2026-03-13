export const CONTACT_SERVICE_OPTIONS = [
  { value: "event-coverage", label: "Cobertura de evento" },
  { value: "audiovisual-production", label: "Producción audiovisual" },
  { value: "streaming", label: "Streaming" },
  { value: "music-production", label: "Producción musical" },
  { value: "guest-application", label: "Postularse como invitado" },
  { value: "other", label: "Otro" }
] as const;

export type ContactServiceValue = (typeof CONTACT_SERVICE_OPTIONS)[number]["value"];

export type ContactFormData = {
  firstName: string;
  lastName: string;
  service: ContactServiceValue | "";
  message: string;
  consent: boolean;
};

export type ContactValidationErrors = Partial<Record<keyof ContactFormData, string>>;

export const validateContactForm = (data: ContactFormData): ContactValidationErrors => {
  const errors: ContactValidationErrors = {};

  if (data.firstName.trim().length < 2 || data.firstName.trim().length > 40) {
    errors.firstName = "Nombre: entre 2 y 40 caracteres.";
  }

  if (data.lastName.trim().length < 2 || data.lastName.trim().length > 40) {
    errors.lastName = "Apellido: entre 2 y 40 caracteres.";
  }

  if (!CONTACT_SERVICE_OPTIONS.some((option) => option.value === data.service)) {
    errors.service = "Servicio: seleccioná una opción.";
  }

  if (data.message.trim().length > 500) {
    errors.message = "Mensaje: máximo 500 caracteres.";
  }

  if (!data.consent) {
    errors.consent = "Debés aceptar el uso de tus datos para contacto comercial.";
  }

  return errors;
};
