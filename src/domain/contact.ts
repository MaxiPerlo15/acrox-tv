export type ContactFormData = {
  firstName: string;
  lastName: string;
  subject: string;
  message: string;
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

  if (data.subject.trim().length < 4 || data.subject.trim().length > 80) {
    errors.subject = "Asunto: entre 4 y 80 caracteres.";
  }

  if (data.message.trim().length < 15 || data.message.trim().length > 500) {
    errors.message = "Mensaje: entre 15 y 500 caracteres.";
  }

  return errors;
};
