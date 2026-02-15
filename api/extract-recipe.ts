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
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReceptenApp/1.0)',
      },
    });
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
