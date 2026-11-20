"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { SITE } from "@/lib/site";
import { CHAVE_TEMA, definirTema, lerTema, sincronizarMetaTema, sistemaEscuro, type TemaModo } from "@/lib/tema";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const EXPLORAR = [
  { href: "/comparar", rotulo: "Comparar vereadores", icone: "comparar" },
  { href: "/normas", rotulo: "Leis e normas", icone: "lei" },
  { href: "/proposicoes", rotulo: "Todas as proposições", icone: "doc" },
] as const;

const INSTITUCIONAL = [
  { href: "/como-funciona", rotulo: "Como funciona a Câmara", icone: "info" },
  { href: "/metodologia", rotulo: "Metodologia e limites", icone: "doc" },
  { href: "/dados", rotulo: "Dados abertos (CSV e JSON)", icone: "instalar" },
  { href: "/correcoes", rotulo: "Comunicar erro ou revisão", icone: "pedido" },
  { href: "/sobre", rotulo: "Sobre o Observatório", icone: "pessoas" },
  { href: "/privacidade", rotulo: "Política de privacidade", icone: "lei" },
  { href: "/termos", rotulo: "Termos de uso", icone: "doc" },
] as const;

const OPCOES_TEMA: ReadonlyArray<{ valor: TemaModo; rotulo: string; icone: "sistema" | "sol" | "lua" }> = [
  { valor: "system", rotulo: "Automático", icone: "sistema" },
  { valor: "light", rotulo: "Claro", icone: "sol" },
  { valor: "dark", rotulo: "Escuro", icone: "lua" },
];

let abertoGlobal = false;
let abrirHandler: (() => void) | null = null;
const ouvintesAbertura = new Set<() => void>();

function definirAberto(valor: boolean) {
  if (abertoGlobal === valor) return;
  abertoGlobal = valor;
  for (const cb of ouvintesAbertura) cb();
}

function assinarAbertura(cb: () => void) {
  ouvintesAbertura.add(cb);
  return () => {
    ouvintesAbertura.delete(cb);
  };
}

const obterAberto = () => abertoGlobal;
const obterAbertoServidor = () => false;

/** Trigger button for the shared App Menu sheet on mobile bottom bar ("Mais") or desktop header ("Menu"). */
export function BotaoMenu({ variante }: { variante: "topo" | "aba" }) {
  const aberto = useSyncExternalStore(assinarAbertura, obterAberto, obterAbertoServidor);

  if (variante === "aba") {
    return (
      <button type="button" className="tabbar-btn" aria-haspopup="dialog" aria-expanded={aberto} onClick={() => abrirHandler?.()}>
        <span className="tab-ico">
          <Icon nome="menu" />
        </span>
        Mais
      </button>
    );
  }

  return (
    <button type="button" className="topbar-menu" aria-haspopup="dialog" aria-expanded={aberto} onClick={() => abrirHandler?.()}>
      <Icon nome="menu" tamanho={18} />
      <span>Menu</span>
    </button>
  );
}

/** Shared native modal sheet (<dialog>) hosting appearance settings, full site index, install & share controls. */
export function MenuAppDialog() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const tituloId = useId();

  const [tema, setTema] = useState<TemaModo>("system");
  const [escuridaoSistema, setEscuridaoSistema] = useState(false);
  const [podeInstalar, setPodeInstalar] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const [ajudaInstalar, setAjudaInstalar] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const fechar = useCallback(() => {
    const dlg = dialogRef.current;
    if (dlg?.open) dlg.close();
  }, []);

  const abrir = useCallback(() => {
    const dlg = dialogRef.current;
    if (!dlg || dlg.open) return;
    setAviso(null);
    dlg.showModal();
    definirAberto(true);
  }, []);

  useEffect(() => {
    fechar();
  }, [pathname, fechar]);

  useEffect(() => {
    abrirHandler = abrir;
    const dlg = dialogRef.current;
    if (!dlg) return;

    dlg.setAttribute("closedby", "any");

    const inicial = lerTema();
    sincronizarMetaTema(inicial);
    setTema(inicial);
    setEscuridaoSistema(sistemaEscuro());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const aoMudarSistema = (e: MediaQueryListEvent) => {
      setEscuridaoSistema(e.matches);
    };
    mq.addEventListener("change", aoMudarSistema);

    const aoAlterarStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== CHAVE_TEMA) return;
      const proximo = lerTema();
      sincronizarMetaTema(proximo);
      setTema(proximo);
    };
    window.addEventListener("storage", aoAlterarStorage);

    const aoFechar = () => {
      dlg.returnValue = "";
      definirAberto(false);
      setAjudaInstalar(false);
    };
    dlg.addEventListener("close", aoFechar);

    let removerLightDismiss: (() => void) | undefined;
    if (!("closedBy" in HTMLDialogElement.prototype)) {
      const fora = (e: PointerEvent) => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressionouFora = false;
      const aoPressionar = (e: PointerEvent) => {
        pressionouFora = fora(e);
      };
      const aoSoltar = (e: PointerEvent) => {
        if (pressionouFora && fora(e) && dlg.open) dlg.close();
      };
      dlg.addEventListener("pointerdown", aoPressionar);
      dlg.addEventListener("pointerup", aoSoltar);
      removerLightDismiss = () => {
        dlg.removeEventListener("pointerdown", aoPressionar);
        dlg.removeEventListener("pointerup", aoSoltar);
      };
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalado(true);
    }

    const aoDisponibilizar = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
      setPodeInstalar(true);
    };
    const aoInstalar = () => {
      promptRef.current = null;
      setPodeInstalar(false);
      setInstalado(true);
      setAviso("Aplicativo instalado na tela inicial.");
    };

    window.addEventListener("beforeinstallprompt", aoDisponibilizar);
    window.addEventListener("appinstalled", aoInstalar);

    return () => {
      if (abrirHandler === abrir) abrirHandler = null;
      mq.removeEventListener("change", aoMudarSistema);
      window.removeEventListener("storage", aoAlterarStorage);
      dlg.removeEventListener("close", aoFechar);
      removerLightDismiss?.();
      window.removeEventListener("beforeinstallprompt", aoDisponibilizar);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, [abrir]);

  function escolherTema(modo: TemaModo) {
    definirTema(modo);
    setTema(modo);
  }

  async function instalar() {
    const evento = promptRef.current;
    if (evento) {
      await evento.prompt();
      const escolha = await evento.userChoice;
      if (escolha.outcome === "accepted") {
        promptRef.current = null;
        setPodeInstalar(false);
        setAviso("Instalação iniciada pelo navegador.");
      }
      return;
    }
    setAjudaInstalar((v) => !v);
  }

  async function compartilhar() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title || SITE.nome, text: SITE.lema, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setAviso("Endereço copiado para a área de transferência.");
        return;
      } catch (err) {
        void err;
        setAviso("Copie o endereço diretamente da barra do navegador.");
        return;
      }
    }
    setAviso("Copie o endereço diretamente da barra do navegador.");
  }

  const descricaoTema =
    tema === "system"
      ? `Seguindo o aparelho (atualmente ${escuridaoSistema ? "escuro" : "claro"}).`
      : tema === "light"
        ? "Tema claro mantido neste navegador."
        : "Tema escuro mantido neste navegador.";

  return (
    <dialog ref={dialogRef} className="sheet" aria-labelledby={tituloId}>
      <div className="sheet-alca" aria-hidden="true" />
      <div className="sheet-topo">
        <div className="sheet-marca">
          <img src="/marca/emblema.png" alt="" width={28} height={27} />
          <div>
            <h2 id={tituloId}>{SITE.nome}</h2>
            <p className="sheet-subtitulo">{`${SITE.cidade} · ${SITE.organizacaoCurta}`}</p>
          </div>
        </div>
        <button type="button" className="sheet-fechar" onClick={fechar} aria-label="Fechar menu" autoFocus>
          <Icon nome="fechar" tamanho={20} />
        </button>
      </div>

      <section className="sheet-grupo" aria-label="Aparência">
        <h3>Aparência</h3>
        <div className="tema-grade" role="group" aria-label="Tema visual">
          {OPCOES_TEMA.map((op) => (
            <button
              key={op.valor}
              type="button"
              className="tema-opcao"
              aria-pressed={tema === op.valor}
              onClick={() => escolherTema(op.valor)}
            >
              <Icon nome={op.icone} tamanho={19} />
              <span>{op.rotulo}</span>
            </button>
          ))}
        </div>
        <p className="tema-legenda">{descricaoTema}</p>
      </section>

      <section className="sheet-grupo" aria-label="Explorar">
        <h3>Explorar</h3>
        <ul className="sheet-lista">
          {EXPLORAR.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={fechar}>
                <span className="sheet-item-esq">
                  <Icon nome={item.icone} tamanho={19} />
                  <span>{item.rotulo}</span>
                </span>
                <Icon nome="seta" tamanho={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sheet-grupo" aria-label="Transparência e metodologia">
        <h3>Transparência e metodologia</h3>
        <ul className="sheet-lista">
          {INSTITUCIONAL.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={fechar}>
                <span className="sheet-item-esq">
                  <Icon nome={item.icone} tamanho={19} />
                  <span>{item.rotulo}</span>
                </span>
                <Icon nome="seta" tamanho={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sheet-grupo" aria-label="Ações do aplicativo">
        <h3>Aplicativo</h3>
        <ul className="sheet-lista">
          {!instalado && (
            <li>
              <button type="button" className="sheet-acao" onClick={() => void instalar()}>
                <span className="sheet-item-esq">
                  <Icon nome="instalar" tamanho={19} />
                  <span>{podeInstalar ? "Instalar aplicativo agora" : "Adicionar à tela inicial"}</span>
                </span>
                <Icon nome="seta" tamanho={16} />
              </button>
            </li>
          )}
          <li>
            <button type="button" className="sheet-acao" onClick={() => void compartilhar()}>
              <span className="sheet-item-esq">
                <Icon nome="compartilhar" tamanho={19} />
                <span>Compartilhar esta página</span>
              </span>
              <Icon nome="seta" tamanho={16} />
            </button>
          </li>
        </ul>
        {ajudaInstalar && (
          <p className="sheet-nota">
            <strong>No Android (Chrome ou Edge):</strong> toque no menu do navegador e escolha <em>Instalar aplicativo</em>.{" "}
            <strong>No iPhone (Safari):</strong> toque em <em>Compartilhar</em> e depois em <em>Adicionar à Tela de Início</em>.
          </p>
        )}
        {aviso && (
          <p className="sheet-nota" role="status" aria-live="polite">
            {aviso}
          </p>
        )}
      </section>
    </dialog>
  );
}
