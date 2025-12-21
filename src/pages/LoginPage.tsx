import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (mode: "signin" | "signup") => {
    setError(null);
    setLoading(true);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink-900">Bem-vindo</h1>
        <p className="mt-1 text-sm text-ink-500">Entre com seu email para acessar o painel.</p>
        <div className="mt-6 space-y-4">
          <label className="space-y-1 text-sm text-ink-700">
            Email
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-ink-700">
            Senha
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => handleAuth("signin")} disabled={loading}>
            Entrar
          </Button>
          <Button variant="secondary" onClick={() => handleAuth("signup")} disabled={loading}>
            Criar conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
