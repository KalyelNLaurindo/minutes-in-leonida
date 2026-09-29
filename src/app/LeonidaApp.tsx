import { useState } from "react";
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
  Home,
  Clock3,
  X,
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

type View = "home" | "players" | "setup" | "draw" | "session" | "history" | "settings" | "summary";
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
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={action}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function Header({ view, go, active }: { view: View; go: (v: View) => void; active: boolean }) {
  return (
    <header className="site-header">
      <Button
        variant="ghost"
        className="brand-button"
        onClick={() => go(active ? "session" : "home")}
        aria-label="Início"
      >
        <Logo />
      </Button>
      <div className="header-right">
        <span className="header-caption">SEU TEMPO. SUA VEZ.</span>
        <Button
          variant="ghost"
          size="icon"
          title="Início"
          aria-label="Início"
          onClick={() => go("home")}
        >
          <Home />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Configurações"
          aria-label="Configurações"
          onClick={() => go("settings")}
        >
          <Settings2 />
        </Button>
      </div>
    </header>
  );
}
export default function LeonidaApp() {
  const game = useGame();
  const { data, ready } = game;
  const [view, setView] = useState<View>("home");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const exportSessionReport = (session: Session) => {
    let url: string | undefined;
    try {
      const report = new Blob([buildSessionReport(session)], {
        type: "text/markdown;charset=utf-8",
      });
      url = URL.createObjectURL(report);
      const link = document.createElement("a");
      const date = new Date(session.endedAt ?? Date.now()).toISOString().slice(0, 10);
      link.href = url;
      link.download = `minutes-in-leonida-placar-${date}.md`;
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
  const currentView: View =
    active && view === "home"
      ? "session"
      : session?.status === "ORDER_READY" && view === "home"
        ? "draw"
        : view;
  const go = (v: View) => {
    setView(v);
    window.scrollTo(0, 0);
  };
  if (!ready)
    return (
      <main className="app-shell loading-state">
        <Logo />
      </main>
    );
  return (
    <div className="app-shell">
      <div
        className="scenery"
        style={{
          backgroundImage: `linear-gradient(to bottom, var(--scenery-top), var(--scenery-bottom)), url(${scenery})`,
        }}
      />
      <div className="app-content">
        <Header view={currentView} go={go} active={!!active} />
        {game.persistence.message && (
          <div
            className={`persistence-notice ${game.persistence.state === "unsaved" ? "persistence-error" : ""}`}
            role="status"
          >
            {game.persistence.message}
          </div>
        )}
        {actionError && (
          <div className="persistence-notice persistence-error" role="alert">
            {actionError}
          </div>
        )}
        {currentView === "home" && (
          <main className="home-view">
            <div className="home-copy">
              <span className="eyebrow">
                <span className="eyebrow-line" /> O JOGO NÃO PARA
              </span>
              <h1>
                MINUTES
                <br />
                <span>IN LEONIDA</span>
              </h1>
              <p>
                A turma vai se aventurar pelas ruas da Cidade do Vício, mas só tem um controle?
                Revezem os turnos e tentem não chamar a polícia no caminho.
              </p>
              <Button
                className="primary-cta"
                onClick={() => go(data.players.length >= 2 ? "setup" : "players")}
              >
                MONTAR SESSÃO <ArrowRight />
              </Button>
            </div>
            <div className="home-bottom">
              <div className="home-edition">01 / O TEMPO É REI</div>
              <div className="home-shortcuts">
                <Button variant="ghost" onClick={() => go("players")}>
                  <Users /> Jogadores
                </Button>
                <Button variant="ghost" onClick={() => go("history")}>
                  <History /> Histórico
                </Button>
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
                MONTAR SESSÃO <ArrowRight />
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
              <span>{selected.length} / 4 SELECIONADOS</span>
              <Button variant="ghost" onClick={() => go("players")}>
                <Plus /> Adicionar jogador
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
                    go("draw");
                  } catch (error) {
                    setActionError(
                      error instanceof Error ? error.message : "Não foi possível sortear a ordem.",
                    );
                  }
                }}
              >
                SORTEAR ORDEM <ArrowRight />
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
                  {i === 0 && <span className="first-badge">COMEÇA</span>}
                </div>
              ))}
            </div>
            <div className="page-actions">
              <Button
                variant="ghost"
                onClick={() => {
                  game.discardDraw();
                  game.draw(session.players);
                }}
              >
                <RotateCcw /> Sortear de novo
              </Button>
              <Button
                className="primary-cta"
                onClick={() => {
                  game.begin();
                  go("session");
                }}
              >
                INICIAR SESSÃO <ArrowRight />
              </Button>
            </div>
          </Page>
        )}
        {currentView === "session" && active && session && (
          <SessionView
            session={session}
            game={game}
            onFinish={(sessionId) => {
              setSelectedHistory(sessionId);
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
                data.history.map((s, i) => (
                  <Button
                    key={s.id}
                    variant="ghost"
                    className="history-row"
                    onClick={() => {
                      setSelectedHistory(s.id);
                      go("summary");
                    }}
                  >
                    <span className="history-index">
                      {String(data.history.length - i).padStart(2, "0")}
                    </span>
                    <span className="history-info">
                      <strong>
                        {new Date(s.startedAt ?? s.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                      <small>
                        {s.players.map((p) => p.name).join(" · ")} — {s.turns.length} turnos
                      </small>
                    </span>
                    <ArrowRight />
                  </Button>
                ))
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
            title="FIM DE JOGO"
            kicker="RESUMO DA SESSÃO"
            description="Mais uma noite em Leonida."
            back={() => go("history")}
          >
            <Summary
              session={data.history.find((s) => s.id === selectedHistory) ?? data.history[0]}
              onExport={exportSessionReport}
            />
            <div className="page-actions">
              <Button className="primary-cta" onClick={() => go("home")}>
                VOLTAR AO INÍCIO <ArrowRight />
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
          <span>MINUTES IN LEONIDA © 2026</span>
          <span>FEITO PARA A NOITE DURAR MAIS.</span>
        </footer>
      </div>
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
        <ArrowLeft /> VOLTAR
      </Button>
      <div className="page-heading">
        <span className="eyebrow">
          <span className="eyebrow-line" /> {kicker}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </main>
  );
}
function Empty({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="empty-state">
      {icon}
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}
function Players({ game }: { game: Game }) {
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
        <span className="panel-label">{editing ? "EDITAR JOGADOR" : "NOVO JOGADOR"}</span>
        <form onSubmit={submit}>
          <label htmlFor="player-name">Nome</label>
          <input
            id="player-name"
            maxLength={24}
            placeholder="Como te chamam?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Escolha sua cor</label>
          <div className="swatches">
            {palettes.map((palette, i) => (
              <Button
                type="button"
                variant="ghost"
                key={palette}
                className={`swatch ${palette} ${color === i ? "swatch-active" : ""}`}
                aria-label={`Cor ${i + 1}`}
                aria-pressed={color === i}
                onClick={() => setColor(i)}
              />
            ))}
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Button type="submit" className="form-submit">
              {editing ? <Check /> : <Plus />}
              {editing ? "SALVAR" : "ADICIONAR"}
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
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="roster">
        <div className="section-title">
          <span>JOGADORES SALVOS</span>
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
                title={`Editar ${p.name}`}
                aria-label={`Editar ${p.name}`}
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
                title={`Remover ${p.name}?`}
                description="O jogador será removido da sua lista. Sessões antigas continuarão intactas."
                action={() => game.removePlayer(p.id)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  title={`Remover ${p.name}`}
                  aria-label={`Remover ${p.name}`}
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
function SessionView({
  session,
  game,
  onFinish,
}: {
  session: Session;
  game: Game;
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
          <span className="eyebrow-line" /> SESSÃO EM ANDAMENTO
        </span>
        <span className="session-live">
          <span />
          {paused ? "PAUSADA" : "AO VIVO"}
        </span>
      </div>
      <div className="session-stage">
        <div className="turn-label">{paused ? "SESSÃO PAUSADA" : "AGORA É A VEZ DE"}</div>
        <h1 key={player.id} className="current-player">
          {player.name}
        </h1>
        <div className="timer" role="timer" aria-label={`Tempo restante: ${clockText(left)}`}>
          {clockText(left)}
        </div>
        <div className="timer-track">
          <span style={{ width: `${(left / session.turnDurationMs) * 100}%` }} />
        </div>
        <div className="next-up">
          <span>PRÓXIMO NA FILA</span>
          <div>
            <Avatar player={next} /> <strong>{next.name}</strong>
            <ArrowRight />
          </div>
        </div>
      </div>
      <div className="session-controls">
        {paused ? (
          <Button className="death-button resume-button" onClick={game.togglePause}>
            <Play /> RETOMAR
          </Button>
        ) : (
          <>
            <Button className="death-button" onClick={game.die}>
              <Skull /> MORREU
            </Button>
            <Button className="pause-button" onClick={game.togglePause}>
              <Pause /> PAUSAR
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
            Encerrar sessão <ArrowRight />
          </Button>
        </Confirm>
      </div>
      <div className="order-strip">
        <span>ORDEM DA NOITE</span>
        <div>
          {session.players.map((p, i) => (
            <span key={p.id} className={i === session.index ? "order-active" : ""}>
              {String(i + 1).padStart(2, "0")} {p.name}
            </span>
          ))}
        </div>
      </div>
      {game.signal && (
        <div className="turn-alert" role="status">
          {game.signal === "timeout" ? "TEMPO!" : "NOVA VEZ"}{" "}
          <span>Agora é a vez de {player.name}</span>
        </div>
      )}
    </main>
  );
}
function Summary({
  session,
  onExport,
}: {
  session: Session | undefined;
  onExport: (session: Session) => void;
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
          <small>DURAÇÃO</small>
          <strong>
            {durationText(
              (session.endedAt ?? Date.now()) - (session.startedAt ?? session.createdAt),
            )}
          </strong>
        </div>
        <div>
          <small>TURNOS</small>
          <strong>{session.turns.length}</strong>
        </div>
        <div>
          <small>MORTES</small>
          <strong>{records.reduce((sum, r) => sum + r.deaths, 0)}</strong>
        </div>
      </div>
      <div className="section-title">
        <span>POR JOGADOR</span>
      </div>
      <div className="stat-list">
        {records.map((r) => (
          <div className="stat-row" key={r.player.id}>
            <Avatar player={r.player} />
            <div className="stat-name">
              <strong>{r.player.name}</strong>
              <small>{durationText(r.totalMs)} jogados</small>
            </div>
            <div className="stat-numbers">
              <span>
                {r.turns} <small>turnos</small>
              </span>
              <span>
                {r.deaths} <small>mortes</small>
              </span>
              <span>
                {r.timeouts} <small>tempos</small>
              </span>
            </div>
            <div className="stat-extra">
              Média {durationText(r.averageMs)} · Maior turno {durationText(r.longestMs)}
            </div>
          </div>
        ))}
      </div>
      <div className="section-title">
        <span>LINHA DO TEMPO</span>
      </div>
      <div className="timeline">
        {session.turns.map((t) => (
          <div key={t.id}>
            <span>#{String(t.sequence).padStart(2, "0")}</span>
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
          <Download /> Exportar placar (.md)
        </Button>
      </div>
    </div>
  );
}
function Settings({ game, go }: { game: Game; go: (v: View) => void }) {
  const settings = game.data.settings;
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
          "Restaurar esta cópia substituirá os jogadores, sessão, histórico e ajustes atuais. Continuar?",
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
          <span>DURAÇÃO DOS TURNOS</span>
        </div>
        <div className="setting-row">
          <span className="setting-icon">
            <Clock3 />
          </span>
          <label className="setting-copy" htmlFor="turn-preset">
            <strong>Preset da próxima sessão</strong>
            <small>Esta escolha fica salva; sessões em andamento mantêm o tempo original.</small>
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
                {minutes} min
              </option>
            ))}
          </select>
        </div>
        <div className="preset-editor">
          <label htmlFor="preset-minutes">Criar preset (1 a 180 minutos)</label>
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
              <Plus /> Salvar preset
            </Button>
          </div>
          {presetError && (
            <p className="form-error" role="alert">
              {presetError}
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
                  aria-label={`Remover preset de ${minutes} minutos`}
                >
                  {minutes} min <X />
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="setting-group">
        <div className="section-title">
          <span>ALERTAS</span>
        </div>
        <label className="setting-row">
          <span className="setting-icon">
            <Volume2 />
          </span>
          <span className="setting-copy">
            <strong>Alarme sonoro</strong>
            <small>Aviso quando o tempo acabar e o app estiver aberto</small>
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
            <strong>Volume</strong>
            <small>{Math.round(settings.volume * 100)}%</small>
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
          onClick={() => testAlarm(settings.volume)}
        >
          <Play /> Testar alarme
        </Button>
        <label className="setting-row">
          <span className="setting-icon">
            <Bell />
          </span>
          <span className="setting-copy">
            <strong>Vibração</strong>
            <small>Quando disponível no aparelho</small>
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
            <strong>Notificações</strong>
            <small>
              {permission === "granted"
                ? "Permitidas"
                : permission === "denied"
                  ? "Bloqueadas pelo navegador"
                  : permission === "unavailable"
                    ? "Não disponíveis neste aparelho"
                    : "Permissão opcional"}
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
              Permitir
            </Button>
          )}
        </div>
        {permission === "granted" && (
          <p className="setting-note">
            O navegador pode mostrar uma notificação quando o app detectar o fim do turno. Ele não
            garante alertas se o sistema suspender ou fechar o app.
          </p>
        )}
      </div>
      <div className="setting-group">
        <div className="section-title">
          <span>APLICATIVO</span>
        </div>
        <div className="setting-row">
          <span className="setting-icon">
            <Download />
          </span>
          <span className="setting-copy">
            <strong>Instalar no aparelho</strong>
            <small>
              No navegador, escolha “Adicionar à tela inicial”. Após abrir conectado uma vez,
              funciona offline no site publicado.
            </small>
          </span>
        </div>
        <Button variant="outline" className="setting-action" onClick={downloadBackup}>
          <Download /> Baixar cópia de segurança
        </Button>
        <label className="backup-restore">
          Restaurar cópia de segurança
          <input type="file" accept="application/json,.json" onChange={restoreBackup} />
        </label>
        {backupError && (
          <p className="setting-note" role="status">
            {backupError}
          </p>
        )}
        <p className="setting-note">
          Guarde o arquivo fora do navegador para recuperar seus jogadores e histórico se os dados
          locais forem apagados.
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
            <Trash2 /> Apagar todos os dados
          </Button>
        </Confirm>
      </div>
    </div>
  );
}
