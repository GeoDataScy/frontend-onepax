import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ObservationsCardProps {
  observacoes: string;
  onChange: (value: string) => void;
  isCatraca2: boolean;
}

export function ObservationsCard({ observacoes, onChange, isCatraca2 }: ObservationsCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border p-6 card-shadow",
        isCatraca2 ? "bg-card-catraca2" : "bg-card"
      )}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {isCatraca2 ? "Observações Catraca 2" : "Observações"}
      </h3>

      <div className="space-y-2">
        <Label htmlFor="observacoes" className="sr-only">
          Observações
        </Label>
        <Textarea
          id="observacoes"
          placeholder="Digite qualquer observação sobre o voo..."
          value={observacoes}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px] resize-y"
        />
      </div>
    </div>
  );
}
