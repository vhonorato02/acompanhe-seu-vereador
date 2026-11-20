// Small hand-drawn icon set (24px grid, 1.8 stroke). Decorative: always aria-hidden.

const PATHS: Record<string, React.ReactNode> = {
  inicio: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  pessoas: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M16 5.2a3.3 3.3 0 0 1 0 6.6M18.5 14.8c1.7.7 2.8 2.4 3.1 5.2" />
    </>
  ),
  buscar: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8" />
    </>
  ),
  menu: (
    <>
      <circle cx="5.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  voltar: <path d="M15 5 8 12l7 7" />,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  seta: <path d="m9 6 6 6-6 6" />,
  compartilhar: (
    <>
      <circle cx="18" cy="5.5" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="18.5" r="2.2" />
      <path d="m8 11 8-4.4M8 13l8 4.4" />
    </>
  ),
  instalar: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M12 8v6m0 0-2.5-2.5M12 14l2.5-2.5" />
    </>
  ),
  comparar: (
    <>
      <rect x="3.5" y="4.5" width="7" height="15" rx="1.5" />
      <rect x="13.5" y="4.5" width="7" height="15" rx="1.5" />
    </>
  ),
  lei: (
    <>
      <path d="M12 3v18M7 21h10M5 7h14" />
      <path d="M5 7 2.5 13a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  pedido: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  sugestao: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" />
    </>
  ),
  mocao: (
    <>
      <path d="M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4C19 15.6 12 20 12 20z" />
    </>
  ),
  emenda: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  veto: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6 6 12 12" />
    </>
  ),
  externo: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  filtro: <path d="M4 5h16l-6 7.5V19l-4 1.5v-8z" />,
  mapa: (
    <>
      <path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.6v.4" />
    </>
  ),
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  lua: <path d="M20 14.5A8 8 0 0 1 9.5 4a8.2 8.2 0 1 0 10.5 10.5z" />,
  sistema: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M8.5 20h7M12 16.5V20" />
    </>
  ),
};

export function Icon({ nome, tamanho = 22 }: { nome: keyof typeof PATHS | string; tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[nome] ?? PATHS.doc}
    </svg>
  );
}
