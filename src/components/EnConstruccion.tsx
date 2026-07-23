interface EnConstruccionProps {
  titulo: string;
}

function EnConstruccion({ titulo }: EnConstruccionProps) {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center border-b border-[#1f1f22] bg-[#09090b]/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">{titulo}</span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-7 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-[#27272a] bg-[repeating-linear-gradient(135deg,#141417_0_6px,#0e0e11_6px_12px)]">
          <span className="font-mono text-[8px] text-[#52525b]">•••</span>
        </div>
        <p className="m-0 text-sm font-medium text-[#e4e4e7]">Esta sección está en construcción</p>
        <p className="m-0 max-w-xs text-[13px] text-[#71717a]">
          {titulo} todavía no está disponible. Vuelve pronto.
        </p>
      </main>
    </>
  );
}

export default EnConstruccion;