import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { auth, storage, db } from "../firebase";
import "../styles/Chat.css";
import "@fontsource/poetsen-one";
import "@fontsource/nunito";
import IconHome from "../img/icon_home.png";
import IconConfig from "../img/icon_config.png";
import IconProfile from "../img/icon_profile.png";

const Chat = (props) => {
  const [showChat, setShowChat] = useState(true);
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

  return (
    <div className="container-home">
      <iframe
        id="chat-oficial"
        src="https://chat-meet-tea-2-0-wm58.vercel.app/?vercelToolbarCode=Com5DEzl90d5zzw"
        style={{ width: "70%", height: "100vh" }}
      />
      <div className="sidbar">
        <nav className="nav flex-column">
          <a
            className="nav-link active"
            id="inicio"
            aria-current="page"
            href="./Home"
          >
            <img src={IconHome} width={30} style={{ margin: "0 10px" }} />
            Inicio
          </a>
          <a
            className="nav-link"
            id="perfil"
            onClick={() => navigate("/profile")}
          >
            <img src={IconProfile} width={30} style={{ margin: "0 10px" }} />
            Perfil
          </a>
          <a
            className="nav-link"
            id="config"
            onClick={() => navigate("/configuracoes")}
          >
            <img
              id="icon-config"
              src={IconConfig}
              width={50}
              style={{ margin: "0 0px" }}
            />
            Configurações
          </a>

          <div className="nav-buttons">
            {" "}
            <button id="btn-chat" onClick={() => navigate("/home")}>
              <abbr title="Botão que abre o chat">{showChat ? "Fechar" : "Chat"}</abbr>  
            </button>
            <button id="btn-pub" onClick={() => navigate("/postar")}>
              <abbr title="Botão que abre a tela de postagem">{" "}Postar{" "} </abbr>
            </button>
            <button id="btn-sair" onClick={handleLogout}>
              <abbr title="Botão que desloga o usuário">Sair</abbr>
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
                        <img
                          src={IconHome}
                          width={30}
                          style={{ margin: "0 10px" }}
                        />
                        Inicio
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        className="nav-link"
                        id="perfil"
                        onClick={() => navigate("/profile")}
                      >
                        <img
                          src={IconProfile}
                          width={30}
                          style={{ margin: "0 10px" }}
                        />
                        Perfil
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        className="nav-link"
                        id="config"
                        onClick={() => navigate("/configuracoes")}
                      >
                        <img
                          id="icon-config1"
                          src={IconConfig}
                          width={50}
                          style={{ margin: "0 0px" }}
                        />
                        Configurações
                      </a>
                    </li>
                    <div className="nav-buttons1">
                    <button id="btn-chat" onClick={() => navigate("/home")}>
              <abbr title="Botão que abre o chat">{showChat ? "Fechar" : "Chat"}</abbr>  
            </button>
            <button id="btn-pub" onClick={() => navigate("/postar")}>
              <abbr title="Botão que abre a tela de postagem">{" "}Postar{" "} </abbr>
            </button>
            <button id="btn-sair" onClick={handleLogout}>
              <abbr title="Botão que desloga o usuário">Sair</abbr>
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
