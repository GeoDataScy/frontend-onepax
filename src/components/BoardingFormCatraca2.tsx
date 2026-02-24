// src/components/BoardingFormCatraca2.tsx
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AircraftDataCard } from "./AircraftDataCard";
import { BoardingDataCard } from "./BoardingDataCard";
import { ObservationsCard } from "./ObservationsCard";
import { ControlActionsCard } from "./ControlActionsCard";
import { BoardingFormData, initialFormData } from "@/types/boarding";
import { catraca2Service } from "@/services/catraca2Service";

interface BoardingFormCatraca2Props {
  passageirosEmbarcados: number;
  setPassageirosEmbarcados: (count: number) => void;
  // Novos campos recebidos do Index.tsx para persistÃªncia
  formData: BoardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BoardingFormData>>;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  voosReplicados: boolean;
  setVoosReplicados: (replicado: boolean) => void;
  formDataCatraca1: BoardingFormData;
  passageirosCatraca1: number;
}

export function BoardingFormCatraca2({
  passageirosEmbarcados,
  setPassageirosEmbarcados,
  formData,
  setFormData,
  isEnabled,
  setIsEnabled,
  voosReplicados,
  setVoosReplicados,
  formDataCatraca1,
  passageirosCatraca1
}: BoardingFormCatraca2Props) {

  const handleChange = (field: keyof BoardingFormData, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReplicarDados = () => {
    // Copiar todos os dados da Catraca 1 para Catraca 2
    setFormData({
      ...formDataCatraca1,
      // NÃ£o copia observaÃ§Ãµes para permitir ediÃ§Ã£o independente
    });
    setVoosReplicados(true);
    console.log("âœ… Dados replicados da Catraca 1! Este voo serÃ¡ consolidado ao salvar.");
  };

  const handleLimpar = () => {
    setFormData(initialFormData);
    setVoosReplicados(false);
    console.log("Dados da Catraca 2 limpos!");
  };

  const handleHabilitar = async () => {
    try {
      await catraca2Service.habilitarCatraca();
      setIsEnabled(true);
      console.log("Catraca 2 habilitada!");
    } catch (error) {
      console.error("Erro ao habilitar Catraca 2");
    }
  };

  const handleEncerrar = async () => {
    try {
      await catraca2Service.encerrarVoo();
      setIsEnabled(false);
      console.log("Voo encerrado na Catraca 2!");
    } catch (error) {
      console.error("Erro ao encerrar voo");
    }
  };

  const handleSalvar = async () => {
    try {
      const dataToSave = {
        ...formData,
        passengers_boarded: passageirosEmbarcados,
        catraca_id: '1002' // Identificador da Catraca 2
      };
      await catraca2Service.salvarDados(dataToSave);

      if (voosReplicados) {
        const totalGeral = passageirosCatraca1 + passageirosEmbarcados;
        console.log(`âœ… Voo consolidado! Total: ${totalGeral} passageiros (Cat1: ${passageirosCatraca1} + Cat2: ${passageirosEmbarcados})`);
        setVoosReplicados(false);
      } else {
        console.log("Dados salvos com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar dados");
    }
  };

  const handleLiberar = async () => {
    try {
      await catraca2Service.liberarPassageiro();
      toast.success("Comando enviado para a Catraca 2 (Horário)!");
    } catch (error) {
      toast.error("Falha ao enviar comando para a Catraca 2.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Botão Replicar Dados */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <Button
          onClick={handleReplicarDados}
          disabled={!formDataCatraca1.numeroVoo || voosReplicados}
          className="w-full"
          variant={voosReplicados ? "outline" : "default"}
        >
          {voosReplicados ? (
            <>✓ Dados Replicados - Voo Vinculado à Catraca 1</>
          ) : (
            <>🔄 Replicar Dados da Catraca 1</>
          )}
        </Button>
        {voosReplicados && (
          <p className="text-sm text-blue-600 mt-2 text-center">
            Este voo será consolidado automaticamente ao salvar
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AircraftDataCard formData={formData} onChange={handleChange} isCatraca2={true} />
        <BoardingDataCard
          formData={formData}
          onChange={handleChange}
          passageirosEmbarcados={passageirosEmbarcados}
          isCatraca2={true}
        />
      </div>

      <ObservationsCard
        observacoes={formData.observacoes}
        onChange={(value) => handleChange("observacoes", value)}
        isCatraca2={true}
      />

      <ControlActionsCard
        onLimpar={handleLimpar}
        onHabilitar={handleHabilitar}
        onLiberar={handleLiberar}
        onEncerrar={handleEncerrar}
        onSalvar={handleSalvar}
        isEnabled={isEnabled}
        title="Ações de Controle - Catraca 2"
      />
    </div>
  );
}