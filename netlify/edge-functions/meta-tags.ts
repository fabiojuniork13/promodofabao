import { createClient } from "@supabase/supabase-js";
import type { Context } from "@netlify/edge-functions";

const SUPABASE_URL = "https://wnbnymobuaogqqnjnoby.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYm55bW9idWFvZ3Fxbmpub2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNDA2ODksImV4cCI6MjA1MzkxNjY4OX0.zAijMlOQwO5T91ssml7ebNLpdfTsjxjX7xrv4zRNHZM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para verificar se é um navegador ou bot
const isBot = (userAgent: string): boolean => {
  const bots = /bot|crawl|spider|facebook|whatsapp|twitter|linkedin/i;
  return bots.test(userAgent);
};

export default async (request: Request, context: Context): Promise<Response> => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  const userAgent = request.headers.get("User-Agent") || "";
  console.log(request.headers.get("User-Agent"));
  const isCrawler = isBot(userAgent);

  let title = "Meu Site";
  let description = "Descrição padrão do site.";
  let image = "https://seusite.com/default.jpg";

  if (id) {
    const { data, error } = await supabase
      .from("tbgen_promocoes")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      title = data.nome || title;
      description = "As melhores promoções, cupons e descontos das maiores lojas do Brasil - São dezenas de Promoções postadas postadas diariamente!";
      image = data.image || image;
    }
  }

  // Se for um bot ou crawler, renderiza HTML SEO
  if (isCrawler) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${image}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${url.href}">
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description}</p>
        <img src="${image}" alt="Imagem de ${title}">
      </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });
  }

  // Para usuários normais, redireciona para o componente (ou página da aplicação)
  const redirectUrl = `https://promodofabin.netlify.app/card/${id}`; // Aqui você define o caminho para o seu componente na aplicação SPA
  return Response.redirect(redirectUrl, 302); // Realiza o redirecionamento
};
