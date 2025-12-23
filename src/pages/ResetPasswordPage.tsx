import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const urlError = useMemo(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    return params.get("error_description");
  }, []);

  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError.replace(/\+/g, " ")));
      setHasSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        setHasSession(false);
        return;
      }
      setHasSession(Boolean(data.session));
    });
  }, [urlError]);

  const handleReset = async () => {
    setError(null);
    setNotice(null);

    if (password !== confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    setLoading(true);
    const result = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setNotice("Senha atualizada com sucesso. Agora voce pode entrar.");
    setPassword("");
    setConfirmPassword("");
    navigate("/login", { state: { resetSuccess: true }, replace: true });
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink-900">Redefinir senha</h1>
        <p className="mt-1 text-sm text-ink-500">Crie uma nova senha para sua conta.</p>
        {hasSession === false ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-ink-600">
              O link de redefinicao e invalido ou expirou. Solicite um novo email.
            </p>
            <Button variant="secondary" onClick={() => navigate("/login")}>
              Voltar para login
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              <label className="space-y-1 text-sm text-ink-700">
                Nova senha
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm text-ink-700">
                Confirmar senha
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
            </div>
            {notice ? <p className="mt-4 text-sm text-emerald-700">{notice}</p> : null}
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={handleReset} disabled={loading}>
                Atualizar senha
              </Button>
              <Button variant="secondary" onClick={() => navigate("/login")} disabled={loading}>
                Voltar para login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
