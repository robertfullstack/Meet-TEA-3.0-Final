import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { auth, storage, db } from "../firebase";
import "../styles/Chat.css";
import "@fontsource/poetsen-one";
import "@fontsource/nunito";

const Chat = (props) => {
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        auth
          .signOut()
          .then(() => {
            console.log("Usuário deslogado com sucesso");
            window.location.href = "/";
          })
          .catch((error) => {
            console.error("Erro ao tentar deslogar:", error);
          });
      };
    
      const handleOpenChat = () => {
        setShowChat(!showChat);
      };

      {showChat && (
        <iframe
          src="https://chat-meet-tea-2-0-wm58.vercel.app/?vercelToolbarCode=Com5DEzl90d5zzw"
          style={{ width: "100%", height: "100vh" }}
        />
      )}

      return (
        <div className="container-home">
          <div className="sidbar">
            <nav className="nav flex-column">
              <a
                className="nav-link active"
                id="inicio"
                aria-current="page"
                href="./Home"
              >
                Inicio
              </a>
              <a
                className="nav-link"
                id="perfil"
                onClick={() => navigate("/profile")}
              >
                Perfil
              </a>
              <a
                className="nav-link"
                id="config"
                onClick={() => navigate("/configuracoes")}
              >
                Configurações
              </a>
    
              <div className="nav-buttons">
                {" "}
                {/* Mova os botões para uma nova div */}
                <button id="btn-chat" onClick={() =>navigate("/home")}>
                 Fechar
                </button>
                <button id="btn-pub" onClick={() => navigate("/postar")}>
                  {" "}
                  Postar{" "}
                </button>
                <button id="btn-sair" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            </nav>
          </div>

          <div class="navbar-mobile">
            <nav class="navbar fixed-top">
              <div class="container-fluid">
                <button
                  class="navbar-toggler"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasNavbar"
                  aria-controls="offcanvasNavbar"
                  aria-label="Toggle navigation"
                >
                  <span class="navbar-toggler-icon"></span>
                </button>
                <div
                  class="offcanvas offcanvas-end"
                  tabindex="-1"
                  id="offcanvasNavbar"
                  aria-labelledby="offcanvasNavbarLabel"
                >
                  <div class="offcanvas-header">
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="nav-mob">
                    <div class="offcanvas-body">
                      <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                        <li class="nav-item">
                          <a
                            className="nav-link active"
                            id="inicio"
                            onClick={() => navigate("/Home")}
                          >
                            Inicio
                          </a>
                        </li>
                        <li class="nav-item">
                          <a
                            className="nav-link"
                            id="perfil"
                            onClick={() => navigate("/profile")}
                          >
                            Perfil
                          </a>
                        </li>
                        <li class="nav-item">
                          <a
                            className="nav-link"
                            id="config"
                            onClick={() => navigate("/configuracoes")}
                          >
                            Configurações
                          </a>
                        </li>
                        <div className="nav-buttons1">
                          <button id="btn-chat" onClick={() =>navigate("/home")}>
                            Fechar
                          </button>
                          <button id="btn-pub" onClick={() => navigate("/postar")}>
                            Postar
                          </button>
                          <button id="btn-sair" onClick={handleLogout}>
                            Sair
                          </button>
                        </div>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
     </div>
 );
};

export default Chat;