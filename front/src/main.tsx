import ReactDOM from "react-dom/client";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import Home from "./Home";
import MyCabinet from "./MyCabinet";
import DrinkSearch from "./DrinkSearch";
import RecipeDetail from "./RecipeDetail";
import AddForms from "./AddForms";
import EditBook from "./EditBook";
import axios from "axios";
axios.defaults.withCredentials = true;

function ProtectedRoute({ user, children }: { user: string | null; children: React.ReactNode }) {
  if (user === undefined) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  let [user, setUser] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    axios
      .get("/api/me")
      .then((res) => setUser(res.data.username))
      .catch(() => setUser(null));
  }, []);

  let handleLogin = (name: string) => setUser(name);

  let handleLogout = async () => {
    await axios.post("/api/logout");
    setUser(null);
  };

  if (user === undefined) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user ?? null} onLogout={handleLogout} />}>
          <Route index element={<Home user={user ?? null} />} />
          <Route path="drinks" element={<DrinkSearch />} />
          <Route path="recipe/:id" element={<RecipeDetail user={user ?? null} />} />
          <Route path="cabinet" element={<MyCabinet user={user ?? null} />} />
          <Route
            path="add"
            element={
              <ProtectedRoute user={user ?? null}>
                <AddForms user={user ?? null} />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit/:id"
            element={
              <ProtectedRoute user={user ?? null}>
                <EditBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="login"
            element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);