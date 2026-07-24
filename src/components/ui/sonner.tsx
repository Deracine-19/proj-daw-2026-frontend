import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "@/context/ThemeContext"

const Toaster = ({ ...props }: ToasterProps) => {
  const { tema } = useTheme()
  return (
    <Sonner
      theme={tema}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-surface)",
          "--normal-text": "var(--color-ink)",
          "--normal-border": "var(--color-line)",
          "--success-bg": "var(--color-surface)",
          "--success-text": "var(--color-positive)",
          "--success-border": "var(--color-brand)",
          "--error-bg": "var(--color-surface)",
          "--error-text": "var(--color-negative)",
          "--error-border": "var(--color-negative-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }