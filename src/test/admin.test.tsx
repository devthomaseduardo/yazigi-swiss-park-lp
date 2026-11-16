import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

import Admin from "@/pages/Admin";

describe("/admin", () => {
  it("manda para /auth quando não há sessão", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<p>tela de login</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("tela de login")).toBeTruthy();
  });
});
