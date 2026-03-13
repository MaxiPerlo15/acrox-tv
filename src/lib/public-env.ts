const readPublic = (value: string | undefined, developmentFallback: string): string => {
  if (value && value.trim().length > 0) {
    return value;
  }
  return developmentFallback;
};

export type PublicEnv = {
  whatsappNumber: string;
  contactEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
};

export const publicEnv: PublicEnv = {
  whatsappNumber: readPublic(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, "5493533589122"),
  contactEmail: readPublic(
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    "guillermo.chabrando@gmail.com"
  ),
  instagramUrl: readPublic(
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    "https://www.instagram.com/acrox_productora/"
  ),
  tiktokUrl: readPublic(
    process.env.NEXT_PUBLIC_TIKTOK_URL,
    "https://www.tiktok.com/@acroxtv"
  ),
  youtubeUrl: readPublic(
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
    "https://www.youtube.com/@GuillermoChabrando"
  )
};
