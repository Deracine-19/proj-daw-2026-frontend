// El backend acepta hasta ~3M caracteres de base64 (~2.2 MB reales) — este límite
// del lado del archivo original deja margen de sobra para la inflación del ~33% de base64.
export const IMAGEN_MAX_BYTES = 2_000_000;

export function leerArchivoComoBase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(archivo);
  });
}
