import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  retypePassword: z.string().min(6),
  phone: z.string().min(9, "Nomor phone minimal 9 digit"),
  bankName: z.string().min(1, "Pilih bank/e-wallet"),
  accountName: z.string().min(2, "Account name wajib diisi"),
  accountNumber: z.string().min(4, "Account number wajib diisi"),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "Wajib menyetujui syarat dan ketentuan",
  }),
}).refine((data) => data.password === data.retypePassword, {
  path: ["retypePassword"],
  message: "ReType Password harus sama dengan Password",
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().optional(),
});

export const transactionSchema = z
  .object({
    playerId: z.string().min(1, "Player wajib dipilih."),
    type: z.enum(["DEPOSIT", "WITHDRAW", "TRANSFER", "ADJUSTMENT"]),
    amount: z.coerce.number(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "ADJUSTMENT") {
      if (data.amount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Amount adjustment tidak boleh 0.",
        });
      }

      return;
    }

    if (data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Amount harus lebih besar dari 0.",
      });
    }
  });
