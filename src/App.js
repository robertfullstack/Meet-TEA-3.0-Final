import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import LoginRegistro from "./screens/LoginRegistro";
import Home from "./screens/Home";
import Admin from "./screens/Admin";
import Profile from "./screens/Profile.js";
import ProfileOutros from "./screens/ProfileOutros";
import TermosPrivacidade from "./screens/TermosPrivacidade.js";
import Postar from "./screens/Postar.js";
import Configuracoes from "./screens/Configuracoes.js";
import Denuncia from "./screens/Denuncia.js";
import ExcluirConta from "./screens/ExcluirConta.js";
import DenunciaPost from "./screens/DenunciaPost.js";
import Chat from "./screens/Chat.js";
import PostComp from "./screens/PostComp.js";
import ValidarCiptea from "./screens/ValidarCiptea.js";

const App = () => {
  const [user, setUser] = useState();
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }

    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.body.classList.add("dark");
    } else {
      setDarkMode(false);
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode);
      if (newMode) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
      return newMode;
    });
  };

  const aumentarFonte = () => {
    setFontSize((prevSize) => {
      const newSize = prevSize + 2;
      localStorage.setItem("fontSize", newSize);
      return newSize;
    });
  };

  const diminuirFonte = () => {
    setFontSize((prevSize) => {
      const newSize = prevSize > 10 ? prevSize - 2 : prevSize;
      localStorage.setItem("fontSize", newSize);
      return newSize;
    });
  };

  return (
    <div style={{ fontSize: `${fontSize}px` }}>
      <Router>
        <div style={{ position: "fixed", top: 10, right: 10 }}>
          <button
            id="fonte"
            onClick={aumentarFonte}
            style={{ fontSize: "18px", padding: "10px" }}
          >
            A+
          </button>
          <button
            id="fonte"
            onClick={diminuirFonte}
            style={{ fontSize: "18px", padding: "10px" }}
          >
            A-
          </button>
          <button
            className="toggle-button"
            onClick={toggleDarkMode}
            style={{ fontSize: "18px", padding: "10px", marginLeft: "10px" }}
          >
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
        </div>

        <Routes>
          <Route
            path="/"
            element={<LoginRegistro setUser={setUser} user={user} />}
          />
          <Route
            path="/home"
            element={<Home setUser={setUser} user={user} />}
          />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="/profile"
            element={<Profile setUser={setUser} user={user} />}
          />
          <Route
            path="/profile/:id"
            element={<ProfileOutros setUser={setUser} user={user} />}
          />
          <Route path="/termos-privacidade" element={<TermosPrivacidade />} />
          <Route path="/postar" element={<Postar />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/denuncia" element={<Denuncia />} />
          <Route path="/denunciaPost" element={<DenunciaPost />} />
          <Route path="/excluir-conta" element={<ExcluirConta />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/post/:id" element={<PostComp />} />
          <Route path="/validarCiptea" element={<ValidarCiptea />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
