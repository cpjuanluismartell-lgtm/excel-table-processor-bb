
// The structure of the data after parsing the raw paste
export interface RawTransaction {
  id: string;
  fechaMovimiento: string;
  hora: string;
  recibo: string;
  descripcion: string;
  cargos: string;
  abonos: string;
  saldo: string;
}

// The structure of the data after processing and ready for display
export interface ProcessedTransaction {
  id: number;
  fechaMovimiento: string;
  descripcion: string;
  importe: number;
}
