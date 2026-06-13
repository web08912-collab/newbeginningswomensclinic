import { Phone, MessageCircle, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

export function FloatingActions() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      {show && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="grid h-12 w-12 place-items-center rounded-full glass shadow-[var(--shadow-soft)] transition-transform hover:scale-110"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      <a
        href={`https://wa.me/${SITE.whatsapp}`}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        className="grid h-12 w-12 place-items-center rounded-full text-white shadow-[var(--shadow-elegant)] transition-transform hover:scale-110"
        style={{ background: "linear-gradient(135deg, #25D366, #1ebe57)" }}
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <a
        href={`tel:${SITE.phoneRaw}`}
        aria-label="Call now"
        className="grid h-12 w-12 place-items-center rounded-full text-white shadow-[var(--shadow-elegant)] transition-transform hover:scale-110"
        style={{ background: "var(--gradient-cta)" }}
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
