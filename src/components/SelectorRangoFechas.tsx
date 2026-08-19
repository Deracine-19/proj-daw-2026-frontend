import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aFechaISO, parseFechaISO, calcularRango, type PresetRango, type RangoFechas } from "@/lib/rangoFechas";

const PRESETS: { valor: PresetRango; label: string }[] = [
  { valor: "hoy", label: "Hoy" },
  { valor: "semana", label: "Esta semana" },
  { valor: "semanaPasada", label: "Semana pasada" },
  { valor: "ultimos30", label: "Últimos 30 días" },
  { valor: "custom", label: "Personalizado" },
];

function formatoFechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${dia} ${meses[mes - 1]} ${anio}`;
}

interface SelectorRangoFechasProps {
  preset: PresetRango;
  rango: RangoFechas;
  onChange: (preset: PresetRango, rango: RangoFechas) => void;
}

function SelectorRangoFechas({ preset, rango, onChange }: SelectorRangoFechasProps) {
  function elegirPreset(valor: PresetRango) {
    if (valor === "custom") {
      onChange("custom", { ...rango }); // deja el rango actual hasta que elijan fechas nuevas
    } else {
      onChange(valor, calcularRango(valor));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={preset} onValueChange={(v) => elegirPreset(v as PresetRango)}>
        <SelectTrigger
          style={{ height: "34px" }}
          className="rounded-lg border-line-strong bg-surface px-3 text-[13px] text-ink-secondary"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.valor} value={p.valor}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-[34px] items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink-secondary hover:bg-hover-strong">
                <CalendarIcon className="h-3.5 w-3.5 text-ink-faint" />
                {formatoFechaCorta(rango.desde)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseFechaISO(rango.desde)}
                onSelect={(fecha) => fecha && onChange("custom", { ...rango, desde: aFechaISO(fecha) })}
              />
            </PopoverContent>
          </Popover>
          <span className="text-ink-ghost">–</span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-[34px] items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink-secondary hover:bg-hover-strong">
                <CalendarIcon className="h-3.5 w-3.5 text-ink-faint" />
                {formatoFechaCorta(rango.hasta)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseFechaISO(rango.hasta)}
                onSelect={(fecha) => fecha && onChange("custom", { ...rango, hasta: aFechaISO(fecha) })}
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}

export default SelectorRangoFechas;
