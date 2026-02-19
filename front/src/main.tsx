import ReactDOM from "react-dom/client";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecipeTable from "./RecipeTable";
import AddForms from "./AddForms";
import EditBook from "./EditBook";
import Layout from "./Layout";
import Login from "./Login";
import DrinkSearch from "./DrinkSearch";
import axios from "axios";
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<RecipeTable currentUser={user} />} />
          <Route path="add" element={<AddForms />} />
          <Route path="edit/:id" element={<EditBook />} />
          <Route path="login" element={<Login onLogin={(name) => setUser(name)} />} />
          <Route path="drinks" element={<DrinkSearch />} />
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