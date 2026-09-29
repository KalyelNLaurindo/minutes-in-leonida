import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  History,
  Pause,
  Play,
  Plus,
  Settings2,
  Skull,
  Trash2,
  Users,
  Volume2,
  RotateCcw,
  Check,
  Pencil,
  Bell,
  Download,
  Clock3,
  X,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useGame, type Game } from "./useGame";
import {
  clockText,
  durationText,
  remaining,
  stats,
  type Player,
  type Session,
} from "../domain/game";
import { testAlarm } from "../domain/alerts";
import { buildSessionReport } from "../domain/report";
import scenery from "../assets/leonida-night.jpg";
import { L, LocaleContext, translate, type Locale } from "./i18n";

type View =
  | "home"
  | "players"
  | "setup"
  | "drawing"
  | "draw"
  | "session"
  | "history"
  | "settings"
  | "summary";
const palettes = ["tone-pink", "tone-orange", "tone-blue", "tone-lime"];
function Avatar({ player, size = "normal" }: { player: Player; size?: "normal" | "large" }) {
  return (
    <span
      className={`avatar ${palettes[player.color % 4]} ${size === "large" ? "avatar-large" : ""}`}
      aria-hidden="true"
    >
      {player.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
function Logo() {
  return (
    <span className="wordmark">
      <span>MINUTES IN</span>
      <strong>
        LEONIDA<span className="wordmark-dot">.</span>
      </strong>
    </span>
  );
}
function Confirm({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action: () => void;
  children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="glass-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>
            <L>{title}</L>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <L>{description}</L>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <L>Cancelar</L>
          </AlertDialogCancel>
          <AlertDialogAction onClick={action}>
            <L>Confirmar</L>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function DrawBoxIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M10 20h28l-2 22H12L10 20Z" />
      <path d="M8 20h32M16 20V9h16v11M18 14h12M18 18h12M17 27h14M17 32h10" />
    </svg>
  );
}
function AimFigureIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="13" cy="8" r="4" />
      <path d="M13 12v14m0-10 9 5h7m-16 3-8 16m8-16 9 16m-9-20 13-4h7m-7-3h13v5H31m3-5v-2h5v2" />
    </svg>
  );
}
function Header({
  go,
  locale,
  setLocale,
}: {
  go: (v: View) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}) {
  return (
    <header className="site-header">
      <Button
        variant="ghost"
        className="brand-button"
        onClick={() => go("home")}
        aria-label={translate(locale, "Início")}
      >
        <span className="brand-lockup">
          <img className="brand-mark" src="/brand/vi-mark.png" alt="" />
          <Logo />
        </span>
      </Button>
      <nav
        className="header-nav"
        aria-label={
          locale === "pt"
            ? "Navegação principal"
            : locale === "en"
              ? "Main navigation"
              : "Navegación principal"
        }
      >
        <Button
          variant="ghost"
          title={translate(locale, "Jogadores")}
          aria-label={translate(locale, "Jogadores")}
          onClick={() => go("players")}
        >
          <Users />
          <span className="header-nav-label">
            <L>Jogadores</L>
          </span>
        </Button>
        <Button
          variant="ghost"
          title={translate(locale, "Histórico")}
          aria-label={translate(locale, "Histórico")}
          onClick={() => go("history")}
        >
          <History />
          <span className="header-nav-label">
            <L>Histórico</L>
          </span>
        </Button>
        <Button
          variant="ghost"
          title={translate(locale, "Ajustes")}
          aria-label={translate(locale, "Ajustes")}
          onClick={() => go("settings")}
        >
          <Settings2 />
          <span className="header-nav-label">
            <L>Ajustes</L>
          </span>
        </Button>
        <label
          className="language-switch"
          title={locale === "pt" ? "Idioma" : locale === "en" ? "Language" : "Idioma"}
        >
          <span className="language-mark" aria-hidden="true">
            <span>文</span>
            <span>A</span>
          </span>
          <select
            value={locale}
            aria-label={locale === "pt" ? "Idioma" : locale === "en" ? "Language" : "Idioma"}
            onChange={(event) => setLocale(event.target.value as Locale)}
          >
            <option value="pt">🇧🇷 PT</option>
            <option value="en">🇺🇸 EN</option>
            <option value="es">🇪🇸 ES</option>
          </select>
        </label>
      </nav>
    </header>
  );
}
export default function LeonidaApp() {
  const game = useGame();
  const { data, ready } = game;
  const locale = data.settings.locale ?? "pt";
  const [view, setView] = useState<View>("home");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const [summaryOrigin, setSummaryOrigin] = useState<"finished" | "history">("finished");
  const [actionError, setActionError] = useState("");
  const exportSessionReport = (session: Session) => {
    let url: string | undefined;
    try {
      const report = new Blob([buildSessionReport(session, locale)], {
        type: "text/markdown;charset=utf-8",
      });
      url = URL.createObjectURL(report);
      const link = document.createElement("a");
      const date = new Date(session.endedAt ?? Date.now()).toISOString().slice(0, 10);
      link.href = url;
      link.download = `minutes-in-leonida-score-${date}.md`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url!), 1000);
      setActionError("");
    } catch (error) {
      if (url) URL.revokeObjectURL(url);
      setActionError(
        error instanceof Error ? error.message : "Não foi possível exportar o placar da sessão.",
      );
    }
  };
  const session = data.session;
  const active = session?.status === "ACTIVE" || session?.status === "PAUSED";
  const currentView = view;
  const go = (v: View) => {
    // Leaving the play flow freezes the clock and keeps the unfinished session resumable.
    if (v !== "session" && (session?.status === "ACTIVE" || session?.status === "PAUSED")) {
      try {
        game.suspendSession();
        setActionError("");
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Não foi possível suspender a sessão.",
        );
        return;
      }
    }
    setView(v);
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    if (view !== "drawing") return;
    const timer = window.setTimeout(() => {
      setView("draw");
      window.scrollTo(0, 0);
    }, 1_250);
    return () => window.clearTimeout(timer);
  }, [view]);
  const continueSession = () => {
    if (!session) return;
    if (session.status === "ORDER_READY") {
      go("draw");
      return;
    }
    if (session.status === "SUSPENDED" || session.status === "PAUSED") {
      try {
        game.togglePause();
        setActionError("");
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Não foi possível retomar.");
        return;
      }
    }
    go("session");
  };
  if (!ready)
    return (
      <main className="app-shell loading-state">
        <Logo />
        <span
          className="loading-spinner"
          role="status"
          aria-label={translate(locale, "Carregando")}
        />
      </main>
    );
  return (
    <div className="app-shell" lang={locale}>
      <div
        className="scenery"
        style={{
          backgroundImage: `linear-gradient(to bottom, var(--scenery-top), var(--scenery-bottom)), url(${scenery})`,
        }}
      />
      <LocaleContext.Provider value={locale}>
        <div className="app-content">
          <Header
            go={go}
            locale={locale}
            setLocale={(value) => game.changeSettings({ locale: value })}
          />
          {game.persistence.message && (
            <div
              className={`persistence-notice ${game.persistence.state === "unsaved" ? "persistence-error" : ""}`}
              role="status"
            >
              <L>{game.persistence.message}</L>
            </div>
          )}
          {actionError && (
            <div className="persistence-notice persistence-error" role="alert">
              <L>{actionError}</L>
            </div>
          )}
          {currentView === "home" && (
            <main className="home-view">
              <div className="home-copy">
                <h1 className="home-poster-heading">
                  <img
                    className="home-poster"
                    src="/brand/minutes-in-leonida-lettering.png"
                    alt={
                      locale === "pt"
                        ? "Minutes in Leonida — Seu tempo, sua vez."
                        : locale === "en"
                          ? "Minutes in Leonida — Your time, your turn."
                          : "Minutes in Leonida — Tu tiempo, tu turno."
                    }
                  />
                </h1>
                <p>
                  <L>
                    A turma vai se aventurar pelas ruas da Cidade do Vício, mas só tem um controle?
                    Revezem os turnos e tentem não chamar a polícia no caminho.
                  </L>
                </p>
                {!session && (
                  <Button
                    className="primary-cta"
                    onClick={() => go(data.players.length >= 2 ? "setup" : "players")}
                  >
                    <L>JOGAR</L>
                    <ArrowRight />
                  </Button>
                )}
                <div className="home-steps" aria-label={translate(locale, "Como funciona")}>
                  <div className="home-step">
                    <DrawBoxIcon />
                    <span>
                      <L>Sortear a ordem</L>
                    </span>
                  </div>
                  <ArrowRight aria-hidden="true" />
                  <div className="home-step">
                    <AimFigureIcon />
                    <span>
                      <L>Jogar o turno</L>
                    </span>
                  </div>
                  <ArrowRight aria-hidden="true" />
                  <div className="home-step">
                    <Gamepad2 aria-hidden="true" />
                    <span>
                      <L>Passar o controle</L>
                    </span>
                  </div>
                </div>
              </div>
              {session && (
                <section
                  className="resume-session-card"
                  aria-label={translate(locale, "Sessão suspensa")}
                >
                  <div>
                    <span className="eyebrow">
                      <L>
                        {session.status === "ORDER_READY"
                          ? "SORTEIO PRONTO"
                          : session.status === "ACTIVE"
                            ? "SESSÃO EM ANDAMENTO"
                            : "SESSÃO SUSPENSA"}
                      </L>
                    </span>
                    <strong>{session.players.map((player) => player.name).join(" · ")}</strong>
                    <small>
                      <L>Retome de onde vocês pararam.</L>
                    </small>
                  </div>
                  <Button variant="outline" onClick={continueSession}>
                    <Play />
                    <L>Retomar sessão</L>
                  </Button>
                </section>
              )}
              <div className="home-bottom">
                <div className="home-edition">
                  <L>01 / O TEMPO É REI</L>
                </div>
              </div>
            </main>
          )}
          {currentView === "players" && (
            <Page
              title="JOGADORES"
              kicker="O ELENCO"
              description="Adicione sua galera antes de partir para o sorteio."
              back={() => go("home")}
            >
              <Players game={game} />
              <div className="page-actions">
                <Button
                  className="primary-cta"
                  disabled={data.players.length < 2}
                  onClick={() => go("setup")}
                >
                  <L>MONTAR SESSÃO </L>
                  <ArrowRight />
                </Button>
              </div>
            </Page>
          )}
          {currentView === "setup" && (
            <Page
              title="QUEM JOGA?"
              kicker="NOVA SESSÃO / 01"
              description={`Escolha de 2 a 4 pessoas. Cada turno terá ${data.settings.selectedTurnMinutes} minutos; a ordem será sorteada.`}
              back={() => go("home")}
            >
              <div className="selection-list">
                {data.players.map((p) => {
                  const chosen = selected.includes(p.id);
                  return (
                    <Button
                      key={p.id}
                      variant="ghost"
                      className={`selection-row ${chosen ? "selected" : ""}`}
                      onClick={() =>
                        setSelected((ids) =>
                          chosen
                            ? ids.filter((id) => id !== p.id)
                            : ids.length < 4
                              ? [...ids, p.id]
                              : ids,
                        )
                      }
                    >
                      <Avatar player={p} />
                      <span>{p.name}</span>
                      <span className="selection-check">{chosen && <Check />}</span>
                    </Button>
                  );
                })}
              </div>
              <div className="selection-footer">
                <span>
                  {selected.length} <L> / 4 SELECIONADOS</L>
                </span>
                <Button variant="ghost" onClick={() => go("players")}>
                  <Plus /> <L> Adicionar jogador</L>
                </Button>
              </div>
              <div className="page-actions">
                <Button
                  className="primary-cta"
                  disabled={selected.length < 2}
                  onClick={() => {
                    try {
                      game.draw(
                        selected
                          .map((id) => data.players.find((p) => p.id === id))
                          .filter((p): p is Player => !!p),
                      );
                      setActionError("");
                      go("drawing");
                    } catch (error) {
                      setActionError(
                        error instanceof Error
                          ? error.message
                          : "Não foi possível sortear a ordem.",
                      );
                    }
                  }}
                >
                  <L>SORTEAR ORDEM </L>
                  <ArrowRight />
                </Button>
              </div>
            </Page>
          )}
          {currentView === "draw" && session?.status === "ORDER_READY" && (
            <Page
              title="A ORDEM ESTÁ DECIDIDA."
              kicker="SORTEIO / 02"
              description={
                session.players.length === 2
                  ? "Cara ou coroa. O destino escolheu quem começa."
                  : "A cidade escolheu quem vai primeiro."
              }
              back={() => {
                game.discardDraw();
                go("setup");
              }}
            >
              <div className="draw-list">
                {session.players.map((p, i) => (
                  <div className="draw-row" key={p.id} style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="draw-number">0{i + 1}</span>
                    <Avatar player={p} />
                    <strong>{p.name}</strong>
                    {i === 0 && (
                      <span className="first-badge">
                        <L>COMEÇA</L>
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="page-actions">
                <Button
                  variant="ghost"
                  onClick={() => {
                    game.discardDraw();
                    game.draw(session.players);
                    go("drawing");
                  }}
                >
                  <RotateCcw /> <L> Sortear de novo</L>
                </Button>
                <Button
                  className="primary-cta"
                  onClick={() => {
                    game.begin();
                    go("session");
                  }}
                >
                  <L>INICIAR SESSÃO </L>
                  <ArrowRight />
                </Button>
              </div>
            </Page>
          )}
          {currentView === "drawing" && session?.status === "ORDER_READY" && (
            <DrawTransition players={session.players} />
          )}
          {currentView === "session" && active && session && (
            <SessionView
              session={session}
              game={game}
              onHome={() => go("home")}
              onFinish={(sessionId) => {
                setSelectedHistory(sessionId);
                setSummaryOrigin("finished");
                go("summary");
              }}
            />
          )}
          {currentView === "history" && (
            <Page
              title="HISTÓRICO"
              kicker="ARQUIVO DE LEONIDA"
              description="Cada turno tem uma história."
              back={() => go("home")}
            >
              <div className="history-list">
                {data.history.length ? (
                  data.history.map((s, i) => {
                    const date = new Date(s.startedAt ?? s.createdAt).toLocaleDateString(
                      locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
                      { day: "2-digit", month: "long", year: "numeric" },
                    );
                    return (
                      <div className="history-entry" key={s.id}>
                        <Button
                          variant="ghost"
                          className="history-row"
                          onClick={() => {
                            setSelectedHistory(s.id);
                            setSummaryOrigin("history");
                            go("summary");
                          }}
                        >
                          <span className="history-index">
                            {String(data.history.length - i).padStart(2, "0")}
                          </span>
                          <span className="history-info">
                            <strong>{date}</strong>
                            <small>
                              {s.players.map((p) => p.name).join(" · ")} <L> — </L>
                              {s.turns.length} <L> turnos</L>
                            </small>
                          </span>
                          <ArrowRight />
                        </Button>
                        <Confirm
                          title="Apagar sessão?"
                          description="Esta partida será removida do histórico deste aparelho."
                          action={() => game.deleteHistorySession(s.id)}
                        >
                          <Button
                            variant="ghost"
                            className="history-delete"
                            aria-label={`${translate(locale, "Apagar sessão")} ${date}`}
                            title={translate(locale, "Apagar sessão")}
                          >
                            <Trash2 />
                          </Button>
                        </Confirm>
                      </div>
                    );
                  })
                ) : (
                  <Empty
                    icon={<History />}
                    title="Nada por aqui ainda."
                    body="Sua primeira sessão vai aparecer aqui."
                  />
                )}
              </div>
            </Page>
          )}
          {currentView === "summary" && (
            <Page
              title={summaryOrigin === "finished" ? "FIM DE JOGO" : "RESUMO DA JOGATINA"}
              kicker={
                summaryOrigin === "finished" ? "RESUMO DA SESSÃO" : "PLACAR FINAL / HISTÓRICO"
              }
              description={
                summaryOrigin === "finished"
                  ? "Mais uma noite em Leonida."
                  : "Veja como foi cada turno e o placar da galera."
              }
              back={() => go("history")}
            >
              <Summary
                session={data.history.find((s) => s.id === selectedHistory) ?? data.history[0]}
                onExport={exportSessionReport}
                onDelete={(sessionId) => {
                  game.deleteHistorySession(sessionId);
                  setSelectedHistory(null);
                  setSummaryOrigin("history");
                  go("history");
                }}
              />
              <div className="page-actions">
                <Button
                  className="primary-cta"
                  onClick={() => go(summaryOrigin === "history" ? "history" : "home")}
                >
                  <L>{summaryOrigin === "history" ? "VOLTAR AO HISTÓRICO" : "VOLTAR AO INÍCIO"}</L>
                  <ArrowRight />
                </Button>
              </div>
            </Page>
          )}
          {currentView === "settings" && (
            <Page
              title="AJUSTES"
              kicker="DO SEU JEITO"
              description="Tudo fica guardado somente neste aparelho."
              back={() => go(active ? "session" : "home")}
            >
              <Settings game={game} go={go} />
            </Page>
          )}
          <footer className="site-footer">
            <span className="footer-brand">
              MINUTES IN LEONIDA <span>© 2026</span>
            </span>
            <span className="footer-credit">
              <L>FEITO COM CARINHO POR</L> <strong>Kalyel Nunes Laurindo</strong>
            </span>
          </footer>
        </div>
      </LocaleContext.Provider>
    </div>
  );
}
function Page({
  title,
  kicker,
  description,
  back,
  children,
}: {
  title: string;
  kicker: string;
  description: string;
  back: () => void;
  children: React.ReactNode;
}) {
  return (
    <main className="inner-page">
      <Button variant="ghost" className="back-button" onClick={back}>
        <ArrowLeft /> <L> VOLTAR</L>
      </Button>
      <div className="page-heading">
        <span className="eyebrow">
          <span className="eyebrow-line" /> <L>{kicker}</L>
        </span>
        <h1>
          <L>{title}</L>
        </h1>
        <p>
          <L>{description}</L>
        </p>
      </div>
      {children}
    </main>
  );
}
function Empty({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="empty-state">
      {icon}
      <strong>
        <L>{title}</L>
      </strong>
      <span>
        <L>{body}</L>
      </span>
    </div>
  );
}
function Players({ game }: { game: Game }) {
  const locale = game.data.settings.locale ?? "pt";
  const [name, setName] = useState("");
  const [color, setColor] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editing) game.editPlayer(editing, name, color);
      else game.addPlayer(name, color);
      setName("");
      setEditing(null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nome inválido.");
    }
  };
  return (
    <div className="two-column">
      <div className="glass-panel form-panel">
        <span className="panel-label">
          <L>{editing ? "EDITAR JOGADOR" : "NOVO JOGADOR"}</L>
        </span>
        <form onSubmit={submit}>
          <label htmlFor="player-name">
            <L>Nome</L>
          </label>
          <input
            id="player-name"
            maxLength={24}
            placeholder={translate(locale, "Como te chamam?")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>
            <L>Escolha sua cor</L>
          </label>
          <div className="swatches">
            {palettes.map((palette, i) => (
              <Button
                type="button"
                variant="ghost"
                key={palette}
                className={`swatch ${palette} ${color === i ? "swatch-active" : ""}`}
                aria-label={`${translate(locale, "Cor")} ${i + 1}`}
                aria-pressed={color === i}
                onClick={() => setColor(i)}
              />
            ))}
          </div>
          {error && (
            <p className="form-error" role="alert">
              <L>{error}</L>
            </p>
          )}
          <div className="form-actions">
            <Button type="submit" className="form-submit">
              {editing ? <Check /> : <Plus />}
              <L>{editing ? "SALVAR" : "ADICIONAR"}</L>
            </Button>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setError("");
                }}
              >
                <L>Cancelar</L>
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="roster">
        <div className="section-title">
          <span>
            <L>JOGADORES SALVOS</L>
          </span>
          <span>{game.data.players.length.toString().padStart(2, "0")}</span>
        </div>
        {game.data.players.length ? (
          game.data.players.map((p) => (
            <div className="player-row" key={p.id}>
              <Avatar player={p} />
              <strong>{p.name}</strong>
              <Button
                variant="ghost"
                size="icon"
                title={`${translate(locale, "Editar")} ${p.name}`}
                aria-label={`${translate(locale, "Editar")} ${p.name}`}
                onClick={() => {
                  setEditing(p.id);
                  setName(p.name);
                  setColor(p.color);
                  setError("");
                }}
              >
                <Pencil />
              </Button>
              <Confirm
                title={`${translate(locale, "Remover")} ${p.name}?`}
                description="O jogador será removido da sua lista. Sessões antigas continuarão intactas."
                action={() => game.removePlayer(p.id)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  title={`${translate(locale, "Remover")} ${p.name}`}
                  aria-label={`${translate(locale, "Remover")} ${p.name}`}
                >
                  <Trash2 />
                </Button>
              </Confirm>
            </div>
          ))
        ) : (
          <Empty
            icon={<Users />}
            title="A equipe ainda está vazia."
            body="Adicione pelo menos duas pessoas para começar."
          />
        )}
      </div>
    </div>
  );
}
function DrawTransition({ players }: { players: Player[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (players.length < 2) return;
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % players.length),
      90,
    );
    return () => window.clearInterval(timer);
  }, [players.length]);
  const player = players[activeIndex];
  return (
    <main className="draw-transition" role="status" aria-live="polite">
      <span className="eyebrow">
        <L>SORTEIO / 02</L>
      </span>
      <div className="draw-reel">
        <Avatar player={player ?? players[0]!} size="large" />
      </div>
      <h1>
        <L>SORTEANDO A ORDEM</L>
      </h1>
      <strong>{player?.name}</strong>
      <span className="loading-spinner" aria-hidden="true" />
    </main>
  );
}

function SessionView({
  session,
  game,
  onHome,
  onFinish,
}: {
  session: Session;
  game: Game;
  onHome: () => void;
  onFinish: (sessionId: string) => void;
}) {
  const player = session.players[session.index],
    next = session.players[(session.index + 1) % session.players.length];
  const left = remaining(session, game.now);
  const paused = session.status === "PAUSED";
  const urgent = left < 60000;
  if (!player || !next) return null;
  return (
    <main className={`session-view ${urgent ? "urgent" : ""}`}>
      <div className="session-top">
        <span className="eyebrow">
          <span className="eyebrow-line" /> <L> SESSÃO EM ANDAMENTO</L>
        </span>
      </div>
      <div className="session-stage">
        <div className="turn-label">
          <L>{paused ? "SESSÃO PAUSADA" : "AGORA É A VEZ DE"}</L>
        </div>
        <h1 key={player.id} className="current-player">
          {player.name}
        </h1>
        <div
          className="timer"
          role="timer"
          aria-label={`${translate(game.data.settings.locale ?? "pt", "Tempo restante")}: ${clockText(left)}`}
        >
          {clockText(left)}
        </div>
        <div className="timer-track">
          <span style={{ width: `${(left / session.turnDurationMs) * 100}%` }} />
        </div>
        <div className="next-up">
          <span>
            <L>PRÓXIMO NA FILA</L>
          </span>
          <div>
            <Avatar player={next} /> <strong>{next.name}</strong>
            <ArrowRight />
          </div>
        </div>
      </div>
      <div className="session-controls">
        {paused ? (
          <Button className="death-button resume-button" onClick={game.togglePause}>
            <Play /> <L> RETOMAR</L>
          </Button>
        ) : (
          <>
            <Button className="death-button" onClick={game.die}>
              <Skull /> <L> MORREU</L>
            </Button>
            <Button className="pause-button" onClick={game.togglePause}>
              <Pause /> <L> PAUSAR</L>
            </Button>
          </>
        )}
        <Confirm
          title="Encerrar sessão?"
          description="O turno atual será registrado e a sessão ficará salva no histórico."
          action={() => {
            game.finish();
            onFinish(session.id);
          }}
        >
          <Button variant="ghost" className="end-button">
            <L>Encerrar sessão </L>
            <ArrowRight />
          </Button>
        </Confirm>
        <Button variant="ghost" className="end-button" onClick={onHome}>
          <L>Suspender e voltar ao início</L>
          <ArrowLeft />
        </Button>
      </div>
      <div className="order-strip">
        <span>
          <L>ORDEM DA JOGATINA</L>
        </span>
        <div>
          {session.players.map((p, i) => (
            <span className="order-item" key={p.id}>
              <span className={i === session.index ? "order-active" : ""}>{p.name}</span>
              {i < session.players.length - 1 && <ArrowRight aria-hidden="true" />}
            </span>
          ))}
        </div>
      </div>
      {game.signal && (
        <div
          className={`turn-alert ${game.signal === "death" ? "turn-alert-death" : ""}`}
          role="status"
        >
          <strong>
            {game.signal === "death" ? (
              <L>SE FUDEU</L>
            ) : game.signal === "timeout" ? (
              <L>TEMPO!</L>
            ) : game.signal === "pause" ? (
              <L>JOGATINA PAUSADA</L>
            ) : (
              <L>VOLTANDO AO JOGO</L>
            )}
          </strong>
          {(game.signal === "death" || game.signal === "timeout") && (
            <span>
              <L>Agora é a vez de </L>
              {player.name}
            </span>
          )}
        </div>
      )}
    </main>
  );
}
function Summary({
  session,
  onExport,
  onDelete,
}: {
  session: Session | undefined;
  onExport: (session: Session) => void;
  onDelete: (sessionId: string) => void;
}) {
  if (!session)
    return (
      <Empty icon={<History />} title="Nenhuma sessão encontrada." body="Volte para o histórico." />
    );
  const records = stats(session);
  return (
    <div className="summary-view">
      <div className="summary-metrics">
        <div>
          <small>
            <L>DURAÇÃO</L>
          </small>
          <strong>
            {durationText(
              (session.endedAt ?? Date.now()) - (session.startedAt ?? session.createdAt),
            )}
          </strong>
        </div>
        <div>
          <small>
            <L>TURNOS</L>
          </small>
          <strong>{session.turns.length}</strong>
        </div>
        <div>
          <small>
            <L>MORTES</L>
          </small>
          <strong>{records.reduce((sum, r) => sum + r.deaths, 0)}</strong>
        </div>
      </div>
      <div className="section-title">
        <span>
          <L>POR JOGADOR</L>
        </span>
      </div>
      <div className="stat-list">
        {records.map((r) => (
          <div className="stat-row" key={r.player.id}>
            <Avatar player={r.player} />
            <div className="stat-name">
              <strong>{r.player.name}</strong>
              <small>
                {durationText(r.totalMs)} <L> jogados</L>
              </small>
            </div>
            <div className="stat-numbers">
              <span>
                {r.turns}{" "}
                <small>
                  <L>turnos</L>
                </small>
              </span>
              <span>
                {r.deaths}{" "}
                <small>
                  <L>mortes</L>
                </small>
              </span>
              <span>
                {r.timeouts}{" "}
                <small>
                  <L>tempos</L>
                </small>
              </span>
            </div>
            <div className="stat-extra">
              <L>Média </L>
              {durationText(r.averageMs)} <L> · Maior turno </L>
              {durationText(r.longestMs)}
            </div>
          </div>
        ))}
      </div>
      <div className="section-title">
        <span>
          <L>LINHA DO TEMPO</L>
        </span>
      </div>
      <div className="timeline">
        {session.turns.map((t) => (
          <div key={t.id}>
            <span>
              <L>#</L>
              {String(t.sequence).padStart(2, "0")}
            </span>
            <strong>{session.players.find((p) => p.id === t.playerId)?.name}</strong>
            <span>
              {t.endReason === "DEATH"
                ? "MORREU"
                : t.endReason === "TIMEOUT"
                  ? "TEMPO"
                  : "ENCERRADO"}
            </span>
            <span>{durationText(t.activeDurationMs ?? 0)}</span>
          </div>
        ))}
      </div>
      <div className="page-actions">
        <Button variant="outline" onClick={() => onExport(session)}>
          <Download /> <L> Exportar placar (.md)</L>
        </Button>
        <Confirm
          title="Apagar sessão?"
          description="Esta partida será removida do histórico deste aparelho."
          action={() => onDelete(session.id)}
        >
          <Button variant="outline" className="delete-session-button">
            <Trash2 /> <L>Apagar sessão</L>
          </Button>
        </Confirm>
      </div>
    </div>
  );
}
function Settings({ game, go }: { game: Game; go: (v: View) => void }) {
  const settings = game.data.settings;
  const locale = settings.locale ?? "pt";
  const supported = typeof window !== "undefined" && "Notification" in window;
  const [permission, setPermission] = useState(supported ? Notification.permission : "unavailable");
  const [presetDraft, setPresetDraft] = useState(String(settings.selectedTurnMinutes));
  const [presetError, setPresetError] = useState("");
  const [backupError, setBackupError] = useState("");
  const downloadBackup = () => {
    let url: string | undefined;
    try {
      const file = new Blob([JSON.stringify(game.data, null, 2)], { type: "application/json" });
      url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `minutes-in-leonida-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url!), 1000);
      setBackupError("");
    } catch (error) {
      if (url) URL.revokeObjectURL(url);
      setBackupError(
        error instanceof Error ? error.message : "Não foi possível baixar a cópia de segurança.",
      );
    }
  };
  const restoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const raw = await file.text();
      if (
        !window.confirm(
          translate(
            locale,
            "Restaurar esta cópia substituirá os jogadores, sessão, histórico e ajustes atuais. Continuar?",
          ),
        )
      )
        return;
      game.restoreBackup(raw);
      setBackupError("Cópia restaurada e salva neste aparelho.");
    } catch (error) {
      setBackupError(
        error instanceof Error ? error.message : "Não foi possível restaurar a cópia.",
      );
    }
  };
  const savePreset = () => {
    try {
      const minutes = Number(presetDraft);
      const presets = [...settings.turnPresets, minutes];
      game.changeSettings({ turnPresets: presets, selectedTurnMinutes: minutes });
      setPresetError("");
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : "Não foi possível salvar o preset.");
    }
  };
  return (
    <div className="settings-view">
      <div className="setting-group">
        <div className="section-title">
          <span>
            <L>DURAÇÃO DOS TURNOS</L>
          </span>
        </div>
        <div className="setting-row">
          <span className="setting-icon">
            <Clock3 />
          </span>
          <label className="setting-copy" htmlFor="turn-preset">
            <strong>
              <L>Preset da próxima sessão</L>
            </strong>
            <small>
              <L>Esta escolha fica salva; sessões em andamento mantêm o tempo original.</L>
            </small>
          </label>
          <select
            id="turn-preset"
            value={settings.selectedTurnMinutes}
            onChange={(event) =>
              game.changeSettings({ selectedTurnMinutes: Number(event.target.value) })
            }
          >
            {settings.turnPresets.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} <L> min</L>
              </option>
            ))}
          </select>
        </div>
        <div className="preset-editor">
          <label htmlFor="preset-minutes">
            <L>Criar preset (1 a 180 minutos)</L>
          </label>
          <div>
            <input
              id="preset-minutes"
              type="number"
              min="1"
              max="180"
              step="1"
              value={presetDraft}
              onChange={(event) => setPresetDraft(event.target.value)}
            />
            <Button variant="outline" onClick={savePreset}>
              <Plus /> <L> Salvar preset</L>
            </Button>
          </div>
          {presetError && (
            <p className="form-error" role="alert">
              <L>{presetError}</L>
            </p>
          )}
          {settings.turnPresets.length > 1 && (
            <div className="preset-chips">
              {settings.turnPresets.map((minutes) => (
                <Button
                  key={minutes}
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    game.changeSettings({
                      turnPresets: settings.turnPresets.filter((value) => value !== minutes),
                    })
                  }
                  aria-label={translate(locale, `Remover preset de ${minutes} minutos`)}
                >
                  {minutes} <L> min </L>
                  <X />
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="setting-group">
        <div className="section-title">
          <span>
            <L>ALERTAS</L>
          </span>
        </div>
        <label className="setting-row">
          <span className="setting-icon">
            <Volume2 />
          </span>
          <span className="setting-copy">
            <strong>
              <L>Alarme sonoro</L>
            </strong>
            <small>
              <L>Aviso quando o tempo acabar e o app estiver aberto</L>
            </small>
          </span>
          <input
            type="checkbox"
            checked={settings.alarm}
            onChange={(e) => game.changeSettings({ alarm: e.target.checked })}
          />
        </label>
        <div className="setting-row">
          <span className="setting-icon">
            <Volume2 />
          </span>
          <label className="setting-copy" htmlFor="volume">
            <strong>
              <L>Volume</L>
            </strong>
            <small>
              {Math.round(settings.volume * 100)}
              <L>%</L>
            </small>
          </label>
          <input
            id="volume"
            className="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => game.changeSettings({ volume: Number(e.target.value) })}
          />
        </div>
        <Button
          variant="outline"
          className="setting-action"
          onClick={() => testAlarm(settings.volume, locale)}
        >
          <Play /> <L> Testar alarme</L>
        </Button>
        <label className="setting-row">
          <span className="setting-icon">
            <Bell />
          </span>
          <span className="setting-copy">
            <strong>
              <L>Vibração</L>
            </strong>
            <small>
              <L>Quando disponível no aparelho</L>
            </small>
          </span>
          <input
            type="checkbox"
            checked={settings.vibration}
            onChange={(e) => game.changeSettings({ vibration: e.target.checked })}
          />
        </label>
        <div className="setting-row">
          <span className="setting-icon">
            <Bell />
          </span>
          <span className="setting-copy">
            <strong>
              <L>Notificações</L>
            </strong>
            <small>
              <L>
                {permission === "granted"
                  ? "Permitidas"
                  : permission === "denied"
                    ? "Bloqueadas pelo navegador"
                    : permission === "unavailable"
                      ? "Não disponíveis neste aparelho"
                      : "Permissão opcional"}
              </L>
            </small>
          </span>
          {permission === "default" && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  setPermission(await Notification.requestPermission());
                } catch {
                  setPermission("unavailable");
                }
              }}
            >
              <L>Permitir</L>
            </Button>
          )}
        </div>
        {permission === "granted" && (
          <p className="setting-note">
            <L>
              O navegador pode mostrar uma notificação quando o app detectar o fim do turno. Ele não
              garante alertas se o sistema suspender ou fechar o app.
            </L>
          </p>
        )}
      </div>
      <div className="setting-group">
        <div className="section-title">
          <span>
            <L>APLICATIVO</L>
          </span>
        </div>
        <div className="setting-row">
          <span className="setting-icon">
            <Download />
          </span>
          <span className="setting-copy">
            <strong>
              <L>Instalar no aparelho</L>
            </strong>
            <small>
              <L>
                No navegador, escolha “Adicionar à tela inicial”. Após abrir conectado uma vez,
                funciona offline no site publicado.
              </L>
            </small>
          </span>
        </div>
        <Button variant="outline" className="setting-action" onClick={downloadBackup}>
          <Download /> <L> Baixar cópia de segurança</L>
        </Button>
        <label className="backup-restore">
          <L>Restaurar cópia de segurança</L>
          <input type="file" accept="application/json,.json" onChange={restoreBackup} />
        </label>
        {backupError && (
          <p className="setting-note" role="status">
            <L>{backupError}</L>
          </p>
        )}
        <p className="setting-note">
          <L>
            Guarde o arquivo fora do navegador para recuperar seus jogadores e histórico se os dados
            locais forem apagados.
          </L>
        </p>
        <Confirm
          title="Apagar todos os dados?"
          description="Jogadores, sessão atual, histórico e ajustes serão apagados apenas deste aparelho. Isso não pode ser desfeito."
          action={() => {
            game.resetData();
            go("home");
          }}
        >
          <Button variant="ghost" className="danger-action">
            <Trash2 /> <L> Apagar todos os dados</L>
          </Button>
        </Confirm>
      </div>
    </div>
  );
}
