import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BoardingFormData } from "@/types/boarding";
import { cn } from "@/lib/utils";

interface AircraftDataCardProps {
  formData: BoardingFormData;
  onChange: (field: keyof BoardingFormData, value: string) => void;
  isCatraca2: boolean;
}

export function AircraftDataCard({ formData, onChange, isCatraca2 }: AircraftDataCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border p-6 card-shadow",
        isCatraca2 ? "bg-card-catraca2" : "bg-card"
      )}
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">
        {isCatraca2 ? "Dados da Aeronave Catraca 2" : "Dados da Aeronave"}
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aeronave">Aeronave</Label>
          <Input
            id="aeronave"
            placeholder="Ex: PT-ABC (5 caracteres)"
            value={formData.aeronave}
            onChange={(e) => onChange("aeronave", e.target.value)}
            maxLength={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operadorAereo">Operador Aéreo</Label>
          <Input
            id="operadorAereo"
            placeholder="Digite o operador aéreo"
            value={formData.operadorAereo}
            onChange={(e) => onChange("operadorAereo", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icao">ICAO</Label>
          <Input
            id="icao"
            placeholder="Digite o código ICAO"
            value={formData.icao}
            onChange={(e) => onChange("icao", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroVoo">Nº do Voo</Label>
          <Input
            id="numeroVoo"
            placeholder="Ex: TAM123"
            value={formData.numeroVoo}
            onChange={(e) => onChange("numeroVoo", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
