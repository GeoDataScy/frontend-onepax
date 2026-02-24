// src/components/DisembarkingFormCatraca3.tsx
import { toast } from "sonner";
import { AircraftDataCard } from "./AircraftDataCard";
import { BoardingDataCard } from "./BoardingDataCard";
import { ObservationsCard } from "./ObservationsCard";
import { ControlActionsCard } from "./ControlActionsCard";
import { BoardingFormData, initialFormData } from "@/types/boarding";
import { catraca3Service } from "@/services/catraca3Service";

interface DisembarkingFormCatraca3Props {
    passageirosDesembarcados: number;
    setPassageirosDesembarcados: (count: number) => void;
    formData: BoardingFormData;
    setFormData: React.Dispatch<React.SetStateAction<BoardingFormData>>;
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
}

export function DisembarkingFormCatraca3({
    passageirosDesembarcados,
    setPassageirosDesembarcados,
    formData,
    setFormData,
    isEnabled,
    setIsEnabled
}: DisembarkingFormCatraca3Props) {

    const handleChange = (field: keyof BoardingFormData, value: string | Date | undefined) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLimpar = () => {
        setFormData(initialFormData);
        console.log("Dados da Catraca 3 limpos!");
    };

    const handleHabilitar = async () => {
        try {
            await catraca3Service.habilitarCatraca();
            setIsEnabled(true);
            console.log("Catraca 3 habilitada!");
        } catch (error) {
            console.error("Erro ao habilitar Catraca 3");
        }
    };

    const handleEncerrar = async () => {
        try {
            await catraca3Service.encerrarVoo();
            setIsEnabled(false);
            console.log("Voo encerrado na Catraca 3!");
        } catch (error) {
            console.error("Erro ao encerrar voo");
        }
    };

    const handleSalvar = async () => {
        try {
            const dataToSave = { ...formData, passengers_boarded: passageirosDesembarcados };
            await catraca3Service.salvarDados(dataToSave);
            console.log("Dados salvos com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar dados");
        }
    };

    const handleLiberar = async () => {
        try {
            await catraca3Service.liberarPassageiro();
            toast.success("Comando enviado para a Catraca 3!");
        } catch (error) {
            toast.error("Falha ao enviar comando para a Catraca 3.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AircraftDataCard formData={formData} onChange={handleChange} isCatraca2={false} />
                <BoardingDataCard
                    formData={formData}
                    onChange={handleChange}
                    passageirosEmbarcados={passageirosDesembarcados}
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
                title="Ações de Controle - Catraca 3"
            />
        </div>
    );
}
