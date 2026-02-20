const getOptional = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  return value;
};

export const env = {
  youtubeApiKey: getOptional("YOUTUBE_API_KEY"),
  youtubeChannelId: getOptional("YOUTUBE_CHANNEL_ID"),
  instagramAccessToken: getOptional("INSTAGRAM_ACCESS_TOKEN"),
  instagramUserId: getOptional("INSTAGRAM_USER_ID"),
  whatsappNumber: getOptional("NEXT_PUBLIC_WHATSAPP_NUMBER") ?? "5493533589122",
  contactEmail:
    getOptional("NEXT_PUBLIC_CONTACT_EMAIL") ?? "guillermo.chabrando@gmail.com",
  instagramUrl:
    getOptional("NEXT_PUBLIC_INSTAGRAM_URL") ?? "https://www.instagram.com/acrox_productora/",
  youtubeUrl:
    getOptional("NEXT_PUBLIC_YOUTUBE_URL") ?? "https://www.youtube.com/@GuillermoChabrando"
};
