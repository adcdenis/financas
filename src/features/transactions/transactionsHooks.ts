import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransactions,
  deleteTransactions,
  fetchTransactions,
  updateTransaction,
  updateTransactionsCleared,
  type TransactionsFilter,
} from "./transactionsApi";

export const useTransactions = (filters: TransactionsFilter) =>
  useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
  });

export const useCreateTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransactions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
};

export const useUpdateTransactionsCleared = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, cleared }: { ids: string[]; cleared: boolean }) => updateTransactionsCleared(ids, cleared),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
};

export const useDeleteTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransactions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
};
