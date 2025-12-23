import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/Button";

const AppLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="text-lg font-semibold text-ink-900">Finanças Desktop</div>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-ink-600">
          <NavLink to="/app" className={({ isActive }) => (isActive ? "text-ink-900" : "")}>
            Dashboard
          </NavLink>
          <NavLink
            to="/app/settings/accounts"
            className={({ isActive }) => (isActive ? "text-ink-900" : "")}
          >
            Contas
          </NavLink>
          <NavLink
            to="/app/settings/categories"
            className={({ isActive }) => (isActive ? "text-ink-900" : "")}
          >
            Categorias
          </NavLink>
          <Button variant="ghost" onClick={handleSignOut}>
            Sair
          </Button>
        </nav>
      </header>
      <Outlet />
    </div>
  );
};

export default AppLayout;



