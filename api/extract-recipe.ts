interface SchemaRecipe {
  '@type'?: string;
  name?: string;
  image?: string | string[] | { url?: string }[];
  recipeIngredient?: string[];
  recipeInstructions?: Array<{ '@type'?: string; text?: string; name?: string } | string>;
}

function extractImage(obj: SchemaRecipe): string | null {
  const img = obj.image;
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (Array.isArray(img) && img.length > 0) {
    const first = img[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && 'url' in first) return (first as { url?: string }).url ?? null;
  }
  return null;
}

function extractInstructions(obj: SchemaRecipe): string {
  const steps = obj.recipeInstructions;
  if (!steps || !Array.isArray(steps)) return '';
  return steps
    .map((s) => (typeof s === 'string' ? s : s.text ?? s.name ?? ''))
    .filter(Boolean)
    .join('\n\n');
}

function findRecipe(data: unknown): SchemaRecipe | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (obj['@type'] === 'Recipe') return obj as unknown as SchemaRecipe;
  const graph = obj['@graph'] as unknown[] | undefined;
  if (Array.isArray(graph)) {
    const recipe = graph.find((g) => g && typeof g === 'object' && (g as Record<string, unknown>)['@type'] === 'Recipe');
    if (recipe) return recipe as SchemaRecipe;
  }
  const itemList = obj['@graph'] as unknown[] | undefined;
  if (Array.isArray(itemList)) {
    for (const item of itemList) {
      if (item && typeof item === 'object' && (item as Record<string, unknown>)['@type'] === 'Recipe') {
        return item as SchemaRecipe;
      }
    }
  }
  return null;
}

function parseJsonLdScripts(html: string): SchemaRecipe | null {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const json = JSON.parse(m[1].trim()) as unknown;
      const recipe = findRecipe(json);
      if (recipe) return recipe;
      if (Array.isArray(json)) {
        for (const item of json) {
          const r = findRecipe(item);
          if (r) return r;
        }
      }
    } catch {
      // skip invalid JSON
    }
  }
  return null;
}

function extractOgMeta(html: string): { title: string | null; image: string | null } {
  let title: string | null = null;
  let image: string | null = null;
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  if (ogTitle) title = ogTitle[1].trim();
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (ogImage) image = ogImage[1].trim();
  return { title, image };
}

type OEmbedProvider = 'instagram' | 'tiktok' | 'youtube';

function getSocialMediaProvider(url: string): OEmbedProvider | null {
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  return null;
}

function buildOEmbedUrl(url: string, provider: OEmbedProvider): string {
  const encoded = encodeURIComponent(url);
  if (provider === 'instagram') {
    const appId = process.env.META_APP_ID ?? '';
    const clientToken = process.env.META_CLIENT_TOKEN ?? '';
    const accessToken = `${appId}|${clientToken}`;
    return `https://graph.facebook.com/v25.0/instagram_oembed?url=${encoded}&access_token=${accessToken}`;
  }
  if (provider === 'tiktok') {
    return `https://www.tiktok.com/oembed?url=${encoded}`;
  }
  return `https://www.youtube.com/oembed?url=${encoded}&format=json`;
}

async function fetchOEmbed(url: string, provider: OEmbedProvider): Promise<{
  title: string | null;
  imageUrl: string | null;
  ingredients: null;
  instructions: null;
}> {
  if (provider === 'instagram' && (!process.env.META_APP_ID || !process.env.META_CLIENT_TOKEN)) {
    throw new Error('Meta App ID of Client Token is niet geconfigureerd.');
  }
  const endpoint = buildOEmbedUrl(url, provider);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) {
      if (response.status === 404 || response.status === 401) {
        throw new Error('private');
      }
      throw new Error(`oEmbed responded with ${response.status}`);
    }
    const data = await response.json();
    console.log(`[oEmbed ${provider}] Raw response:`, JSON.stringify(data, null, 2));
    return {
      title: data.title ?? null,
      imageUrl: data.thumbnail_url ?? null,
      ingredients: null,
      instructions: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(
  req: { method?: string; body?: { url?: string } },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void; end: () => void };
    json: (body: object) => void;
  }
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const url = typeof req.body?.url === 'string' ? req.body.url.trim() : null;
  if (!url || !url.startsWith('http')) {
    res.status(400).json({ error: 'Ongeldige URL' });
    return;
  }

  // Social media URLs: use oEmbed instead of HTML scraping
  const provider = getSocialMediaProvider(url);
  if (provider) {
    try {
      const result = await fetchOEmbed(url, provider);
      res.status(200).json(result);
      return;
    } catch (err) {
      if (err instanceof Error && err.message === 'private') {
        res.status(403).json({
          error: 'Dit lijkt een privépost te zijn. Alleen publieke posts kunnen worden opgehaald.',
        });
        return;
      }
      console.error(`[oEmbed ${provider}] Failed:`, err);
      res.status(502).json({ error: 'Kon post niet ophalen via oEmbed' });
      return;
    }
  }

  // Regular websites: scrape HTML for JSON-LD / OG meta
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      res.status(502).json({ error: 'Kon pagina niet ophalen' });
      return;
    }
    const html = await response.text();
    const recipe = parseJsonLdScripts(html);
    if (recipe) {
      const ingredients = recipe.recipeIngredient?.join('\n') ?? '';
      const instructions = extractInstructions(recipe);
      res.status(200).json({
        title: recipe.name ?? null,
        imageUrl: extractImage(recipe),
        ingredients: ingredients || null,
        instructions: instructions || null,
      });
      return;
    }
    const og = extractOgMeta(html);
    res.status(200).json({
      title: og.title,
      imageUrl: og.image,
      ingredients: null,
      instructions: null,
    });
  } catch {
    res.status(502).json({ error: 'Kon recept niet extraheren' });
  }
}
