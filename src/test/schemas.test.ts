import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/schemas";

describe("contactSchema", () => {
  const valid = { fullName: "Ana Souza", phone: "19999998888", email: "" };

  it("aceita contato válido com e-mail vazio", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("aceita telefone com +55", () => {
    expect(contactSchema.safeParse({ ...valid, phone: "+5519999998888" }).success).toBe(true);
  });

  it.each([
    ["nome curto", { fullName: "An" }],
    ["telefone com menos de 10 dígitos", { phone: "1999999" }],
    ["telefone com letras", { phone: "19abc998888" }],
    ["e-mail inválido", { email: "ana@" }],
  ])("rejeita %s", (_, patch) => {
    expect(contactSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});
