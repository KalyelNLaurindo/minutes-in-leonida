import { describe, expect, it } from "vitest";
import { translate } from "./i18n";
import { detectBrowserLocale } from "../domain/locale";

describe("locales", () => {
  it("detects supported browser and device language preferences", () => {
    expect(detectBrowserLocale(["fr-CA", "es-MX", "en-US"])).toBe("es");
    expect(detectBrowserLocale(["en-GB"])).toBe("en");
    expect(detectBrowserLocale(["pt-BR"])).toBe("pt");
    expect(detectBrowserLocale(["fr-FR", "de-DE"])).toBe("pt");
  });

  it("provides the home action and steps in English and Spanish", () => {
    expect(translate("en", "MONTAR SESSÃO")).toBe("START A SESSION");
    expect(translate("es", "MONTAR SESSÃO")).toBe("ARMAR LA SESIÓN");
    expect(translate("en", "Passar o controle")).toBe("Pass the controller");
    expect(translate("es", "Passar o controle")).toBe("Pasar el mando");
  });

  it("translates text that contains a saved duration and player name", () => {
    expect(
      translate(
        "en",
        "Escolha de 2 a 10 pessoas. Cada turno terá 25 minutos; a ordem será sorteada.",
      ),
    ).toContain("Each turn lasts 25 minutes");
    expect(translate("es", "Remover Ana?")).toBe("¿Eliminar a Ana?");
  });

  it("preserves spacing around localized text nodes", () => {
    expect(translate("en", " min ")).toBe(" min ");
    expect(translate("en", " turnos")).toBe(" turns");
  });
});
