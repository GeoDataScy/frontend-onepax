export interface BoardingFormData {
  aeronave: string;
  operadorAereo: string;
  icao: string;
  numeroVoo: string;
  dataEmbarque: Date | undefined;
  horaEmbarque: string;
  plataforma: string;
  clienteFinal: string;
  observacoes: string;
}

export interface CatracaState {
  formData: BoardingFormData;
  passageirosEmbarcados: number;
  isEnabled: boolean;
}

export const initialFormData: BoardingFormData = {
  aeronave: "",
  operadorAereo: "",
  icao: "",
  numeroVoo: "",
  dataEmbarque: undefined,
  horaEmbarque: "",
  plataforma: "",
  clienteFinal: "",
  observacoes: "",
};
