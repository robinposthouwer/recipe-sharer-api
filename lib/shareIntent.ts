export interface ShareIntentData {
  text?: string | null;
  webUrl?: string | null;
  files?: Array<{ path: string; mimeType?: string; fileName?: string }>;
  meta?: { title?: string };
}

export function extractUrl(data: ShareIntentData | null | undefined): string | null {
  if (!data) return null;
  if (data.webUrl) return data.webUrl;
  if (data.text && /^https?:\/\//.test(data.text.trim())) return data.text.trim();
  const match = data.text?.match(/(https?:\/\/[^\s]+)/);
  return match ? match[1] : null;
}

export function extractTitle(data: ShareIntentData | null | undefined): string | null {
  if (!data) return null;
  if (data.meta?.title) return data.meta.title;
  if (data.text) {
    const url = extractUrl(data);
    const withoutUrl = url ? data.text.replace(url, '').trim() : data.text.trim();
    if (withoutUrl.length > 0) return withoutUrl.slice(0, 100);
  }
  return null;
}

export function extractImagePath(data: ShareIntentData | null | undefined): string | null {
  if (!data) return null;
  const imageFile = data.files?.find(
    (f) => f.mimeType?.startsWith('image/') || f.path.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
  );
  return imageFile?.path ?? null;
}
