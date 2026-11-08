import { serializarLd } from "@/lib/seo/jsonld";

export function JsonLd({ dados }: { dados: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarLd(dados) }} />;
}
