import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { MenuAppDialog } from "@/components/MenuApp";
import { BarraTopo, TabBar } from "@/components/Navegacao";
import { RegistrarSW } from "@/components/RegistrarSW";
import { organizacaoLd, websiteLd } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.nome,
  authors: [{ name: SITE.organizacao, url: SITE.osb.site }],
  creator: SITE.organizacao,
  publisher: SITE.organizacao,
  category: "government",
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
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e0a" },
  ],
};

const FOUC_TEMA_SCRIPT = `try{var t=localStorage.getItem("asv-tema");if(t==="light"||t==="dark"){var m=document.querySelector('meta[name="color-scheme"]');if(m)m.setAttribute("content",t);var c=document.createElement("meta");c.name="theme-color";c.dataset.temaManual="1";c.content=t==="dark"?"#0b0e0a":"#f6f7f3";document.head.appendChild(c);}}catch(e){void e;}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <script dangerouslySetInnerHTML={{ __html: FOUC_TEMA_SCRIPT }} />
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <header className="topbar">
          <BarraTopo />
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
                <img src="/marca/logo-osb.png" alt="" width={672} height={246} />
              </a>
              <div>
                <p>
                  <strong>{SITE.nome}</strong> é uma iniciativa do {SITE.organizacao}, associação civil apartidária dedicada a {SITE.missao}.
                  Não substitui o site oficial da Câmara Municipal; os registros originais ficam em{" "}
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
        <MenuAppDialog />
      </body>
    </html>
  );
}
