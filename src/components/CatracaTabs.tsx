import { cn } from "@/lib/utils";

interface CatracaTabsProps {
  activeCatraca: 1 | 2;
  onTabChange: (catraca: 1 | 2) => void;
}

export function CatracaTabs({ activeCatraca, onTabChange }: CatracaTabsProps) {
  return (
    <div className="inline-flex bg-muted p-1 rounded-lg">
      <button
        onClick={() => onTabChange(1)}
        className={cn(
          "px-6 py-2 text-sm font-medium rounded-md transition-all duration-200",
          activeCatraca === 1
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Catraca 1
      </button>
      <button
        onClick={() => onTabChange(2)}
        className={cn(
          "px-6 py-2 text-sm font-medium rounded-md transition-all duration-200",
          activeCatraca === 2
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Catraca 2
      </button>
    </div>
  );
}
