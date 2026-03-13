import { CONTACT_SERVICE_OPTIONS, type ContactFormData } from "@/domain/contact";

export const buildWhatsAppMessage = (data: ContactFormData): string => {
  const serviceLabel =
    CONTACT_SERVICE_OPTIONS.find((option) => option.value === data.service)?.label ?? "Otro";

  return [
    `Hola! Soy ${data.firstName} ${data.lastName}.`,
    "",
    "Estoy interesado en:",
    serviceLabel,
    "",
    "Mensaje:",
    data.message
  ].join("\n");
};

export const buildWhatsAppUrl = (phoneNumber: string, data: ContactFormData): string => {
  const cleanPhone = phoneNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
};
