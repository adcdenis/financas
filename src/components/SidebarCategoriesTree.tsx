import type { Category } from "../types";
import { Button } from "./ui/Button";
import { Checkbox } from "./ui/Checkbox";
import { buildCategoryTree, type CategoryNode } from "../lib/categoryTree";

interface SidebarCategoriesTreeProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  onCreate: () => void;
}

const SidebarCategoriesTree = ({
  categories,
  selectedIds,
  onToggle,
  onClear,
  onCreate,
}: SidebarCategoriesTreeProps) => {
  const tree = buildCategoryTree(categories);

  const renderNode = (node: CategoryNode, depth = 0) => (
    <div key={node.id} className="space-y-1">
      <div className="flex items-center justify-between text-sm text-ink-700" style={{ paddingLeft: depth * 12 }}>
        <Checkbox
          checked={selectedIds.includes(node.id)}
          onChange={() => onToggle(node.id)}
          label={node.name}
        />
      </div>
      {node.children.length > 0 ? node.children.map((child) => renderNode(child, depth + 1)) : null}
    </div>
  );

  return (
    <section className="rounded-2xl bg-white/80 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-800">Categorias</h3>
        <div className="flex gap-2">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClear}>
            Limpar
          </Button>
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={onCreate}>
            Nova categoria
          </Button>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {tree.length === 0 ? (
          <p className="text-xs text-ink-500">Nenhuma categoria cadastrada.</p>
        ) : (
          tree.map((node) => renderNode(node))
        )}
      </div>
    </section>
  );
};

export default SidebarCategoriesTree;
