import { Trash2, Power, UserCheck, StopCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlActionsCardProps {
  onLimpar: () => void;
  onHabilitar: () => void;
  onLiberar: () => void;
  onEncerrar: () => void;
  onSalvar: () => void;
  isEnabled: boolean;
  title?: string; // Adicionado como opcional para não quebrar outros componentes
}

export function ControlActionsCard({
  onLimpar,
  onHabilitar,
  onLiberar,
  onEncerrar,
  onSalvar,
  isEnabled,
  title = "Ações de Controle", // Valor padrão caso não seja enviado
}: ControlActionsCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 card-shadow">
      {/* O título agora é dinâmico baseado na prop enviada pelo Form */}
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onLimpar} className="gap-2">
          <Trash2 className="w-4 h-4" />
          Limpar Dados
        </Button>

        <Button 
          onClick={onHabilitar} 
          className={`gap-2 ${isEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          <Power className="w-4 h-4" />
          {isEnabled ? "Catraca Ativa" : "Habilitar Catraca"}
        </Button>

        <Button
          variant="secondary"
          onClick={onLiberar}
          disabled={!isEnabled}
          className="gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Liberar Passageiro
        </Button>

        <Button variant="destructive" onClick={onEncerrar} className="gap-2">
          <StopCircle className="w-4 h-4" />
          Encerrar Voo
        </Button>

        <Button onClick={onSalvar} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>
    </div>
  );
}