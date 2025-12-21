import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsAccountsPage from "./pages/SettingsAccountsPage";
import SettingsCategoriesPage from "./pages/SettingsCategoriesPage";
import AppLayout from "./pages/AppLayout";

const App = () => {
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<null | boolean>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(Boolean(data.session));
      setSessionReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(Boolean(newSession));
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-600">
        Carregando...
      </div>
    );
  }

  const AuthGate = ({ children }: { children: JSX.Element }) => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <AuthGate>
            <AppLayout />
          </AuthGate>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="settings/accounts" element={<SettingsAccountsPage />} />
        <Route path="settings/categories" element={<SettingsCategoriesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
};

export default App;
