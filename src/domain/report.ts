import { stats, type Session } from "./game";
import type { Locale } from "./locale";

const escapeTableCell = (value: string) =>
  value
    .replaceAll("|", "\\|")
    .replace(/[\r\n]+/g, " ")
    .trim();

const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);

/** Give each export a readable name that stays unique for sessions on the same day. */
export function buildSessionReportFilename(session: Session, locale: Locale = "pt"): string {
  const endedAt = new Date(session.endedAt ?? session.turns.at(-1)?.endedAt ?? session.createdAt);
  const date = [
    endedAt.getFullYear(),
    String(endedAt.getMonth() + 1).padStart(2, "0"),
    String(endedAt.getDate()).padStart(2, "0"),
  ].join("");
  const playerNames = session.players
    .slice(0, 3)
    .map((player) => slug(player.name) || "jogador")
    .join("-");
  const extraPlayers =
    session.players.length > 3
      ? `${locale === "en" ? "-more-" : "-mas-"}${session.players.length - 3}`
      : "";
  const scoreLabel = locale === "en" ? "score" : locale === "es" ? "marcador" : "placar";
  const turnLabel = locale === "en" ? "turns" : "turnos";
  return `minutes-in-leonida-${scoreLabel}-${date}-${playerNames}${extraPlayers}-${session.turns.length}-${turnLabel}-${slug(session.id).slice(0, 8)}.md`;
}

/** Build a compact, terminal-inspired Markdown scoreboard for screen and print previews. */
export function buildSessionReport(session: Session, locale: Locale = "pt"): string {
  const text = {
    pt: {
      date: "Data e hora",
      started: "Início",
      duration: "Tempo decorrido",
      inactive: "Tempo pausado / inativo",
      turnLength: "Tempo por turno",
      players: "Jogadores",
      turns: "Turnos",
      deaths: "Mortes",
      timeouts: "Tempos esgotados",
      ranking: "PLACAR DA GALERA",
      player: "Jogador",
      time: "Tempo no controle",
      share: "Fatia do tempo",
      longest: "Maior turno",
      timeline: "CRONOLOGIA DA SESSÃO",
      turn: "Turno",
      result: "Desfecho",
      played: "Tempo jogado",
      removed: "Jogador removido",
      death: "Morreu",
      timeout: "Tempo esgotado",
      ended: "Sessão encerrada",
      winner: "Mais tempo no controle",
      noWinner: "Sem tempo registrado",
      rule: "O placar ordena pelo tempo total no controle; empates são decididos pelo menor número de mortes.",
      slogan: "SEU TEMPO. SUA VEZ.",
      title: "Placar final — Minutes in Leonida",
      summary: "RESUMO DA JOGATINA",
      progress: "Cada barra mostra a proporção do tempo total de jogo.",
      footer: "Relatório gerado localmente • Minutes in Leonida",
      rank: "Pos.",
      timeShort: "Tempo",
      avg: "Média por turno",
      playerRhythm: "RITMO POR JOGADOR",
      launch: "SESSÃO ENCERRADA",
    },
    en: {
      date: "Date and time",
      started: "Started",
      duration: "Elapsed time",
      inactive: "Paused / idle",
      turnLength: "Turn limit",
      players: "Players",
      turns: "Turns",
      deaths: "Deaths",
      timeouts: "Timeouts",
      ranking: "CREW SCOREBOARD",
      player: "Player",
      time: "Time in control",
      share: "Time share",
      longest: "Longest turn",
      timeline: "SESSION TIMELINE",
      turn: "Turn",
      result: "Outcome",
      played: "Time played",
      removed: "Player removed",
      death: "Died",
      timeout: "Time expired",
      ended: "Session ended",
      winner: "Most time in control",
      noWinner: "No recorded play time",
      rule: "Players are ranked by total time in control; ties go to the player with fewer deaths.",
      slogan: "YOUR TIME. YOUR TURN.",
      title: "Final score — Minutes in Leonida",
      summary: "SESSION RECAP",
      progress: "Each bar shows a share of the total play time.",
      footer: "Report generated locally • Minutes in Leonida",
      rank: "Rank",
      timeShort: "Time",
      avg: "Average turn",
      playerRhythm: "PLAYER PACE",
      launch: "SESSION CLOSED",
    },
    es: {
      date: "Fecha y hora",
      started: "Inicio",
      duration: "Tiempo transcurrido",
      inactive: "Tiempo en pausa / inactivo",
      turnLength: "Límite del turno",
      players: "Jugadores",
      turns: "Turnos",
      deaths: "Muertes",
      timeouts: "Tiempo agotado",
      ranking: "MARCADOR DEL GRUPO",
      player: "Jugador",
      time: "Tiempo con el mando",
      share: "Parte del tiempo",
      longest: "Turno más largo",
      timeline: "CRONOLOGÍA DE LA SESIÓN",
      turn: "Turno",
      result: "Resultado",
      played: "Tiempo jugado",
      removed: "Jugador eliminado",
      death: "Eliminado",
      timeout: "Tiempo agotado",
      ended: "Sesión terminada",
      winner: "Más tiempo con el mando",
      noWinner: "Sin tiempo registrado",
      rule: "El orden se basa en el tiempo total con el mando; en caso de empate, gana quien tenga menos muertes.",
      slogan: "TU TIEMPO. TU TURNO.",
      title: "Marcador final — Minutes in Leonida",
      summary: "RESUMEN DE LA PARTIDA",
      progress: "Cada barra muestra la proporción del tiempo total de juego.",
      footer: "Informe generado localmente • Minutes in Leonida",
      rank: "Puesto",
      timeShort: "Tiempo",
      avg: "Promedio por turno",
      playerRhythm: "RITMO POR JUGADOR",
      launch: "SESIÓN CERRADA",
    },
  }[locale];
  const localeTag = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(Math.max(0, milliseconds) / 1_000);
    const hours = Math.floor(seconds / 3_600);
    const minutes = Math.floor((seconds % 3_600) / 60);
    const remainder = String(seconds % 60).padStart(2, "0");
    if (locale === "en") return `${hours ? `${hours}h ` : ""}${minutes}m ${remainder}s`;
    if (locale === "es") return `${hours ? `${hours} h ` : ""}${minutes} min ${remainder} s`;
    return `${hours ? `${hours}h ` : ""}${minutes}min ${remainder}s`;
  };
  const progressBar = (value: number, total: number, width = 12) => {
    const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
    const filled = Math.round(ratio * width);
    return `\`[${"#".repeat(filled)}${"-".repeat(width - filled)}] ${Math.round(ratio * 100)}%\``;
  };
  const records = stats(session).sort(
    (first, second) =>
      second.totalMs - first.totalMs ||
      first.deaths - second.deaths ||
      first.player.name.localeCompare(second.player.name, localeTag),
  );
  const startedAt = session.startedAt ?? session.createdAt;
  const endedAt = session.endedAt ?? session.turns.at(-1)?.endedAt ?? startedAt;
  const totalDuration = Math.max(0, endedAt - startedAt);
  const totalPlayed = records.reduce((total, record) => total + record.totalMs, 0);
  const inactiveDuration = Math.max(0, totalDuration - totalPlayed);
  const deathCount = records.reduce((total, record) => total + record.deaths, 0);
  const timeoutCount = records.reduce((total, record) => total + record.timeouts, 0);
  const leader = records[0];
  const playerName = (id: string) =>
    escapeTableCell(session.players.find((player) => player.id === id)?.name ?? text.removed);
  const reasonLabel = (reason: string | undefined) =>
    reason === "DEATH"
      ? `💀 ${text.death}`
      : reason === "TIMEOUT"
        ? `⏱️ ${text.timeout}`
        : `🏁 ${text.ended}`;
  const dateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString(localeTag, { dateStyle: "medium", timeStyle: "short" });
  const ordinal = (index: number) =>
    locale === "en" ? `#${index + 1}` : locale === "es" ? `${index + 1}.º` : `${index + 1}º`;
  const frameLine = (content: string) => `|  ${content.slice(0, 64).padEnd(64, " ")}|`;

  return [
    `# ${text.title}`,
    "",
    "```text",
    "+==================================================================+",
    frameLine("MINUTES IN LEONIDA  //  SESSION SCORECARD"),
    frameLine(text.slogan),
    "+------------------------------------------------------------------+",
    frameLine(text.launch),
    "+==================================================================+",
    "```",
    "",
    `> 🏆 **${leader && leader.totalMs > 0 ? escapeTableCell(leader.player.name) : text.noWinner}**${leader && leader.totalMs > 0 ? ` — ${text.winner}` : ""}`,
    "",
    `## 🎮 ${text.summary}`,
    "",
    `| 🗂️ ${text.date} | ⏱️ ${text.duration} | 🎛️ ${text.turnLength} | 👥 ${text.players} | 🔁 ${text.turns} | ⏸️ ${text.inactive} |`,
    "| :--- | ---: | ---: | ---: | ---: | ---: |",
    `| ${dateTime(endedAt)} | ${formatDuration(totalDuration)} | ${Math.round(session.turnDurationMs / 60_000)} min | ${session.players.length} | ${session.turns.length} | ${formatDuration(inactiveDuration)} |`,
    "",
    `| 🟢 ${text.started} | 💀 ${text.deaths} | ⏰ ${text.timeouts} | 🕹️ ${text.played} |`,
    "| :--- | ---: | ---: | ---: |",
    `| ${dateTime(startedAt)} | ${deathCount} | ${timeoutCount} | ${formatDuration(totalPlayed)} |`,
    "",
    `## 🏆 ${text.ranking}`,
    "",
    `| ${text.rank} | ${text.player} | ${text.time} | ${text.share} | ${text.turns} | 💀 ${text.deaths} | ⏱️ ${text.timeouts} |`,
    "| ---: | :--- | ---: | :--- | ---: | ---: | ---: |",
    ...records.map((record, index) => {
      const marker = index === 0 && record.totalMs > 0 ? " 🏆" : "";
      return `| ${ordinal(index)} | ${escapeTableCell(record.player.name)}${marker} | ${formatDuration(record.totalMs)} | ${progressBar(record.totalMs, totalPlayed)} | ${record.turns} | ${record.deaths} | ${record.timeouts} |`;
    }),
    "",
    `_${text.progress}_`,
    "",
    `### 📊 ${text.playerRhythm}`,
    "",
    ...records.map(
      (record) =>
        `- **${escapeTableCell(record.player.name)}** — ${text.avg}: ${formatDuration(record.averageMs)} · ${text.longest}: ${formatDuration(record.longestMs)}`,
    ),
    "",
    `## 🧭 ${text.timeline}`,
    "",
    `| ${text.turn} | ${text.player} | ${text.result} | ${text.played} | Progresso |`,
    "| ---: | :--- | :--- | ---: | :--- |",
    ...session.turns.map((turn) => {
      const elapsed = turn.activeDurationMs ?? 0;
      return `| ${turn.sequence} | ${playerName(turn.playerId)} | ${reasonLabel(turn.endReason)} | ${formatDuration(elapsed)} | ${progressBar(elapsed, session.turnDurationMs, 16)} |`;
    }),
    "",
    `> 📌 ${text.rule}`,
    "",
    "---",
    "",
    `<sub>${text.footer}</sub>`,
    "",
  ].join("\n");
}
