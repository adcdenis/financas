import type { Category } from "../types";

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export const buildCategoryTree = (categories: Category[]): CategoryNode[] => {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  categories.forEach((category) => {
    map.set(category.id, { ...category, children: [] });
  });

  categories.forEach((category) => {
    const node = map.get(category.id);
    if (!node) return;

    if (category.parent_id && map.has(category.parent_id)) {
      map.get(category.parent_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const expandCategorySelection = (categories: Category[], selectedIds: string[]) => {
  const map = new Map<string, Category>();
  const childrenMap = new Map<string, string[]>();

  categories.forEach((category) => {
    map.set(category.id, category);
    if (category.parent_id) {
      const list = childrenMap.get(category.parent_id) ?? [];
      list.push(category.id);
      childrenMap.set(category.parent_id, list);
    }
  });

  const expanded = new Set<string>();
  const walk = (id: string) => {
    expanded.add(id);
    const children = childrenMap.get(id) ?? [];
    children.forEach((childId) => walk(childId));
  };

  selectedIds.forEach((id) => walk(id));
  return Array.from(expanded);
};
