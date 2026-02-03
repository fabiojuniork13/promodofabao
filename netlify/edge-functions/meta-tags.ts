import { createClient } from "@supabase/supabase-js";
import type { Context } from "@netlify/edge-functions";

const SUPABASE_URL = "https://vlgdnozjeqtqxvzjyttp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsZ2Rub3pqZXF0cXh2emp5dHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDM0MzAsImV4cCI6MjA4MzgxOTQzMH0.ujMSvxSgWmbaa6bakYKullbnDOWrmy2jj4wlqNbv7ao";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// const isBot = (userAgent: string): boolean => {
//   const bots = /bot|crawl|spider|facebook|whatsapp|twitter|linkedin/i;
//   return bots.test(userAgent);
// };

const isBot = (ua: string): boolean => {
  return /bot|crawl|spider|facebook|whatsapp|instagram|meta|twitter|linkedin|slack|discord|telegram/i.test(
    ua
  );
};


export default async (request: Request, context: Context): Promise<Response> => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  const userAgent = request.headers.get("User-Agent") || "";
  const isCrawler = isBot(userAgent);

  let title = "Meu Site";
  let description = "Descrição padrão do site.";
  let image = "https://seusite.com/default.jpg";

  if (id) {
    const { data } = await supabase.from("tbgen_promocoes").select("*").eq("id", id).single();
    if (data) {
      title = data.subtitle || title;
      description = "As melhores promoções, cupons e descontos das maiores lojas do Brasil!";
      image = data.image || image;
    }
  }

  if (isCrawler) {
    return new Response(
      `<!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${image}">
        <meta property="og:image:width" content="752">
        <meta property="og:image:height" content="750">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${url.href}">
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description}</p>
        <img src="${image}" alt="Imagem de ${title}">
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // 🚀 Redireciona usuários para o componente real
  return Response.redirect(`https://promodofabin.netlify.app/card/${id}`, 301);
};
