import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { supabase } from "../lib/supabaseClient";
import { buildCategoryTree } from "../lib/categoryTree";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "../features/categories/categoriesHooks";

const schema = z.object({
  name: z.string().min(2, "Informe o nome"),
  parent_id: z.string().nullable().optional(),
  allowed_type: z.enum(["expense", "income", "both"]),
});

type CategoryForm = z.infer<typeof schema>;

const SettingsCategoriesPage = () => {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [moveToId, setMoveToId] = useState<string | null>(null);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", parent_id: null, allowed_type: "expense" },
  });

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  const openCreate = () => {
    form.reset({ name: "", parent_id: null, allowed_type: "expense" });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    form.reset({ name: category.name, parent_id: category.parent_id ?? null, allowed_type: category.allowed_type });
    setEditingId(id);
    setModalOpen(true);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (editingId) {
      await updateCategory.mutateAsync({
        id: editingId,
        name: values.name,
        parent_id: values.parent_id ?? null,
        allowed_type: values.allowed_type,
      });
    } else {
      await createCategory.mutateAsync({
        name: values.name,
        parent_id: values.parent_id ?? null,
        allowed_type: values.allowed_type,
      });
    }
    setModalOpen(false);
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    if (hasChildren(deleteId)) return;

    if (moveToId) {
      await supabase.from("transactions").update({ category_id: moveToId }).eq("category_id", deleteId);
    }

    await deleteCategory.mutateAsync(deleteId);
    setDeleteId(null);
    setMoveToId(null);
  };

  const hasChildren = (id: string) => categories.some((category) => category.parent_id === id);
  const deleteCategoryName = deleteId ? categories.find((category) => category.id === deleteId)?.name : null;

  const renderNode = (node: (typeof categoryTree)[number], depth = 0) => (
    <div key={node.id} className="space-y-1">
      <div className="flex items-center justify-between" style={{ paddingLeft: depth * 12 }}>
        <div>
          <div className="text-sm font-medium text-ink-900">{node.name}</div>
          <div className="text-xs text-ink-500">Tipo: {node.allowed_type}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openEdit(node.id)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setDeleteId(node.id);
              setMoveToId(null);
            }}
          >
            Remover
          </Button>
        </div>
      </div>
      {node.children.length > 0 ? node.children.map((child) => renderNode(child, depth + 1)) : null}
    </div>
  );

  return (
    <div className="px-6 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">Categorias</h2>
        <Button onClick={openCreate}>Nova categoria</Button>
      </div>
      <div className="mt-4 rounded-2xl bg-white/80 p-4 shadow-soft">
        {categoryTree.length === 0 ? (
          <p className="text-sm text-ink-500">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="space-y-3">{categoryTree.map((node) => renderNode(node))}</div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar categoria" : "Nova categoria"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </>
        }
      >
        <form className="space-y-4">
          <label className="space-y-1 text-sm text-ink-700">
            Nome
            <Input {...form.register("name")} />
          </label>
          <label className="space-y-1 text-sm text-ink-700">
            Categoria pai
            <Select {...form.register("parent_id")}>
              <option value="">Nenhuma</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1 text-sm text-ink-700">
            Tipo permitido
            <Select {...form.register("allowed_type")}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
              <option value="both">Ambos</option>
            </Select>
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Remover categoria"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={Boolean(deleteId && hasChildren(deleteId))}>
              Confirmar remocao
            </Button>
          </>
        }
      >
        {deleteId && hasChildren(deleteId) ? (
          <p className="text-sm text-ink-600">
            Esta categoria possui subcategorias. Remova ou reorganize-as antes de excluir.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ink-600">
              Tem certeza que deseja remover a categoria {deleteCategoryName ? `"${deleteCategoryName}"` : "selecionada"}?
            </p>
            <p className="text-sm text-ink-600">Deseja mover as transacoes para outra categoria?</p>
            <Select value={moveToId ?? ""} onChange={(event) => setMoveToId(event.target.value || null)}>
              <option value="">Nao mover</option>
              {categories
                .filter((category) => category.id !== deleteId)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SettingsCategoriesPage;
