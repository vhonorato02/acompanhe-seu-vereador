"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const ABAS = [
  { href: "/", rotulo: "Início", icone: "inicio", ativo: (p: string) => p === "/" },
  { href: "/vereadores", rotulo: "Vereadores", icone: "pessoas", ativo: (p: string) => p.startsWith("/vereadores") || p.startsWith("/comparar") },
  { href: "/bairros", rotulo: "Bairros", icone: "mapa", ativo: (p: string) => p.startsWith("/bairros") },
  { href: "/buscar", rotulo: "Buscar", icone: "buscar", ativo: (p: string) => p.startsWith("/buscar") || p.startsWith("/proposicoes") || p.startsWith("/normas") },
];

export function NavTopo() {
  const p = usePathname();
  return (
    <nav className="topnav" aria-label="Principal">
      {ABAS.map((a) => (
        <Link key={a.href} href={a.href} aria-current={a.ativo(p) && !(a.href === "/vereadores" && p.startsWith("/comparar")) && !(a.href === "/buscar" && p.startsWith("/normas")) ? "page" : undefined}>
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
      </ul>
    </nav>
  );
}
