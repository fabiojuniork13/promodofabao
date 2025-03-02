import { Context } from '@netlify/edge-functions'

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)

  // Checa se é um bot (Googlebot, Facebook, Twitter, etc.)
  const userAgent = request.headers.get("user-agent") || "";
  const isBot = /bot|crawl|spider|facebook|whatsapp|twitter|linkedin/i.test(userAgent);

  if (isBot) {
    // ID do produto (exemplo: /produto/123)
    const match = url.pathname.match(/\/produto\/(\d+)/);
    if (match) {
      const productId = match[1];

      // Busca o produto no Supabase
      const { data, error } = await fetchProductFromSupabase(productId);

      if (!error && data) {
        // Retorna HTML renderizado com SEO
        return new Response(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.titulo}</title>
            <meta name="description" content="${data.descricao}">
            <meta property="og:title" content="${data.titulo}">
            <meta property="og:description" content="${data.descricao}">
            <meta property="og:image" content="${data.imagem}">
            <meta property="og:url" content="${url.href}">
          </head>
          <body>
            <h1>${data.titulo}</h1>
            <p>${data.descricao}</p>
          </body>
          </html>
        `, { headers: { "Content-Type": "text/html" } });
      }
    }
  }

  // Se não for um bot, deixa o Angular lidar com a navegação
  return context.next();
};

// Função para buscar o produto no Supabase
async function fetchProductFromSupabase(id: string) {
  const SUPABASE_URL = "https://wnbnymobuaogqqnjnoby.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYm55bW9idWFvZ3Fxbmpub2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNDA2ODksImV4cCI6MjA1MzkxNjY4OX0.zAijMlOQwO5T91ssml7ebNLpdfTsjxjX7xrv4zRNHZM"; // ⚠️ Use uma ENV VAR no Netlify para segurança

  const response = await fetch(`${SUPABASE_URL}/rest/v1/tbgen_promocoes?id=eq.${id}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    }
  });

  if (!response.ok) return { data: null, error: true };
  const data = await response.json();
  return { data: data[0], error: false };
}
