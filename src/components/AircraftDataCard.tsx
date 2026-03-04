import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BoardingFormData } from "@/types/boarding";
import { cn } from "@/lib/utils";
import { aircraftOperatorMap } from "@/data/aircraftOperatorMap";
import { platformIcaoMap } from "@/data/platformIcaoMap";

interface AircraftDataCardProps {
  formData: BoardingFormData;
  onChange: (field: keyof BoardingFormData, value: string) => void;
  isCatraca2: boolean;
}

export function AircraftDataCard({ formData, onChange, isCatraca2 }: AircraftDataCardProps) {
  const matchedOperator = aircraftOperatorMap[formData.aeronave] ?? null;

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
            placeholder=""
            value={formData.aeronave}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().replace(/\s/g, "");
              onChange("aeronave", val);
              const operator = aircraftOperatorMap[val];
              if (operator) {
                onChange("operadorAereo", operator);
              } else {
                onChange("operadorAereo", "");
              }
            }}
            maxLength={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operadorAereo">Operador Aéreo</Label>
          <Select
            value={matchedOperator ?? formData.operadorAereo}
            onValueChange={(value) => onChange("operadorAereo", value)}
            disabled={!!matchedOperator}
          >
            <SelectTrigger id="operadorAereo">
              <SelectValue placeholder="Selecione o operador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Omni Táxi Aéreo">Omni Táxi Aéreo</SelectItem>
              <SelectItem value="Bristow Táxi Aéreo">Bristow Táxi Aéreo</SelectItem>
              <SelectItem value="Líder Táxi Aéreo">Líder Táxi Aéreo</SelectItem>
              <SelectItem value="CHC Táxi Aéreo">CHC Táxi Aéreo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroVoo">Nº do Voo</Label>
          <Input
            id="numeroVoo"
            placeholder=""
            value={formData.numeroVoo}
            onChange={(e) => onChange("numeroVoo", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plataforma">Plataforma</Label>
          <Input
            id="plataforma"
            placeholder="P57"
            value={formData.plataforma}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              onChange("plataforma", val);
              const icao = platformIcaoMap[val];
              if (icao) {
                onChange("icao", icao);
              } else {
                onChange("icao", "");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
