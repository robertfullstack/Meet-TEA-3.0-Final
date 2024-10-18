import React, { useState, useEffect } from "react";
import { auth, storage, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "@fontsource/nunito";

const Postar = (props) => {
  const [openModalPublicar, setOpenModalPublicar] = useState(true);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800); // Estado para verificar se é mobile

  // useEffect para monitorar o estado de autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800); // Atualiza o estado se for mobile
    };

    window.addEventListener("resize", handleResize); // Listener para o resize da tela

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize); // Cleanup listener
    };
  }, []);

  const handleOpenChat = () => {
    setShowChat(!showChat);
  };

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

  const uploadPost = (e) => {
    e.preventDefault();

    const titlePost = document.getElementById("titlePost").value;
    const descricaoPost = document.getElementById("descricaoPost").value;

    // Verifica se um arquivo foi selecionado
    if (!file) {
      alert("Selecione um arquivo para upload");
      return;
    }

    // Verifica se o usuário está autenticado
    if (!currentUser) {
      alert("Usuário não autenticado.");
      return;
    }

    const uploadTask = storage.ref(`images/${file.name}`).put(file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        console.error("Erro no upload:", error);
        alert(error.message);
      },
      () => {
        storage
          .ref("images")
          .child(file.name)
          .getDownloadURL()
          .then((url) => {
            console.log("Dados do Post:", {
              title: titlePost,
              description: descricaoPost,
              imageUrl: url,
              timestamp: new Date(),
              user: currentUser.uid,
              postUserName: currentUser.displayName,
              likes: 0,
              loves: 0,
            });

            db.collection("posts")
              .add({
                title: titlePost,
                description: descricaoPost,
                imageUrl: url,
                timestamp: new Date(),
                user: currentUser.uid,
                postUserName: currentUser.displayName,
                likes: 0,
                loves: 0,
              })
              .then(() => {
                setProgress(0);
                setFile(null);
                setOpenModalPublicar(false);
                alert("Postagem criada com sucesso!");
              })
              .catch((error) => {
                console.error("Erro ao adicionar documento: ", error);
                alert("Erro ao criar postagem.");
              });
          })
          .catch((error) => {
            console.error("Erro ao obter URL da imagem:", error);
            alert("Erro ao obter URL da imagem.");
          });
      }
    );
  };

  return (
    <div className="container-Postar">
      {/* Sidebar fixa */}
      <div className="sidbar">
        <nav className="nav flex-column navbar-desktop">
          <a
            className="nav-link active"
            id="inicio"
            onClick={() => navigate("/Home")}
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
            <button id="btn-chat" onClick={handleOpenChat}>
              {showChat ? "Fechar" : "Chat"}
            </button>
            <button id="btn-pub" onClick={() => navigate("/postar")}>
              Postar
            </button>
            <button id="btn-sair" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </nav>
      </div>

      {/* Navbar Mobile */}
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
                      <button id="btn-chat" onClick={handleOpenChat}>
                        {showChat ? "Fechar" : "Chat"}
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

      {openModalPublicar && (
        <div id="container-publicar" className="modal-publicar">
          <form onSubmit={uploadPost}>
            <label>Título</label>
            <input
              type="text"
              id="titlePost"
              placeholder="Insira um Título para sua Publicação..."
              required
            />

            <label>Imagem:</label>
            <input type="file" id="imagePost" onChange={(e) => setFile(e.target.files[0])} placeholder="Image..." required />

            <label>Descrição</label>
            <textarea
              placeholder="Insira uma descrição para sua publicação..."
              id="descricaoPost"
              required
            ></textarea>

            <button id="publicar" type="submit">
              Publicar
            </button>
            <button
              id="fechar1"
              type="button"
              onClick={() => setOpenModalPublicar(false)}
            >
              Fechar Publicação
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Postar;
