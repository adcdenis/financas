import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetRedirect =
    (import.meta.env.VITE_SUPABASE_RESET_REDIRECT_URL as string | undefined) ??
    `${window.location.origin}/reset-password`;
  const confirmRedirect =
    (import.meta.env.VITE_SUPABASE_CONFIRM_REDIRECT_URL as string | undefined) ??
    `${window.location.origin}/app`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [otpExpired, setOtpExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetOnly, setResetOnly] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) {
      return;
    }
    const params = new URLSearchParams(hash);
    if (params.get("error_code") === "otp_expired") {
      setOtpExpired(true);
    }
  }, []);

  useEffect(() => {
    if (location.state && (location.state as { resetSuccess?: boolean }).resetSuccess) {
      setNotice("Senha atualizada com sucesso. Agora voce pode entrar.");
    }
  }, [location.state]);

  const handleAuth = async (mode: "signin" | "signup") => {
    setError(null);
    setNotice(null);
    setResetNotice(null);
    setOtpExpired(false);

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Informe um email valido.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    setLoading(true);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
        : await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: { emailRedirectTo: confirmRedirect },
          });

    setLoading(false);
    if (result.error) {
      if (mode === "signup" && /user\s+already\s+registered|already\s+registered/i.test(result.error.message)) {
        setError("Usuario ja cadastrado.");
      } else {
        setError(result.error.message);
      }
      return;
    }

    if (mode === "signup" && result.data?.user && (result.data.user.identities ?? []).length === 0) {
      setError("Usuario ja cadastrado.");
      return;
    }

    if (mode === "signin") {
      navigate("/app");
      return;
    }

    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMode("signin");
    setNotice("Conta criada. Confirme por email antes do primeiro login.");
  };

  const handleResetPassword = async () => {
    setError(null);
    setNotice(null);
    setResetNotice(null);
    setOtpExpired(false);

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Informe um email valido.");
      return;
    }

    setResetting(true);
    const result = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: resetRedirect,
    });
    setResetting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setResetNotice("Enviamos um email com instrucoes para redefinir a senha.");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setResetOnly(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink-900">Bem-vindo</h1>
        <p className="mt-1 text-sm text-ink-500">
          {mode === "signin"
            ? "Entre com seu email para acessar o painel."
            : "Crie sua conta para acessar o painel."}
        </p>
        <div className="mt-6 space-y-4">
          <label className="space-y-1 text-sm text-ink-700">
            Email
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {resetOnly ? null : (
            <label className="space-y-1 text-sm text-ink-700">
              Senha
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
          )}
          {mode === "signup" && !resetOnly ? (
            <label className="space-y-1 text-sm text-ink-700">
              Confirmar senha
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          ) : null}
        </div>
        {otpExpired ? (
          <div className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p>O link de redefinicao expirou ou e invalido. Reenvie o email para tentar novamente.</p>
            <Button variant="secondary" onClick={handleResetPassword} disabled={resetting || loading}>
              Reenviar email
            </Button>
          </div>
        ) : null}
        {notice ? <p className="mt-4 text-sm text-emerald-700">{notice}</p> : null}
        {resetNotice ? <p className="mt-4 text-sm text-emerald-700">{resetNotice}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <div className="mt-6 flex flex-col gap-2">
          {mode === "signin" ? (
            resetOnly ? (
              <>
                <Button onClick={handleResetPassword} disabled={resetting || loading}>
                  Enviar email troca de senha
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setResetOnly(false);
                    setError(null);
                    setNotice(null);
                    setResetNotice(null);
                  }}
                  disabled={loading}
                >
                  Voltar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => handleAuth("signin")} disabled={loading}>
                  Entrar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setMode("signup");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setError(null);
                    setNotice(null);
                  }}
                  disabled={loading}
                >
                  Criar conta
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setResetOnly(true);
                    setError(null);
                    setNotice(null);
                    setResetNotice(null);
                  }}
                  disabled={resetting || loading}
                  className="text-xs font-medium text-ink-500 hover:text-ink-700"
                >
                  Esqueci a senha
                </Button>
              </>
            )
          ) : (
            <>
              <Button onClick={() => handleAuth("signup")} disabled={loading}>
                Criar conta
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setMode("signin");
                  setConfirmPassword("");
                  setError(null);
                  setNotice(null);
                }}
                disabled={loading}
              >
                Voltar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
