import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { NavTopo, TabBar } from "@/components/Navegacao";
import { RegistrarSW } from "@/components/RegistrarSW";
import { organizacaoLd, websiteLd } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/site";
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
              <img src="/marca/emblema.png" alt="" width={33} height={32} />
              <span>
                {SITE.nome}
                <small>{SITE.organizacaoCurta}</small>
              </span>
            </Link>
            <NavTopo />
          </div>
        </header>
        <main id="conteudo" className="page" tabIndex={-1}>
          {children}
        </main>
        <RegistrarSW />
        <JsonLd dados={[organizacaoLd(), websiteLd()]} />
        <footer className="rodape">
          <div className="page">
            <div className="instituicao">
              <a className="logo-osb" href={SITE.osb.site} aria-label={`${SITE.organizacao} (site do Observatório)`}>
                <img src="/marca/logo-osb.png" alt="" width={672} height={246} loading="lazy" />
              </a>
              <div>
                <p>
                  <strong>{SITE.nome}</strong> é um projeto do {SITE.organizacao}, associação civil apartidária que {SITE.missao}.
                  Não é o site oficial da Câmara Municipal; os documentos oficiais estão em{" "}
                  <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
                </p>
                <address>
                  {SITE.razaoSocial} · CNPJ {SITE.cnpj}
                  <br />
                  {SITE.endereco}
                  <br />
                  <a href={`mailto:${SITE.contatoEmail}`}>{SITE.contatoEmail}</a> ·{" "}
                  <a href={SITE.osb.instagram}>Instagram</a> · <a href={SITE.osb.facebook}>Facebook</a> ·{" "}
                  <a href={SITE.osb.youtube}>YouTube</a>
                </address>
              </div>
            </div>
            <ul>
              <li><Link href="/como-funciona">Como funciona</Link></li>
              <li><Link href="/metodologia">Metodologia</Link></li>
              <li><Link href="/dados">Dados abertos</Link></li>
              <li><Link href="/correcoes">Correções</Link></li>
              <li><Link href="/sobre">Sobre</Link></li>
              <li><Link href="/privacidade">Privacidade</Link></li>
              <li><Link href="/termos">Termos de uso</Link></li>
              <li><a href={SITE.osb.doacao}>Apoie o Observatório</a></li>
            </ul>
          </div>
        </footer>
        <TabBar />
      </body>
    </html>
  );
}
