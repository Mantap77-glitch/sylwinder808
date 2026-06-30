"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const loginSchema = z.object({
  username: z.string().min(3, "Username wajib diisi minimal 3 karakter."),
  password: z.string().min(1, "Password wajib diisi."),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "Username wajib diisi minimal 3 karakter."),
    email: z.string().email("Format email tidak valid."),
    password: z.string().min(6, "Password minimal 6 karakter."),
    retypePassword: z.string().min(6, "ReType Password wajib diisi."),
    phone: z.string().min(9, "Number Phone wajib diisi minimal 9 digit."),
    bankName: z.string().min(1, "Bank / E-Wallet wajib dipilih."),
    accountName: z.string().min(2, "Account Name wajib diisi."),
    accountNumber: z.string().min(4, "Account Number wajib diisi."),
    agreeTerms: z.boolean().refine((value) => value === true, {
      message: "Kamu wajib menyetujui Syarat & Ketentuan.",
    }),
  })
  .refine((data) => data.password === data.retypePassword, {
    path: ["retypePassword"],
    message: "ReType Password harus sama dengan Password.",
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

type PlayerAuthDialogsProps = {
  loginOpen: boolean;
  registerOpen: boolean;
  onLoginOpenChange: (open: boolean) => void;
  onRegisterOpenChange: (open: boolean) => void;
};

const bankOptions = [
  { value: "BCA", label: "BCA" },
  { value: "BRI", label: "BRI" },
  { value: "BNI", label: "BNI" },
  { value: "MANDIRI", label: "Mandiri" },
  { value: "CIMB", label: "CIMB Niaga" },
  { value: "DANA", label: "DANA" },
  { value: "OVO", label: "OVO" },
  { value: "GOPAY", label: "GoPay" },
  { value: "SHOPEEPAY", label: "ShopeePay" },
];

const terms = [
  "Pendaftar harus berusia 18 tahun keatas.",
  "Anda wajib memberikan data informasi dengan lengkap dalam formulir yang tersedia (Nomor telepon, Nomor dan Nama Rekening).",
  "Proses Transaksi hanya bisa dilakukan pada jam bank online.",
  "Proses Pemindahan saldo hanya dapat dilakukan sebanyak 2 kali dalam sehari.",
  "Proses Deposit dilakukan melalui Mesin ATM, Internet banking, Mobile Banking dan SMS Banking. Diluar dari ini, kami menolak untuk melakukan proses deposit.",
  "Kami berhak menolak proses setiap member yang memanipulasi atau mencurigakan.",
  "Peringatan keras bagi bonus hunter / player hantu / betting syndicate tidak terima disini. Jika terindikasi adanya keganjilan dalam betlist maka kami berhak menutup akun dan menyita seluruh kredit yang ada.",
  "Kami melarang keras penggunaan perangkat, software, bots, program atau metode apapun yang diaplikasikan untuk menghasilkan taruhan yang tidak wajar dan merugikan pihak kami. Penutupan account akan dilakukan tanpa adanya pemberitahuan terlebih dahulu dan semua kemenangan dari taruhan yang dilakukan akan dibatalkan dan sisa saldo akan dihanguskan.",
  "Kami tidak menerima komplain atas Void dan Reject dalam permainan, sebab itu diluar tanggung jawab kami.",
  "Kami tidak menerima pendaftaran apabila anda menggunakan IP Address Luar Negri seperti Malaysia, Singapore, Hongkong, Cambodia, China.",
  "Proses Withdraw atau penarikan tidak dapat dilakukan apabila informasi rekening tertuju berbeda seperti informasi rekening pada database kami.",
];

export function PlayerAuthDialogs({
  loginOpen,
  registerOpen,
  onLoginOpenChange,
  onRegisterOpenChange,
}: PlayerAuthDialogsProps) {
  const router = useRouter();
  const [termsOpen, setTermsOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      retypePassword: "",
      phone: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      agreeTerms: false,
    },
  });

  const loginLoading = loginForm.formState.isSubmitting;
  const registerLoading = registerForm.formState.isSubmitting;

  const loginErrors = loginForm.formState.errors;
  const registerErrors = registerForm.formState.errors;

  async function onLoginSubmit(values: LoginValues) {
    setServerError("");

    const response = await fetch("/api/auth/player-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const result = await response.json();

    if (!response.ok) {
      setServerError(result?.message || "Login gagal. Periksa username dan password.");
      return;
    }

    onLoginOpenChange(false);
    router.push("/home");
    router.refresh();
  }

  async function onRegisterSubmit(values: RegisterValues) {
    setServerError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type" : "application/json",
        },
        body: JSON.stringify(values),
      });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setServerError(
        result?.message || "Register gagal. Periksa data kembali."
      );
      return;
    }

    registerForm.reset();
    onRegisterOpenChange(false);
    
    alert(result?.message || "Register berhasil. Silahkan login.");
    } catch {
    setServerError("Register gagal. Server tidak dapat dihubungi.");
    }
  }

  const errorText = useMemo(() => serverError, [serverError]);

  return (
    <>
      <Dialog
        open={loginOpen}
        onOpenChange={(open) => {
          setServerError("");
          onLoginOpenChange(open);
        }}
      >
        <DialogContent className="max-w-md border-white/10 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Masukkan username dan password yang sudah terdaftar.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            {errorText && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {errorText}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                autoComplete="username"
                {...loginForm.register("username")}
              />
              {loginErrors.username && (
                <p className="text-sm text-red-300">{loginErrors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                {...loginForm.register("password")}
              />
              {loginErrors.password && (
                <p className="text-sm text-red-300">{loginErrors.password.message}</p>
              )}
            </div>

            <Button className="w-full" type="submit" disabled={loginLoading}>
              {loginLoading ? "Memproses..." : "Login"}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Belum punya akun?{" "}
              <button
                type="button"
                className="font-bold text-cyan-300 hover:text-cyan-200 hover:underline"
                onClick={() => {
                  setServerError("");
                  onLoginOpenChange(false);
                  onRegisterOpenChange(true);
                }}
                >
                  Daftar sekarang
                </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={registerOpen}
        onOpenChange={(open) => {
          setServerError("");
          onRegisterOpenChange(open);
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-white/10 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>Daftar</DialogTitle>
            <DialogDescription>
              Semua wajib diisi sebelum klik tombol daftar.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            {errorText && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {errorText}
              </div>
            )}

            <section className="rounded-2xl border border-cyan-400/25 bg-cyan-400/5 p-4">
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-cyan-300">
                Informasi Pribadi
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input id="register-username" {...registerForm.register("username")} />
                  {registerErrors.username && (
                    <p className="text-sm text-red-300">{registerErrors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" type="email" {...registerForm.register("email")} />
                  {registerErrors.email && (
                    <p className="text-sm text-red-300">{registerErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    {...registerForm.register("password")}
                  />
                  {registerErrors.password && (
                    <p className="text-sm text-red-300">{registerErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-retype-password">ReType Password</Label>
                  <Input
                    id="register-retype-password"
                    type="password"
                    autoComplete="new-password"
                    {...registerForm.register("retypePassword")}
                  />
                  {registerErrors.retypePassword && (
                    <p className="text-sm text-red-300">
                      {registerErrors.retypePassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="register-phone">Number Phone</Label>
                  <Input
                    id="register-phone"
                    inputMode="tel"
                    {...registerForm.register("phone")}
                  />
                  {registerErrors.phone && (
                    <p className="text-sm text-red-300">{registerErrors.phone.message}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4">
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-amber-300">
                Informasi Pembayaran
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Bank / E-Wallet</Label>
                  <Select
                    value={registerForm.watch("bankName")}
                    onValueChange={(value) =>
                      registerForm.setValue("bankName", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="border-white/10 bg-slate-950 text-white">
                      <SelectValue placeholder="Pilih Bank / E-Wallet" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={8}
                      className="z-[9999] max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 text-white shadow-2xl"
                    >
                      {bankOptions.map((bank) => (
                        <SelectItem 
                          key={bank.value}
                          value={bank.value}
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm text-white focus:bg-cyan-400/15 focus:text-cyan-200 data-[highlighted]:bg-cyan-400/15 data-[highlighted]:text-cyan-200"
                          >
                          {bank.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {registerErrors.bankName && (
                    <p className="text-sm text-red-300">{registerErrors.bankName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-account-name">Account Name</Label>
                  <Input
                    id="register-account-name"
                    {...registerForm.register("accountName")}
                  />
                  {registerErrors.accountName && (
                    <p className="text-sm text-red-300">
                      {registerErrors.accountName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-account-number">Account Number</Label>
                  <Input
                    id="register-account-number"
                    inputMode="numeric"
                    {...registerForm.register("accountNumber")}
                  />
                  {registerErrors.accountNumber && (
                    <p className="text-sm text-red-300">
                      {registerErrors.accountNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              Dengan klik tombol DAFTAR, saya menyatakan bahwa saya berumur diatas 18 tahun.
              Saya telah membaca dan menyetujui Syarat dan Ketentuan dari SITUS.{" "}
              <button
                type="button"
                className="font-bold text-amber-300 underline underline-offset-4"
                onClick={() => setTermsOpen(true)}
              >
                SYARAT & KETENTUAN
              </button>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-300">
              <Checkbox
                checked={registerForm.watch("agreeTerms") === true}
                onCheckedChange={(checked) =>
                  registerForm.setValue("agreeTerms", checked === true, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <span>Saya menyetujui seluruh Syarat & Ketentuan.</span>
            </label>
            {registerErrors.agreeTerms && (
              <p className="text-sm text-red-300">{registerErrors.agreeTerms.message}</p>
            )}

            <Button className="w-full" type="submit" disabled={registerLoading}>
              {registerLoading ? "Memproses..." : "Daftar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>Syarat & Ketentuan</DialogTitle>
            <DialogDescription>
              Pendaftar wajib membaca dan menyetujui ketentuan berikut.
            </DialogDescription>
          </DialogHeader>

          <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-300">
            {terms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          <Button type="button" onClick={() => setTermsOpen(false)}>
            Saya Mengerti
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}