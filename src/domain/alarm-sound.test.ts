import { describe, expect, it } from "vitest";
import { validateAlarmSound } from "./alarm-sound";

describe("custom alarm sound validation", () => {
  it("accepts a non-empty audio file within the local storage limit", () => {
    expect(() => validateAlarmSound({ type: "audio/mpeg", size: 1024 })).not.toThrow();
  });

  it("rejects non-audio, empty, and oversized files", () => {
    expect(() => validateAlarmSound({ type: "image/png", size: 1024 })).toThrow("arquivo de áudio");
    expect(() => validateAlarmSound({ type: "audio/wav", size: 0 })).toThrow("vazio");
    expect(() => validateAlarmSound({ type: "audio/wav", size: 8 * 1024 * 1024 + 1 })).toThrow(
      "8 MB",
    );
  });
});
