import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import {
  blockAdminUser,
  deleteAdminUser,
  fetchAdminStatus,
  fetchAdminUsers,
  type AdminStatus,
  unblockAdminUser,
} from "./adminApi";

export const useAdminStatus = (options?: UseQueryOptions<AdminStatus>) =>
  useQuery({
    queryKey: ["admin-status"],
    queryFn: fetchAdminStatus,
    staleTime: 60_000,
    ...options,
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

export const useBlockAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

export const useUnblockAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unblockAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};
