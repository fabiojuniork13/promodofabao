// import { createClient } from "@supabase/supabase-js";
// import type { Context } from "@netlify/edge-functions";

// const SUPABASE_URL = "https://vlgdnozjeqtqxvzjyttp.supabase.co";
// const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsZ2Rub3pqZXF0cXh2emp5dHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDM0MzAsImV4cCI6MjA4MzgxOTQzMH0.ujMSvxSgWmbaa6bakYKullbnDOWrmy2jj4wlqNbv7ao";
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// const isBot = (userAgent: string): boolean => {
//   const bots = /bot|crawl|spider|facebook|whatsapp|twitter|linkedin/i;
//   return bots.test(userAgent);
// };

// export default async (request: Request, context: Context): Promise<Response> => {
//   const url = new URL(request.url);
//   const pathSegments = url.pathname.split("/");
//   const id = pathSegments[pathSegments.length - 1];

//   const userAgent = request.headers.get("User-Agent") || "";
//   const isCrawler = isBot(userAgent);

//   let title = "Meu Site";
//   let description = "Descrição padrão do site.";
//   let image = "https://seusite.com/default.jpg";

//   if (id) {
//     const { data } = await supabase.from("tbgen_promocoes").select("*").eq("id", id).single();
//     if (data) {
//       title = data.subtitle || title;
//       description = "As melhores promoções, cupons e descontos das maiores lojas do Brasil!";
//       image = data.image || image;
//     }
//   }

//   if (isCrawler) {
//     return new Response(
//       `<!DOCTYPE html>
//       <html lang="pt">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>${title}</title>
//         <meta property="og:title" content="${title}">
//         <meta property="og:description" content="${description}">
//         <meta property="og:image" content="${image}">
//         <meta property="og:image:width" content="752">
//         <meta property="og:image:height" content="750">
//         <meta property="og:type" content="website">
//         <meta property="og:image:type" content="image/jpeg">
//         <meta property="og:url" content="${url.href}">
//       </head>
//       <body>
//         <h1>${title}</h1>
//         <p>${description}</p>
//         <img src="${image}" alt="Imagem de ${title}">
//       </body>
//       </html>`,
//       { headers: { "Content-Type": "text/html" } }
//     );
//   }

//   // 🚀 Redireciona usuários para o componente real
//   return Response.redirect(`https://promodofabin.netlify.app/card/${id}`, 302);
// };
import { createClient } from "@supabase/supabase-js";
import type { Context } from "@netlify/edge-functions";

const SUPABASE_URL ="https://vlgdnozjeqtqxvzjyttp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsZ2Rub3pqZXF0cXh2emp5dHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDM0MzAsImV4cCI6MjA4MzgxOTQzMH0.ujMSvxSgWmbaa6bakYKullbnDOWrmy2jj4wlqNbv7ao";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Lista mais abrangente de bots
const isBot = (userAgent: string): boolean => {
  const bots = /bot|crawl|spider|facebook|whatsapp|twitter|linkedin|slack|telegram|discord|pinterest|embed|meta-externalagent|facebookexternalhit|facebot/i;
  return bots.test(userAgent);
};

// Cache simples em memória (para Edge Functions)
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

export default async (request: Request, context: Context): Promise<Response> => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const id = pathSegments[pathSegments.length - 1];
  
  const userAgent = request.headers.get("User-Agent") || "";
  const isCrawler = isBot(userAgent);

  // SEMPRE retornar HTML para bots, SEM redirecionamento
  if (isCrawler) {
    let title = "Meu Site";
    let description = "As melhores promoções, cupons e descontos das maiores lojas do Brasil!";
    let image = "https://seusite.com/default.jpg";

    // Verificar cache primeiro
    const cacheKey = `promo_${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      title = cached.data.subtitle || title;
      image = cached.data.image || image;
    } else if (id && !isNaN(Number(id))) {
      try {
        // Timeout para não travar o crawler
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const { data, error } = await supabase
          .from("tbgen_promocoes")
          .select("subtitle, image")
          .eq("id", id)
          .maybeSingle();
        
        clearTimeout(timeoutId);
        
        if (data) {
          title = data.subtitle || title;
          image = data.image || image;
          
          // Salvar no cache
          cache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        // Continuar com valores padrão
      }
    }

    // Garantir que a URL da imagem seja absoluta
    if (image && !image.startsWith('http')) {
      image = `https://promodofabin.netlify.app${image}`;
    }

    // Retornar HTML completo com headers anti-cache
    return new Response(
      `<!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- Meta tags básicas -->
        <title>${escapeHtml(title)}</title>
        <meta name="description" content="${escapeHtml(description)}">
        
        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${url.href}">
        <meta property="og:title" content="${escapeHtml(title)}">
        <meta property="og:description" content="${escapeHtml(description)}">
        <meta property="og:image" content="${escapeHtml(image)}">
        <meta property="og:image:width" content="752">
        <meta property="og:image:height" content="750">
        <meta property="og:image:type" content="image/jpeg">
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${escapeHtml(title)}">
        <meta name="twitter:description" content="${escapeHtml(description)}">
        <meta name="twitter:image" content="${escapeHtml(image)}">
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}">
      </body>
      </html>`,
      { 
        headers: { 
          "Content-Type": "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        } 
      }
    );
  }

  // Apenas usuários reais são redirecionados
  return Response.redirect(`https://promodofabin.netlify.app/card/${id}`, 301);
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}