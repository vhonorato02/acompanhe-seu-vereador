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
  description: "Os vereadores em exercício na Câmara Municipal de Pindamonhangaba, legislatura 2025–2028, com o que cada um apresentou.",
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
          Legislatura 2025–2028, em ordem alfabética. A faixa mostra as proposições de cada pessoa mês a mês, na escala dela.{" "}
          <Link href="/comparar">Comparar lado a lado</Link>
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
                    {v.funcao !== "Vereador" ? `, ${v.funcao}` : ""}. {n(deles.length)} proposições
                    {tema ? `, mais sobre ${tema.nome.toLowerCase()}` : ""}
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
