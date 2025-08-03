export function isValidTikTokUrl(url: string): boolean {
  const tikTokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/;
  return tikTokRegex.test(url);
}

export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url) {
    return { isValid: false, error: "URL is required" };
  }

  if (!isValidTikTokUrl(url)) {
    return { isValid: false, error: "Please enter a valid TikTok URL" };
  }

  return { isValid: true };
}
