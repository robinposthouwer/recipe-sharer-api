interface SchemaRecipe {
  '@type'?: string;
  name?: string;
  description?: string;
  image?: string | string[] | { url?: string }[];
  recipeIngredient?: string[];
  recipeInstructions?: Array<{ '@type'?: string; text?: string; name?: string } | string>;
  recipeYield?: string | number;
  cookTime?: string;
  prepTime?: string;
  totalTime?: string;
  recipeCategory?: string | string[];
  nutrition?: { '@type'?: string; calories?: string; [key: string]: unknown };
  author?: { '@type'?: string; name?: string } | string | Array<{ name?: string } | string>;
  aggregateRating?: { '@type'?: string; ratingValue?: number | string; ratingCount?: number | string };
  video?: { '@type'?: string; name?: string; contentUrl?: string; thumbnailUrl?: string | string[] };
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

function formatDuration(iso: string | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return null;
  const parts: string[] = [];
  if (match[1]) parts.push(`${match[1]} uur`);
  if (match[2]) parts.push(`${match[2]} min`);
  if (match[3]) parts.push(`${match[3]} sec`);
  return parts.join(' ') || null;
}

function extractAuthor(obj: SchemaRecipe): string | null {
  const a = obj.author;
  if (!a) return null;
  if (typeof a === 'string') return a;
  if (Array.isArray(a)) {
    return a.map((x) => (typeof x === 'string' ? x : x.name ?? '')).filter(Boolean).join(', ') || null;
  }
  return a.name ?? null;
}

function extractRating(obj: SchemaRecipe): string | null {
  const r = obj.aggregateRating;
  if (!r || !r.ratingValue) return null;
  const count = r.ratingCount ? ` (${r.ratingCount})` : '';
  return `${r.ratingValue}/5${count}`;
}

function extractVideoUrl(obj: SchemaRecipe): string | null {
  return obj.video?.contentUrl ?? null;
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

type OEmbedProvider = 'tiktok' | 'youtube';

async function resolveShortUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.url || url;
  } catch {
    return url;
  }
}

function getOEmbedProvider(url: string): OEmbedProvider | null {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  return null;
}

function isMetaUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('instagram.com') || u.includes('facebook.com') || u.includes('fb.watch');
}

function buildOEmbedUrl(url: string, provider: OEmbedProvider): string {
  const encoded = encodeURIComponent(url);
  if (provider === 'tiktok') {
    return `https://www.tiktok.com/oembed?url=${encoded}`;
  }
  return `https://www.youtube.com/oembed?url=${encoded}&format=json`;
}

function parseTikTokCaption(caption: string): {
  title: string | null;
  ingredients: string | null;
  instructions: string | null;
  calories: string | null;
  recipeYield: string | null;
} {
  // Strip hashtags from the end
  const clean = caption.replace(/#\w+/g, '').trim();

  // Try to find ingredient section
  const ingredientMatch = clean.match(/ingredi[eë]nten\s*:?\s*([\s\S]*?)(?=---|\binstruct|\bbereiding|\bstappen\b)/i);
  const ingredients = ingredientMatch
    ? ingredientMatch[1]
        .trim()
        // Split on emoji bullets (common TikTok pattern: emoji before each ingredient)
        .replace(/\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\u{FE0F}?\s*/gu, '\n')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .join('\n')
    : null;

  // Try to find instructions section
  const instructionMatch = clean.match(/(?:instructies|bereiding|stappen)\s*:?\s*([\s\S]*?)(?=---|\bvoedingswaarde\b|\bcalorie[eë]n\b|\btotaal\b|$)/i);
  const instructions = instructionMatch
    ? instructionMatch[1]
        .trim()
        // Split on numbered steps (1. 2. etc.)
        .replace(/\s*(\d+)\.\s*/g, '\n$1. ')
        .split('\n')
        .map((l) => l.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\u{FE0F}?\s*/gu, '').trim())
        .filter(Boolean)
        .join('\n')
    : null;

  // Try to find calories
  const caloriesMatch = clean.match(/(\d+[.,]?\d*)\s*kcal/i);
  const calories = caloriesMatch ? `${caloriesMatch[1]} kcal` : null;

  // Try to find yield/portions
  const yieldMatch = clean.match(/(\d+)\s*(?:stukken|porties|personen|servings)/i);
  const recipeYield = yieldMatch ? `${yieldMatch[1]} porties` : null;

  // Title = first sentence before any section marker
  const titleMatch = clean.match(/^([\s\S]*?)(?=ingredi[eë]nten|---)/i);
  const title = titleMatch
    ? titleMatch[1].replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim().replace(/\s+/g, ' ')
    : null;

  return { title: title || null, ingredients, instructions, calories, recipeYield };
}

async function fetchOEmbed(url: string, provider: OEmbedProvider): Promise<{
  title: string | null;
  imageUrl: string | null;
  ingredients: string | null;
  instructions: string | null;
  calories: string | null;
  recipeYield: string | null;
  author: string | null;
  description: string | null;
}> {
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

    // For TikTok: parse the caption for recipe data
    if (provider === 'tiktok' && data.title) {
      const parsed = parseTikTokCaption(data.title);
      return {
        title: parsed.title || data.title,
        imageUrl: data.thumbnail_url ?? null,
        ingredients: parsed.ingredients,
        instructions: parsed.instructions,
        calories: parsed.calories,
        recipeYield: parsed.recipeYield,
        author: data.author_name ?? null,
        description: null,
      };
    }

    return {
      title: data.title ?? null,
      imageUrl: data.thumbnail_url ?? null,
      ingredients: null,
      instructions: null,
      calories: null,
      recipeYield: null,
      author: data.author_name ?? null,
      description: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// Instagram & Facebook: scrape OG meta tags (tijdelijk, tot Meta App Review is goedgekeurd)
async function fetchMetaMeta(url: string): Promise<{
  title: string | null;
  imageUrl: string | null;
  ingredients: null;
  instructions: null;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Instagram responded with ${response.status}`);
    }
    const html = await response.text();
    const og = extractOgMeta(html);
    // Also try to extract description (caption) from og:description
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
    const description = ogDesc ? ogDesc[1].trim() : null;
    console.log('[Meta scrape] OG data:', JSON.stringify({ title: og.title, image: og.image, description }, null, 2));
    return {
      title: description || og.title,
      imageUrl: og.image,
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

  // Instagram & Facebook: scrape OG meta tags (tijdelijk tot oEmbed API beschikbaar is)
  if (isMetaUrl(url)) {
    try {
      const result = await fetchMetaMeta(url);
      res.status(200).json(result);
      return;
    } catch (err) {
      console.error('[Meta scrape] Failed:', err);
      res.status(502).json({ error: 'Kon post niet ophalen' });
      return;
    }
  }

  // TikTok & YouTube: use oEmbed
  let resolvedUrl = url;
  const provider = getOEmbedProvider(url);
  if (provider) {
    try {
      // Resolve short URLs (e.g. vm.tiktok.com → www.tiktok.com)
      if (url.includes('vm.tiktok.com') || url.includes('youtu.be')) {
        resolvedUrl = await resolveShortUrl(url);
      }
      // TikTok oEmbed doesn't support /photo/ paths, change to /video/
      if (provider === 'tiktok') {
        resolvedUrl = resolvedUrl.replace('/photo/', '/video/');
      }
      const result = await fetchOEmbed(resolvedUrl, provider);
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
      res.status(502).json({ error: 'Kon post niet ophalen' });
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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
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
      const category = Array.isArray(recipe.recipeCategory)
        ? recipe.recipeCategory.join(', ')
        : recipe.recipeCategory ?? null;
      res.status(200).json({
        title: recipe.name ?? null,
        imageUrl: extractImage(recipe),
        ingredients: ingredients || null,
        instructions: instructions || null,
        description: recipe.description ?? null,
        recipeYield: recipe.recipeYield ? String(recipe.recipeYield) : null,
        cookTime: formatDuration(recipe.cookTime),
        totalTime: formatDuration(recipe.totalTime),
        recipeCategory: category || null,
        calories: recipe.nutrition?.calories ?? null,
        author: extractAuthor(recipe),
        rating: extractRating(recipe),
        videoUrl: extractVideoUrl(recipe),
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
