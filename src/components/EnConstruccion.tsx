interface EnConstruccionProps {
  titulo: string;
}

function EnConstruccion({ titulo }: EnConstruccionProps) {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-15 items-center border-b border-line bg-page/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">{titulo}</span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-7 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-line-strong bg-[repeating-linear-gradient(135deg,var(--color-hover)_0_6px,var(--color-surface-sunken)_6px_12px)]">
          <span className="font-mono text-[8px] text-ink-disabled">•••</span>
        </div>
        <p className="m-0 text-sm font-medium text-ink-secondary">Esta sección está en construcción</p>
        <p className="m-0 max-w-xs text-[13px] text-ink-faint">
          {titulo} todavía no está disponible. Vuelve pronto.
        </p>
      </main>
    </>
  );
}

export default EnConstruccion;