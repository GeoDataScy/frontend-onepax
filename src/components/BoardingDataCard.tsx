import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BoardingFormData } from "@/types/boarding";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BoardingDataCardProps {
  formData: BoardingFormData;
  onChange: (field: keyof BoardingFormData, value: string | Date | undefined) => void;
  passageirosEmbarcados: number;
  isCatraca2: boolean;
}

const clientesFinais = [
  { value: "cliente1", label: "Cliente A" },
  { value: "cliente2", label: "Cliente B" },
  { value: "cliente3", label: "Cliente C" },
  { value: "cliente4", label: "Operador Logístico D" },
];

export function BoardingDataCard({
  formData,
  onChange,
  passageirosEmbarcados,
  isCatraca2,
}: BoardingDataCardProps) {
  const [dateOpen, setDateOpen] = useState(false);

  const handleTodayClick = () => {
    onChange("dataEmbarque", new Date());
  };

  const handleNowClick = () => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    onChange("horaEmbarque", timeString);
  };

  return (
    <div className="relative">
      <Badge className={cn(
        "absolute -top-3 right-0 px-4 py-1.5 rounded-full text-sm font-medium",
        isCatraca2 ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
      )}>
        Passageiros Embarcados: {passageirosEmbarcados}
      </Badge>

      <div
        className={cn(
          "rounded-lg border border-border p-6 card-shadow",
          isCatraca2 ? "bg-card-catraca2" : "bg-card"
        )}
      >
        <h3 className="text-lg font-semibold text-foreground mb-6">
          {isCatraca2 ? "Dados do Embarque Catraca 2" : "Dados do Embarque"}
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Data de Embarque</Label>
            <div className="flex gap-2">
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !formData.dataEmbarque && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataEmbarque
                      ? format(formData.dataEmbarque, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dataEmbarque}
                    onSelect={(date) => {
                      onChange("dataEmbarque", date);
                      setDateOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="secondary"
                onClick={handleTodayClick}
                className="shrink-0"
              >
                Hoje
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hora do Embarque</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={formData.horaEmbarque}
                  onChange={(e) => onChange("horaEmbarque", e.target.value)}
                  placeholder="--:--"
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleNowClick}
                className="shrink-0"
              >
                Agora
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plataforma">Plataforma</Label>
            <Input
              id="plataforma"
              placeholder="Ex: P-01"
              value={formData.plataforma}
              onChange={(e) => onChange("plataforma", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Cliente Final</Label>
            <Select
              value={formData.clienteFinal}
              onValueChange={(value) => onChange("clienteFinal", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientesFinais.map((cliente) => (
                  <SelectItem key={cliente.value} value={cliente.value}>
                    {cliente.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
