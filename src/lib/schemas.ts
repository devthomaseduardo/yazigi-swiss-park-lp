import { z } from 'zod'

/** Contato pedido antes do diagnóstico de inglês. */
export const contactSchema = z.object({
  fullName: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  phone: z.string().trim().regex(/^\+?\d{10,20}$/, 'Telefone inválido (mínimo 10 dígitos)'),
  email: z.string().trim().email('Email inválido').optional().or(z.literal(''))
})
