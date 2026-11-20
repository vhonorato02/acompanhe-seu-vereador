/** App-style loading skeleton displayed during client route transitions. */
export default function Loading() {
  return (
    <div className="esqueleto-grade" aria-busy="true" aria-label="Carregando conteúdo">
      <div className="esqueleto-bloco alto" />
      <div className="esqueleto-bloco" />
      <div className="esqueleto-bloco" />
    </div>
  );
}
