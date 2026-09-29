import { useCallback, useEffect, useRef, useState } from "react";
import {
  advance,
  createSession,
  defaults,
  end,
  normalizeMinutes,
  MAX_PLAYERS,
  pause,
  removeHistorySession,
  remaining,
  resume,
  start,
  suspend,
  uid,
  type AppData,
  type Player,
  type PlayerIcon,
  type Settings,
} from "../domain/game";
import { clear, decodeBackup, isRepositoryKey, limitHistory, load, save } from "../domain/storage";
import { alarm, primeAudio } from "../domain/alerts";

export type PersistenceState = "saved" | "backup" | "unsaved" | "recovered" | "migrated";

export function useGame() {
  const [data, setData] = useState<AppData>(defaults);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [signal, setSignal] = useState<"death" | "timeout" | "pause" | "resume" | null>(null);
  const [persistence, setPersistence] = useState<{ state: PersistenceState; message?: string }>({
    state: "saved",
  });
  const dataRef = useRef(data);
  dataRef.current = data;

  const applyLoadedData = useCallback((result: ReturnType<typeof load>) => {
    dataRef.current = result.data;
    setData(result.data);
    setPersistence(
      result.issue
        ? { state: result.recovered ? "recovered" : "unsaved", message: result.issue }
        : result.migrated
          ? { state: "migrated", message: "Seus dados foram atualizados para o novo formato." }
          : { state: "saved" },
    );
  }, []);

  const update = useCallback((next: AppData) => {
    const bounded = limitHistory(next);
    dataRef.current = bounded;
    setData(bounded);
    const result = save(bounded);
    setPersistence(
      result.ok
        ? result.issue
          ? { state: "backup", message: result.issue }
          : { state: "saved" }
        : { state: "unsaved", message: result.issue ?? "Não foi possível salvar os dados." },
    );
  }, []);

  useEffect(() => {
    const result = load();
    applyLoadedData(result);
    setReady(true);
  }, [applyLoadedData]);

  useEffect(() => {
    const syncFromOtherTab = (event: StorageEvent) => {
      if (isRepositoryKey(event.key)) applyLoadedData(load());
    };
    window.addEventListener("storage", syncFromOtherTab);
    return () => window.removeEventListener("storage", syncFromOtherTab);
  }, [applyLoadedData]);

  const processTimer = useCallback(
    (time: number) => {
      setNow(time);
      const current = dataRef.current;
      const session = current.session;
      if (session?.status !== "ACTIVE" || remaining(session, time) > 0) return;

      const expiredTurn = session.turns.at(-1);
      const next = advance(session, "TIMEOUT", time, expiredTurn?.id);
      if (next === session) return;
      update({ ...current, session: next });
      setSignal("timeout");
      alarm(current.settings, next.players[next.index]?.name ?? "Próximo jogador");
    },
    [update],
  );

  useEffect(() => {
    if (!ready) return;
    const tick = () => processTimer(Date.now());
    tick();
    // The clock renders whole seconds; 4 Hz only caused redundant React work.
    const timer = window.setInterval(tick, 1_000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [ready, processTimer]);

  useEffect(() => {
    if (!signal) return;
    const timer = window.setTimeout(() => setSignal(null), 2300);
    return () => window.clearTimeout(timer);
  }, [signal]);

  const mutate = (callback: (current: AppData) => AppData) => {
    const current = dataRef.current;
    const next = callback(current);
    if (next !== current) update(next);
  };

  const validateColor = (color: number) => {
    if (!Number.isInteger(color) || color < 0 || color > 3)
      throw new Error("Escolha uma das cores disponíveis.");
  };

  const addPlayer = (name: string, color: number) => {
    if (dataRef.current.players.length >= MAX_PLAYERS)
      throw new Error(`A lista já tem o máximo de ${MAX_PLAYERS} jogadores.`);
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed || trimmed.length > 24) throw new Error("Use um nome de 1 a 24 caracteres.");
    validateColor(color);
    if (
      dataRef.current.players.some(
        (player) => player.name.toLocaleLowerCase("pt-BR") === trimmed.toLocaleLowerCase("pt-BR"),
      )
    ) {
      throw new Error("Esse nome já existe.");
    }
    mutate((current) => ({
      ...current,
      players: [...current.players, { id: uid(), name: trimmed, color }],
    }));
  };

  const editPlayer = (id: string, name: string, color: number) => {
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed || trimmed.length > 24) throw new Error("Use um nome de 1 a 24 caracteres.");
    validateColor(color);
    if (!dataRef.current.players.some((player) => player.id === id))
      throw new Error("Jogador não encontrado.");
    if (
      dataRef.current.players.some(
        (player) =>
          player.id !== id &&
          player.name.toLocaleLowerCase("pt-BR") === trimmed.toLocaleLowerCase("pt-BR"),
      )
    ) {
      throw new Error("Esse nome já existe.");
    }
    mutate((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === id ? { ...player, name: trimmed, color } : player,
      ),
    }));
  };

  const updatePlayerAppearance = (id: string, customColor: string, icon: PlayerIcon | null) => {
    if (!/^#[\da-fA-F]{6}$/.test(customColor))
      throw new Error("Informe uma cor hexadecimal no formato #RRGGBB.");
    if (!dataRef.current.players.some((player) => player.id === id))
      throw new Error("Jogador não encontrado.");
    mutate((current) => ({
      ...current,
      players: current.players.map((player) => {
        if (player.id !== id) return player;
        const updated = { ...player, customColor: customColor.toUpperCase() };
        if (icon) updated.icon = icon;
        else delete updated.icon;
        return updated;
      }),
    }));
  };

  const removePlayer = (id: string) =>
    mutate((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== id),
    }));

  const draw = (players: Player[]) =>
    mutate((current) => ({
      ...current,
      session: createSession(players, Date.now(), current.settings.selectedTurnMinutes),
    }));

  const begin = () => {
    primeAudio();
    mutate((current) =>
      current.session ? { ...current, session: start(current.session, Date.now()) } : current,
    );
  };

  const die = () => {
    const current = dataRef.current;
    const session = current.session;
    if (!session || session.status !== "ACTIVE") return;
    const time = Date.now();
    if (remaining(session, time) <= 0) {
      processTimer(time);
      return;
    }
    const next = advance(session, "DEATH", time, session.turns.at(-1)?.id);
    if (next !== session) {
      update({ ...current, session: next });
      setSignal("death");
    }
  };

  const togglePause = () => {
    const session = dataRef.current.session;
    if (!session) return;
    mutate((current) => {
      const session = current.session;
      if (!session) return current;
      return {
        ...current,
        session:
          session.status === "ACTIVE" ? pause(session, Date.now()) : resume(session, Date.now()),
      };
    });
    setSignal(session.status === "ACTIVE" ? "pause" : "resume");
  };

  const suspendSession = () =>
    mutate((current) => {
      const session = current.session;
      if (!session) return current;
      if (session.status === "ORDER_READY" || session.status === "ENDED")
        throw new Error("Apenas uma sessão iniciada pode ser suspensa.");
      return { ...current, session: suspend(session, Date.now()) };
    });

  const finish = () =>
    mutate((current) => {
      if (!current.session) return current;
      const finished = end(current.session, Date.now());
      return { ...current, session: null, history: [finished, ...current.history] };
    });

  const deleteHistorySession = (sessionId: string) =>
    mutate((current) => removeHistorySession(current, sessionId));

  const discardDraw = () => mutate((current) => ({ ...current, session: null }));

  const changeSettings = (partial: Partial<Settings>) =>
    mutate((current) => {
      const settings = { ...current.settings, ...partial };
      if (partial.turnPresets) {
        const presets = [...new Set(partial.turnPresets.map(normalizeMinutes))].sort(
          (a, b) => a - b,
        );
        if (presets.length === 0) throw new Error("Mantenha pelo menos um preset de duração.");
        settings.turnPresets = presets;
        if (!presets.includes(settings.selectedTurnMinutes))
          settings.selectedTurnMinutes = presets[0]!;
      }
      if (partial.selectedTurnMinutes !== undefined) {
        const selected = normalizeMinutes(partial.selectedTurnMinutes);
        if (!settings.turnPresets.includes(selected))
          throw new Error("Salve esse tempo como preset antes de selecioná-lo.");
        settings.selectedTurnMinutes = selected;
      }
      if (
        partial.volume !== undefined &&
        (!Number.isFinite(partial.volume) || partial.volume < 0 || partial.volume > 1)
      )
        throw new Error("O volume deve ficar entre 0 e 100%.");
      return { ...current, settings };
    });

  const resetData = () => {
    const result = clear();
    dataRef.current = defaults;
    setData(defaults);
    setPersistence(
      result.ok
        ? { state: "saved" }
        : { state: "unsaved", message: result.issue ?? "Não foi possível apagar os dados locais." },
    );
  };

  const restoreBackup = (raw: string) => {
    const restored = decodeBackup(raw);
    update(restored);
  };

  return {
    data,
    ready,
    now,
    signal,
    persistence,
    addPlayer,
    editPlayer,
    updatePlayerAppearance,
    removePlayer,
    draw,
    begin,
    die,
    togglePause,
    suspendSession,
    finish,
    deleteHistorySession,
    discardDraw,
    changeSettings,
    resetData,
    restoreBackup,
  };
}

export type Game = ReturnType<typeof useGame>;
