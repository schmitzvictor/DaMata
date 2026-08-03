import { WHATSAPP_LINK } from "@/lib/site-config";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 rounded-full bg-verde-vivo px-5 py-3.5 text-escuro shadow-[0_10px_26px_rgba(27,27,22,0.3)]"
    >
      <span className="text-[17px]">✉</span>
      <span className="font-ui text-[12.5px] font-bold tracking-wide">
        Fale no WhatsApp
      </span>
    </a>
  );
}
