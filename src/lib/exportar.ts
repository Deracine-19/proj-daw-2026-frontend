import api from "@/services/api";

function fechaDeHoyISO(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Descarga un CSV autenticado. No se puede usar un simple <a href="..."> porque una navegación
// normal del navegador no manda el Bearer token (ese header solo lo agrega el interceptor de axios
// en api.ts) — hay que pedirlo como blob y disparar la descarga a mano.
export async function descargarCsv(
  url: string,
  params: Record<string, unknown>,
  nombreDato: string
): Promise<void> {
  const { data } = await api.get<Blob>(url, { params, responseType: "blob" });
  const blobUrl = URL.createObjectURL(data);
  const enlace = document.createElement("a");
  enlace.href = blobUrl;
  enlace.download = `${nombreDato}_${fechaDeHoyISO()}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(blobUrl);
}
