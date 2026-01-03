import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface QuickSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const QuickSearch = ({ value, onChange, onSubmit }: QuickSearchProps) => (
  <section className="rounded-2xl bg-white/80 p-4 shadow-soft">
    <h3 className="text-sm font-semibold text-ink-800">Busca rápida</h3>
    <div className="mt-3 flex gap-2">
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Buscar por texto" />
      <Button variant="secondary" onClick={onSubmit}>
        Buscar
      </Button>
    </div>
  </section>
);

export default QuickSearch;
