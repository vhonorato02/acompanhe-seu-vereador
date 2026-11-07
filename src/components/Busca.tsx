"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Feed } from "./Item";
import { Icon } from "./Icon";
import { Rosto } from "./Rosto";
import { n } from "@/lib/format";
import type { Registro, Vereador } from "@/lib/data/types";

interface Resposta {
  q: string;
  total: number;
  itens: Registro[];
  vereadores: Vereador[];
  autores: Vereador[];
  normas: number;
}

/**
 * Search field with live results. Without JavaScript it is a plain GET form to /buscar.
 */
export function Busca({ inicial = "", vivo = true, rotulo = "Buscar proposições, vereadores ou bairros" }: {
  inicial?: string;
  vivo?: boolean;
  rotulo?: string;
}) {
  const [q, setQ] = useState(inicial);
  const [res, setRes] = useState<Resposta | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ctrl = useRef<AbortController | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  // On slow phones people start typing before the page hydrates; keep what they typed.
  useEffect(() => {
    const digitado = campo.current?.value ?? "";
    if (digitado && digitado !== inicial) setQ(digitado);
  }, [inicial]);

  useEffect(() => {
    if (!vivo) return;
    if (timer.current) clearTimeout(timer.current);
    const termo = q.trim();
    if (termo.length < 2) {
      setRes(null);
      return;
    }
    timer.current = setTimeout(async () => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setCarregando(true);
      try {
        const r = await fetch(`/api/busca?q=${encodeURIComponent(termo)}`, { signal: c.signal });
        if (!r.ok) throw new Error(String(r.status));
        setRes((await r.json()) as Resposta);
        setErro(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setErro(true);
      } finally {
        if (ctrl.current === c) setCarregando(false);
      }
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, vivo]);

  const termo = q.trim();
  return (
    <div className="busca">
      <form action="/buscar" method="get" role="search">
        <label htmlFor={id} className="sr-only">
          {rotulo}
        </label>
        <div className="busca-campo">
          <Icon nome="buscar" />
          <input
            ref={campo}
            id={id}
            name="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Bairro, assunto, número"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="submit">Buscar</button>
        </div>
      </form>

      {vivo && termo.length >= 2 && (
        <div className={`resultados-vivos${carregando ? " carregando" : ""}`} aria-live="polite">
          {erro && <p className="soft">A busca não respondeu. Toque em Buscar para tentar de novo.</p>}
          {res && res.q === termo && (
            <>
              {res.vereadores.length > 0 && (
                <ul className="trilho" style={{ marginBottom: "0.5rem" }}>
                  {res.vereadores.map((v) => (
                    <li key={v.slug}>
                      <Rosto v={v} />
                    </li>
                  ))}
                </ul>
              )}
              <div className="resumo">
                <p>
                  <strong>{n(res.total)}</strong> {res.total === 1 ? "proposição encontrada" : "proposições encontradas"}
                  {res.normas > 0 && (
                    <>
                      {" "}e <Link href={`/normas?q=${encodeURIComponent(termo)}`}>{n(res.normas)} {res.normas === 1 ? "lei" : "leis e normas"}</Link>
                    </>
                  )}
                </p>
                {res.total > res.itens.length && (
                  <Link href={`/buscar?q=${encodeURIComponent(termo)}`}>Ver todas</Link>
                )}
              </div>
              {res.itens.length > 0 ? (
                <Feed itens={res.itens} vereadores={res.autores} />
              ) : (
                <p className="soft">
                  Nada com “{termo}”. Tente uma palavra da ementa, o nome de um bairro ou o número com ano, como 2398/2026.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
