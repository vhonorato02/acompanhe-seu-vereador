import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { NavTopo, TabBar } from "@/components/Navegacao";
import { RegistrarSW } from "@/components/RegistrarSW";
import { SITE, URL_REPORTAR_ERRO } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.nome,
  title: {
    default: `${SITE.nome} · Vereadores de ${SITE.cidade}`,
    template: `%s · ${SITE.nome}`,
  },
  description: `${SITE.lema} Um projeto do ${SITE.organizacao}; não é o site oficial da Câmara.`,
  openGraph: { locale: "pt_BR", type: "website", siteName: SITE.nome },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "Vereadores", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <header className="topbar">
          <div className="page">
            <Link href="/" className="marca">
              {SITE.nome}
              <small>{SITE.cidade} · Observatório Social do Brasil</small>
            </Link>
            <NavTopo />
          </div>
        </header>
        <main id="conteudo" className="page" tabIndex={-1}>
          {children}
        </main>
        <RegistrarSW />
        <footer className="rodape">
          <div className="page">
            <p>
              <strong>{SITE.nome}</strong> é mantido pelo {SITE.organizacao}. Não é o site oficial da Câmara Municipal; os
              documentos oficiais estão em <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
            </p>
            <ul>
              <li><Link href="/como-funciona">Como funciona</Link></li>
              <li><Link href="/metodologia">Metodologia</Link></li>
              <li><Link href="/dados">Dados abertos</Link></li>
              <li><Link href="/correcoes">Correções</Link></li>
              <li><Link href="/sobre">Sobre e privacidade</Link></li>
              <li><a href={URL_REPORTAR_ERRO}>Reportar erro</a></li>
            </ul>
          </div>
        </footer>
        <TabBar />
      </body>
    </html>
  );
}
