import type { ContactFormData } from "@/domain/contact";

export const buildWhatsAppUrl = (phoneNumber: string, data: ContactFormData): string => {
  const cleanPhone = phoneNumber.replace(/[^\d]/g, "");
  const text = [
    "Hola Acrox TV, quiero consultar por un servicio.",
    `Nombre: ${data.firstName} ${data.lastName}`,
    `Asunto: ${data.subject}`,
    `Mensaje: ${data.message}`
  ].join("\n");

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};
