import type { Settings } from "./game";
let context: AudioContext | undefined;
export function primeAudio() {
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {
      /* Audio may remain unavailable until the browser accepts a user gesture. */
    });
  } catch {
    /* unsupported */
  }
}
export function alarm(
  settings: Pick<Settings, "alarm" | "volume" | "vibration" | "locale">,
  nextName: string,
) {
  if (settings.alarm) {
    try {
      primeAudio();
      if (context) {
        const at = context.currentTime;
        [0, 0.22, 0.44].forEach((offset) => {
          const oscillator = context?.createOscillator(),
            gain = context?.createGain();
          if (!oscillator || !gain || !context) return;
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(offset === 0.44 ? 740 : 590, at + offset);
          gain.gain.setValueAtTime(0.001, at + offset);
          gain.gain.exponentialRampToValueAtTime(
            Math.max(0.001, settings.volume * 0.22),
            at + offset + 0.03,
          );
          gain.gain.exponentialRampToValueAtTime(0.001, at + offset + 0.18);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(at + offset);
          oscillator.stop(at + offset + 0.19);
        });
      }
    } catch {
      /* optional */
    }
  }
  if (settings.vibration)
    try {
      navigator.vibrate?.([180, 90, 180]);
    } catch {
      /* optional */
    }
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      const locale = settings.locale ?? "pt";
      const message =
        locale === "en"
          ? `It’s ${nextName}’s turn.`
          : locale === "es"
            ? `Es el turno de ${nextName}.`
            : `Agora é a vez de ${nextName}.`;
      const title = locale === "en" ? "TIME!" : locale === "es" ? "¡TIEMPO!" : "TEMPO!";
      if ("serviceWorker" in navigator) {
        void navigator.serviceWorker.ready
          .then((registration) =>
            registration.showNotification(title, { body: message, tag: "leonida-turn" }),
          )
          .catch(() => {
            try {
              new Notification(title, { body: message });
            } catch {
              /* Notification permission may change while the async request is pending. */
            }
          });
      } else {
        new Notification(title, { body: message });
      }
    }
  } catch {
    /* Notifications are optional and may be denied by the browser. */
  }
}
export function testAlarm(volume: number, locale: Settings["locale"] = "pt") {
  alarm(
    { alarm: true, volume, vibration: false, locale },
    locale === "en" ? "next player" : locale === "es" ? "siguiente jugador" : "próximo jogador",
  );
}
