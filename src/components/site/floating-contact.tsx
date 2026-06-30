import { MessageCircle, Send } from "lucide-react";

type FloatingContactProps = {
  whatsappUrl?: string | null;
  telegramUrl?: string | null;
};

export function FloatingContact({
  whatsappUrl,
  telegramUrl,
}: FloatingContactProps) {
  if (!whatsappUrl && !telegramUrl) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-emerald-500 text-white shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:bg-emerald-400"
          aria-label="Hubungi via WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
            WhatsApp
          </span>
        </a>
      )}

      {telegramUrl && (
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-sky-500 text-white shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:bg-sky-400"
          aria-label="Hubungi via Telegram"
        >
          <Send className="h-5 w-5" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
            Telegram
          </span>
        </a>
      )}
    </div>
  );
}