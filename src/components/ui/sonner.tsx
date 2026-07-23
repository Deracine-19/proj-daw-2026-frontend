// src/components/ui/sonner.tsx
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "#0c0c0e",
          "--normal-text": "#fafafa",
          "--normal-border": "#1f1f22",
          "--success-bg": "#0c0c0e",
          "--success-text": "#7fd970",
          "--success-border": "#329e26",
          "--error-bg": "#0c0c0e",
          "--error-text": "#f87171",
          "--error-border": "#3f1d1d",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }