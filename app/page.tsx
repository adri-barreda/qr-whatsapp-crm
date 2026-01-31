import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff4d00]/10 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff4d00]/5 rounded-full blur-3xl" />

      <div className="text-center space-y-8 max-w-lg px-4 relative z-10">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#ff4d00] to-[#ff6b2b] flex items-center justify-center shadow-lg shadow-[#ff4d00]/20">
          <span className="text-white font-black text-3xl">D</span>
        </div>

        <div>
          <h1 className="text-5xl font-black tracking-tight">
            DELITO{" "}
            <span className="bg-gradient-to-r from-[#ff4d00] to-[#ff6b2b] bg-clip-text text-transparent">
              BURGUER
            </span>
          </h1>
          <p className="text-lg text-[#888] mt-2 font-medium">CLUB</p>
        </div>

        <p className="text-[#666] text-lg leading-relaxed">
          CRM inteligente con WhatsApp. Captura contactos, automatiza respuestas con IA y lanza campanas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-[#ff4d00] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#ff6b2b] transition-all shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            Ir al panel
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-8 py-3.5 rounded-xl font-semibold hover:bg-[#25D366]/20 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            </svg>
            WhatsApp
          </a>
        </div>

        <div className="pt-8 flex items-center justify-center gap-6 text-sm text-[#444]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#25D366]" />
            WhatsApp API
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            IA integrada
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff4d00]" />
            CRM
          </div>
        </div>
      </div>
    </div>
  );
}
