import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fonte } from "@/components/Fonte";
import { Faisca } from "@/components/graficos/Graficos";
import { porMes, porTema } from "@/lib/data/analise";
import { panorama } from "@/lib/data/painel";
import { filtrar } from "@/lib/data/query";
import { n } from "@/lib/format";

export const metadata: Metadata = {
  title: "Vereadores",
  description: "Os vereadores em exercício na Câmara Municipal de Pindamonhangaba na legislatura 2025–2028 e suas proposições apresentadas.",
  alternates: { canonical: "/vereadores" },
};

export default function Vereadores() {
  const p = panorama();
  const { d } = p;
  return (
    <>
      <div className="prosa">
        <h1>Vereadores em exercício</h1>
        <p className="soft">
          Legislatura 2025–2028, listagem alfabética e sem ranking. As colunas ao lado de cada nome mostram a frequência mensal de
          publicações do mandato na própria escala. <Link href="/comparar">Comparar vereadores</Link>.
        </p>
      </div>
      <ul className="cartoes-vereador section">
        {d.vereadores.map((v) => {
          const deles = filtrar(d.proposicoes, { autor: v.slug });
          const tema = porTema(filtrar(deles, { grupo: "pedidos" }), { autor: v.slug, grupo: "pedidos" })[0];
          return (
            <li key={v.slug}>
              <Link href={`/vereadores/${v.slug}`} className="cartao-v">
                <span className="foto">{v.foto && <Image src={v.foto} alt="" width={136} height={136} />}</span>
                <span>
                  <span className="nome">{v.nome}</span>
                  <span className="meta">
                    {" "}
                    {v.partido}
                    {v.funcao && v.funcao !== "Vereador" ? `, ${v.funcao.toLowerCase()}` : ""}. {n(deles.length)}{" "}
                    {deles.length === 1 ? "proposição" : "proposições"}
                    {tema ? `, com foco em ${tema.nome.toLowerCase()}` : ""}
                  </span>
                  <Faisca valores={porMes(deles, p.listaMeses).map((m) => m.total)} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Fonte d={d} />
    </>
  );
}
