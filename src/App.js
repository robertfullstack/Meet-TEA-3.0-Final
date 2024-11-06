import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import LoginRegistro from "./screens/LoginRegistro";
import Home from './screens/Home';
import Admin from './screens/Admin';
import Profile from './screens/Profile.js';
import ProfileOutros from './screens/ProfileOutros';
import TermosPrivacidade from './screens/TermosPrivacidade.js';
import Postar from './screens/Postar.js';
import Configuracoes from './screens/Configuracoes.js';
import Denuncia from './screens/Denuncia.js';
import ExcluirConta from './screens/ExcluirConta.js';
import DenunciaPost from './screens/DenunciaPost.js';

const App = () => {
  const [user, setUser] = useState();
  const [fontSize, setFontSize] = useState(16); // Tamanho de fonte padrão de 16px

  // Carrega o tamanho da fonte do localStorage quando o componente é montado
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize)); // Converte de string para número
    }
  }, []);

  // Função para aumentar o tamanho da fonte e salvar no localStorage
  const aumentarFonte = () => {
    setFontSize((prevSize) => {
      const newSize = prevSize + 2;
      localStorage.setItem('fontSize', newSize); // Salva no localStorage
      return newSize;
    });
  };

  // Função para diminuir o tamanho da fonte e salvar no localStorage
  const diminuirFonte = () => {
    setFontSize((prevSize) => {
      const newSize = prevSize > 10 ? prevSize - 2 : prevSize;
      localStorage.setItem('fontSize', newSize); // Salva no localStorage
      return newSize;
    });
  };

  return (
    <div style={{ fontSize: `${fontSize}px` }}> {/* Aplica o tamanho da fonte dinamicamente */}
      <Router>
        <div style={{ position: 'fixed', top: 10, right: 10 }}>
          <button id="fonte" onClick={aumentarFonte} style={{ fontSize: '18px', padding: '10px' }}>
            A+
          </button>
          <button id="fonte" onClick={diminuirFonte} style={{ fontSize: '18px', padding: '10px' }}>
            A-
          </button>
        </div>

        <Routes>
          <Route path="/" element={<LoginRegistro setUser={setUser} user={user} />} />
          <Route path="/home" element={<Home setUser={setUser} user={user} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile setUser={setUser} user={user} />} />
          <Route path="/profile/:id" element={<ProfileOutros setUser={setUser} user={user} />} />
          <Route path="/termos-privacidade" element={<TermosPrivacidade/>} />
          <Route path="/postar" element={<Postar/>}/>
          <Route path="/configuracoes" element={<Configuracoes/>}/>
          <Route path="/denuncia" element={<Denuncia/>}/>
          <Route path="/denunciaPost" element={<DenunciaPost/>}/>
          <Route path="/excluir-conta" element={<ExcluirConta/>}/>
        </Routes>
      </Router>
    </div>
  );
};

export default App;






// CASO PRECISE DO ANTIGO CODE.....:
// import { React, useEffect, useState } from "react";
// import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";

// import LoginRegistro from "./screens/LoginRegistro";
// import Home from './screens/Home';
// import Admin from './screens/Admin';

// const App = () => {
//   const [user, setUser] = useState();


//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginRegistro setUser={setUser} user={user} />} />
//         <Route path="/home" element={<Home setUser={setUser} user={user} />} />
//         <Route path="/admin" element={<Admin />} />
//       </Routes>
//     </Router>
//   )
// }


// export default App;
