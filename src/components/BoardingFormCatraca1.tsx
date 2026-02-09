// src/components/BoardingFormCatraca1.tsx
import { toast } from "sonner";
import { AircraftDataCard } from "./AircraftDataCard";
import { BoardingDataCard } from "./BoardingDataCard";
import { ObservationsCard } from "./ObservationsCard";
import { ControlActionsCard } from "./ControlActionsCard";
import { BoardingFormData, initialFormData } from "@/types/boarding";
import { catraca1Service } from "@/services/catraca1Service";

interface BoardingFormCatraca1Props {
  passageirosEmbarcados: number;
  setPassageirosEmbarcados: (count: number) => void;
  // Novos campos recebidos do Index.tsx para persistÃªncia
  formData: BoardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BoardingFormData>>;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  voosReplicados: boolean;
  setVoosReplicados: (replicado: boolean) => void;
  formDataOutraCatraca: BoardingFormData;
  passageirosOutraCatraca: number;
}

export function BoardingFormCatraca1({
  passageirosEmbarcados,
  setPassageirosEmbarcados,
  formData,
  setFormData,
  isEnabled,
  setIsEnabled,
  voosReplicados,
  setVoosReplicados,
  formDataOutraCatraca,
  passageirosOutraCatraca
}: BoardingFormCatraca1Props) {

  const handleChange = (field: keyof BoardingFormData, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLimpar = () => {
    setFormData(initialFormData);
    console.log("Dados da Catraca 1 limpos!");
  };

  const handleHabilitar = async () => {
    try {
      await catraca1Service.habilitarCatraca();
      setIsEnabled(true);
      console.log("Catraca 1 habilitada!");
    } catch (error) {
      console.error("Erro ao habilitar Catraca 1");
    }
  };

  const handleEncerrar = async () => {
    try {
      await catraca1Service.encerrarVoo();
      setIsEnabled(false);
      console.log("Voo encerrado na Catraca 1!");
    } catch (error) {
      console.error("Erro ao encerrar voo");
    }
  };

  const handleSalvar = async () => {
    try {
      const dataToSave = {
        ...formData,
        passengers_boarded: passageirosEmbarcados,
        catraca_id: '1001' // Identificador da Catraca 1
      };
      await catraca1Service.salvarDados(dataToSave);

      if (voosReplicados) {
        console.log(`âœ… Catraca 1 salva! Aguardando Catraca 2 para consolidar (Total parcial: ${passageirosEmbarcados} passageiros)`);
      } else {
        console.log("Dados salvos com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar dados");
    }
  };

  const handleLiberar = async () => {
    console.info("Aguardando giro físico na Catraca 1...");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AircraftDataCard formData={formData} onChange={handleChange} isCatraca2={false} />
        <BoardingDataCard
          formData={formData}
          onChange={handleChange}
          passageirosEmbarcados={passageirosEmbarcados}
          isCatraca2={false}
        />
      </div>

      <ObservationsCard
        observacoes={formData.observacoes}
        onChange={(value) => handleChange("observacoes", value)}
        isCatraca2={false}
      />

      <ControlActionsCard
        onLimpar={handleLimpar}
        onHabilitar={handleHabilitar}
        onLiberar={handleLiberar}
        onEncerrar={handleEncerrar}
        onSalvar={handleSalvar}
        isEnabled={isEnabled}
        title="Ações de Controle - Catraca 1"
      />
    </div>
  );
}