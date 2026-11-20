"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { BotaoMenu } from "./MenuApp";
import { SITE } from "@/lib/site";

const ABAS = [
  { href: "/", rotulo: "Início", icone: "inicio", ativo: (p: string) => p === "/" },
  { href: "/vereadores", rotulo: "Vereadores", icone: "pessoas", ativo: (p: string) => p.startsWith("/vereadores") || p.startsWith("/comparar") },
  { href: "/bairros", rotulo: "Bairros", icone: "mapa", ativo: (p: string) => p.startsWith("/bairros") },
  { href: "/buscar", rotulo: "Buscar", icone: "buscar", ativo: (p: string) => p.startsWith("/buscar") || p.startsWith("/proposicoes") || p.startsWith("/normas") },
];

function contextoRota(pathname: string): { titulo: string; fallback: string } {
  if (pathname.startsWith("/vereadores/")) return { titulo: "Perfil parlamentar", fallback: "/vereadores" };
  if (pathname.startsWith("/vereadores")) return { titulo: "Vereadores", fallback: "/" };
  if (pathname.startsWith("/comparar")) return { titulo: "Comparar", fallback: "/vereadores" };
  if (pathname.startsWith("/bairros/")) return { titulo: "Bairro", fallback: "/bairros" };
  if (pathname.startsWith("/bairros")) return { titulo: "Bairros", fallback: "/" };
  if (pathname.startsWith("/proposicoes")) return { titulo: "Proposições", fallback: "/" };
  if (pathname.startsWith("/normas")) return { titulo: "Leis e normas", fallback: "/" };
  if (pathname.startsWith("/como-funciona")) return { titulo: "Como funciona", fallback: "/" };
  if (pathname.startsWith("/metodologia")) return { titulo: "Metodologia", fallback: "/" };
  if (pathname.startsWith("/dados")) return { titulo: "Dados abertos", fallback: "/" };
  if (pathname.startsWith("/correcoes")) return { titulo: "Correções", fallback: "/" };
  if (pathname.startsWith("/sobre")) return { titulo: "Sobre", fallback: "/" };
  if (pathname.startsWith("/privacidade")) return { titulo: "Privacidade", fallback: "/" };
  if (pathname.startsWith("/termos")) return { titulo: "Termos de uso", fallback: "/" };
  return { titulo: SITE.nome, fallback: "/" };
}

export function BarraTopo() {
  const p = usePathname();
  const router = useRouter();
  const subpagina = p !== "/";
  const ctx = contextoRota(p);

  function voltar() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(ctx.fallback);
    }
  }

  return (
    <div className="page">
      <div className={`topbar-app${subpagina ? " is-subpage" : ""}`}>
        {subpagina && (
          <>
            <button type="button" className="topbar-voltar" onClick={voltar} aria-label="Voltar">
              <Icon nome="voltar" tamanho={20} />
            </button>
            <span className="topbar-titulo">{ctx.titulo}</span>
          </>
        )}
        <Link href="/" className="marca">
          <img src="/marca/emblema.png" alt="" width={33} height={32} />
          <span>
            {SITE.nome}
            <small>{SITE.organizacaoCurta}</small>
          </span>
        </Link>
      </div>
      <div className="topbar-dir">
        <NavTopo />
        <BotaoMenu variante="topo" />
      </div>
    </div>
  );
}

export function NavTopo() {
  const p = usePathname();
  return (
    <nav className="topnav" aria-label="Principal">
      {ABAS.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          aria-current={
            a.ativo(p) && !(a.href === "/vereadores" && p.startsWith("/comparar")) && !(a.href === "/buscar" && p.startsWith("/normas"))
              ? "page"
              : undefined
          }
        >
          {a.rotulo}
        </Link>
      ))}
      <Link href="/comparar" aria-current={p.startsWith("/comparar") ? "page" : undefined}>
        Comparar
      </Link>
      <Link href="/normas" aria-current={p.startsWith("/normas") ? "page" : undefined}>
        Leis
      </Link>
    </nav>
  );
}

export function TabBar() {
  const p = usePathname();
  return (
    <nav className="tabbar" aria-label="Atalhos">
      <ul>
        {ABAS.map((a) => (
          <li key={a.href}>
            <Link href={a.href} aria-current={a.ativo(p) ? "page" : undefined}>
              <span className="tab-ico">
                <Icon nome={a.icone} />
              </span>
              {a.rotulo}
            </Link>
          </li>
        ))}
        <li>
          <BotaoMenu variante="aba" />
        </li>
      </ul>
    </nav>
  );
}
