import { useMemo, useState } from "react";
import { useAdminStatus, useAdminUsers, useBlockAdminUser, useDeleteAdminUser, useUnblockAdminUser } from "../features/admin/adminHooks";
import type { AdminUserSummary } from "../features/admin/adminApi";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

const SettingsUsersPage = () => {
  const { data: adminStatus } = useAdminStatus();
  const { data, isLoading, error, refetch } = useAdminUsers();
  const blockUser = useBlockAdminUser();
  const unblockUser = useUnblockAdminUser();
  const deleteUser = useDeleteAdminUser();
  const [filter, setFilter] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUserSummary | null>(null);

  const resetRedirect =
    (import.meta.env.VITE_SUPABASE_RESET_REDIRECT_URL as string | undefined) ??
    `${window.location.origin}/reset-password`;

  const users = data?.users ?? [];
  const filterValue = filter.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    if (!filterValue) return users;
    return users.filter((user) => {
      const email = user.email?.toLowerCase() ?? "";
      return email.includes(filterValue) || user.id.toLowerCase().includes(filterValue);
    });
  }, [filterValue, users]);

  const handleResetEmail = async (email: string | null) => {
    if (!email) return;
    setNotice(null);
    setActionError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirect,
    });
    if (resetError) {
      setActionError(resetError.message);
      return;
    }
    setNotice(`Email de reset enviado para ${email}.`);
  };

  const handleBlockToggle = async (user: AdminUserSummary) => {
    setNotice(null);
    setActionError(null);
    try {
      if (user.is_blocked) {
        await unblockUser.mutateAsync(user.id);
        setNotice(`Usuario ${user.email ?? user.id} desbloqueado.`);
      } else {
        await blockUser.mutateAsync(user.id);
        setNotice(`Usuario ${user.email ?? user.id} bloqueado.`);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao atualizar o usuario.");
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setNotice(null);
    setActionError(null);
    try {
      await deleteUser.mutateAsync(pendingDelete.id);
      setNotice(`Usuario ${pendingDelete.email ?? pendingDelete.id} removido.`);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao remover o usuario.");
    }
  };

  return (
    <div className="px-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Usuarios do sistema</h2>
          <p className="text-sm text-ink-500">
            Gerencie acesso, envio de reset e bloqueio de contas.
          </p>
        </div>
        <Button variant="secondary" onClick={() => refetch()}>
          Atualizar
        </Button>
      </div>

      <div className="mt-4 rounded-2xl bg-white/80 p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            placeholder="Filtrar por email ou id"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <div className="text-xs text-ink-500">Total: {filteredUsers.length}</div>
        </div>

        {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
        {actionError ? <p className="mt-3 text-sm text-red-600">{actionError}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">Falha ao carregar usuarios.</p> : null}

        {isLoading ? (
          <p className="mt-4 text-sm text-ink-500">Carregando usuarios...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">Nenhum usuario encontrado.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-sm">
              <thead className="bg-sand-100 text-ink-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium sm:px-4 sm:py-3">Usuario</th>
                  <th className="px-3 py-2 text-left font-medium sm:px-4 sm:py-3">Status</th>
                  <th className="px-3 py-2 text-left font-medium sm:px-4 sm:py-3">Criado em</th>
                  <th className="px-3 py-2 text-left font-medium sm:px-4 sm:py-3">Ultimo acesso</th>
                  <th className="px-3 py-2 text-right font-medium sm:px-4 sm:py-3">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isSelf = adminStatus?.userId === user.id;
                  const isProtected = isSelf || user.is_admin;
                  return (
                    <tr key={user.id} className="border-t border-sand-100">
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className="font-medium text-ink-900">{user.email ?? "Sem email"}</div>
                        <div className="text-xs text-ink-400">{user.id}</div>
                        {user.is_admin ? (
                          <span className="mt-1 inline-flex rounded-full bg-ink-900 px-2 py-0.5 text-[11px] text-white">
                            Admin
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                            user.is_blocked
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {user.is_blocked ? "Bloqueado" : "Ativo"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-ink-600 sm:px-4 sm:py-3">
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-3 py-2 text-ink-600 sm:px-4 sm:py-3">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-right sm:px-4 sm:py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleResetEmail(user.email)}
                            disabled={!user.email}
                          >
                            Enviar reset
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleBlockToggle(user)}
                            disabled={isProtected || blockUser.isPending || unblockUser.isPending}
                          >
                            {user.is_blocked ? "Desbloquear" : "Bloquear"}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => setPendingDelete(user)}
                            disabled={isProtected || deleteUser.isPending}
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Excluir usuario"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteUser.isPending}>
              Confirmar exclusao
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-ink-600">
          <p>
            Esta acao remove o usuario e todas as transacoes, categorias e contas vinculadas.
          </p>
          <p>
            Usuario selecionado:{" "}
            <span className="font-medium text-ink-900">{pendingDelete?.email ?? pendingDelete?.id}</span>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsUsersPage;
