"use client";

import Link from "next/link";
import { useState } from "react";
import { hrefLista } from "@/lib/data/query";
import { n } from "@/lib/format";

interface No {
  slug: string;
  nome: string;
  foto: string | null;
}

/**
 * Co-authorship network: councillors on a circle (alphabetical order), one line per
 * pair, thickness = propositions signed together. Tap a face to isolate its links.
 */
export function Rede({ nos, pares, inicial = null }: { nos: No[]; pares: Array<{ a: string; b: string; n: number }>; inicial?: string | null }) {
  const [sel, setSel] = useState<string | null>(inicial);
  const W = 340;
  const R = 128;
  const c = W / 2;
  const pos = new Map(
    nos.map((v, i) => {
      const ang = (i / nos.length) * 2 * Math.PI - Math.PI / 2;
      return [v.slug, { x: c + R * Math.cos(ang), y: c + R * Math.sin(ang) }];
    }),
  );
  const max = Math.max(1, ...pares.map((p) => p.n));
  const doSel = sel ? pares.filter((p) => p.a === sel || p.b === sel).sort((x, y) => y.n - x.n) : [];
  const nome = (s: string) => nos.find((v) => v.slug === s)?.nome ?? s;
  const selNome = sel ? nome(sel) : null;

  return (
    <figure className="grafico rede">
      <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label="Rede de coautoria entre os vereadores">
        <defs>
          {nos.map((v) => (
            <clipPath key={v.slug} id={`clip-${v.slug}`}>
              <circle cx={pos.get(v.slug)?.x} cy={pos.get(v.slug)?.y} r={sel === v.slug ? 22 : 18} />
            </clipPath>
          ))}
        </defs>
        {pares.map((p) => {
          const a = pos.get(p.a);
          const b = pos.get(p.b);
          if (!a || !b) return null;
          const ativo = sel === null || p.a === sel || p.b === sel;
          return (
            <line
              key={`${p.a}-${p.b}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={sel && ativo ? "var(--green)" : "var(--rede-linha)"}
              strokeWidth={0.5 + Math.pow(p.n / max, 1.4) * 8}
              strokeLinecap="round"
              opacity={ativo ? (sel ? 0.95 : 0.12 + 0.75 * Math.pow(p.n / max, 1.2)) : 0.05}
            />
          );
        })}
        {nos.map((v) => {
          const p = pos.get(v.slug);
          if (!p) return null;
          const r = sel === v.slug ? 22 : 18;
          return (
            <g key={v.slug} className="rede-no" onClick={() => setSel(sel === v.slug ? null : v.slug)}>
              <circle cx={p.x} cy={p.y} r={r + 2.5} fill={sel === v.slug ? "var(--green)" : "var(--bg)"} />
              {v.foto ? (
                <image href={`/_next/image?url=${encodeURIComponent(v.foto)}&w=96&q=75`} x={p.x - r} y={p.y - r} width={r * 2} height={r * 2} clipPath={`url(#clip-${v.slug})`} preserveAspectRatio="xMidYMin slice" />
              ) : (
                <circle cx={p.x} cy={p.y} r={r} fill="var(--fill-2)" />
              )}
            </g>
          );
        })}
      </svg>
      <div className="rede-botoes" role="group" aria-label="Escolha um vereador">
        {nos.map((v) => (
          <button key={v.slug} type="button" className="chip" aria-pressed={sel === v.slug} onClick={() => setSel(sel === v.slug ? null : v.slug)}>
            {v.nome}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {sel && selNome ? (
          <>
            <p className="rede-titulo">
              Com quem <strong>{selNome}</strong> mais assina junto
            </p>
            <ul className="rede-lista">
              {doSel.slice(0, 5).map((p) => {
                const outro = p.a === sel ? p.b : p.a;
                return (
                  <li key={outro}>
                    <Link href={hrefLista("/proposicoes", { autor: sel, coautor: outro })}>
                      {nome(outro)} <span className="soft">{n(p.n)} proposições</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="soft small">Toque num rosto ou num nome para ver com quem a pessoa mais assina junto.</p>
        )}
      </div>
    </figure>
  );
}
