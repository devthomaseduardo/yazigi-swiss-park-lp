import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const insert = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(() => ({ insert })) },
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

import { supabase } from "@/integrations/supabase/client";
import { useLead } from "@/hooks/useLead";
import { useDiagnostic } from "@/hooks/useDiagnostic";

beforeEach(() => {
  insert.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useLead", () => {
  it("grava em leads com colunas em snake_case", async () => {
    insert.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useLead());

    const ok = await result.current.saveLead({ fullName: "Ana", phone: "19999998888", source: "hero" });

    expect(ok).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("leads");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: "Ana", phone: "19999998888", source: "hero" }),
    );
  });

  it("retorna false quando o Supabase recusa", async () => {
    insert.mockResolvedValue({ error: { message: "RLS" } });
    const { result } = renderHook(() => useLead());

    expect(await result.current.saveLead({ fullName: "Ana", phone: "19999998888", source: "cta" })).toBe(false);
  });
});

describe("useDiagnostic", () => {
  it("grava todas as respostas em diagnostic_results", async () => {
    insert.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useDiagnostic());

    const ok = await result.current.saveDiagnostic({
      fullName: "Ana",
      phone: "19999998888",
      currentLevel: "básico",
      previousExperience: "escola",
      mainObjective: "trabalho",
      biggestDifficulty: "fala",
      desiredTimeline: "6 meses",
      weeklyAvailability: "2x",
      ageRange: "26-35",
      classPreference: "presencial",
    });

    expect(ok).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("diagnostic_results");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ current_level: "básico", class_preference: "presencial" }),
    );
  });
});
