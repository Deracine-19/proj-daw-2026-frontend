export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ParametrosPaginacion {
  page: number;
  pageSize: number;
  busqueda?: string;
  ordenarPor?: string;
  ordenDireccion?: "asc" | "desc";
}
