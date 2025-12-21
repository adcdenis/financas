import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "./ui/Button";

interface MonthNavigatorProps {
  month: Date;
  onChange: (nextMonth: Date) => void;
}

const MonthNavigator = ({ month, onChange }: MonthNavigatorProps) => (
  <div className="flex items-center gap-2">
    <Button variant="ghost" className="px-2" onClick={() => onChange(addMonths(month, -1))}>
      ◀
    </Button>
    <div className="min-w-[160px] text-center text-sm font-semibold text-ink-800">
      {format(month, "MMMM yyyy", { locale: ptBR })}
    </div>
    <Button variant="ghost" className="px-2" onClick={() => onChange(addMonths(month, 1))}>
      ▶
    </Button>
  </div>
);

export default MonthNavigator;
