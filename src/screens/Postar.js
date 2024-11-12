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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareLink, setShareLink] = useState("");  // Novo estado para o link de compartilhamento

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
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

  const uploadPost = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    setIsSubmitting(true);
  
    const titlePost = document.getElementById("titlePost").value;
    const descricaoPost = document.getElementById("descricaoPost").value;
  
    if (!file) {
      alert("Selecione um arquivo para upload");
      setIsSubmitting(false);
      return;
    }
  
    if (!currentUser) {
      alert("Usuário não autenticado.");
      setIsSubmitting(false);
      return;
    }
  
    // Busca a URL da foto de perfil do usuário
    let profilePhotoURL = "";
    try {
      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      profilePhotoURL = userDoc.exists ? userDoc.data().profilePhotoURL : null;
    } catch (error) {
      console.error("Erro ao buscar foto de perfil:", error);
      alert("Erro ao buscar foto de perfil do usuário.");
      setIsSubmitting(false);
      return;
    }
  
    const uniqueImageName = crypto.randomUUID();
    const uploadTask = storage.ref(`images/${uniqueImageName}`).put(file);
  
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
        setIsSubmitting(false);
      },
      () => {
        storage
          .ref("images")
          .child(uniqueImageName)
          .getDownloadURL()
          .then((url) => {
            const newPostRef = db.collection("posts").doc();
            newPostRef
              .set({
                id: newPostRef.id,
                title: titlePost,
                description: descricaoPost,
                imageUrl: url,
                timestamp: new Date(),
                user: currentUser.uid,
                postUserName: currentUser.displayName,
                profilePhotoURL: profilePhotoURL, // Adiciona a foto de perfil do usuário ao post
                likes: 0,
                loves: 0,
              })
              .then(() => {
                setProgress(0);
                setFile(null);
                setOpenModalPublicar(false);
                alert("Postagem criada com sucesso!");
  
                // Gera o link para a postagem recém-criada
                const generatedLink = `${window.location.origin}/post/${newPostRef.id}`;
                setShareLink(generatedLink);
  
                navigate("/Home");
              })
              .catch((error) => {
                console.error("Erro ao adicionar documento: ", error);
                alert("Erro ao criar postagem.");
                setIsSubmitting(false);
              });
          })
          .catch((error) => {
            console.error("Erro ao obter URL da imagem:", error);
            alert("Erro ao obter URL da imagem.");
            setIsSubmitting(false);
          });
      }
    );
  };
  

  // Função para copiar o link de compartilhamento
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      alert("Link copiado para a área de transferência!");
    });
  };

  {
    showChat && (
      <iframe
        src="https://chat-meet-tea-2-0-wm58.vercel.app/?vercelToolbarCode=Com5DEzl90d5zzw"
        style={{ width: "100%", height: "100vh" }}
      />
    );
  }

  return (
    <div className="container-Postar">
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
            <button id="btn-chat" onClick={() => navigate("/chat")}>
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
                      <button id="btn-chat" onClick={() => navigate("/chat")}>
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
            <input
              type="file"
              id="imagePost"
              onChange={(e) => setFile(e.target.files[0])}
              placeholder="Image..."
              required
            />

            <label>Descrição</label>
            <textarea
              placeholder="Insira uma descrição para sua publicação..."
              id="descricaoPost"
              required
            ></textarea>
            {shareLink && (
        <div>
          <p>Compartilhe sua postagem com este link:</p>
          <input type="text" value={shareLink} readOnly />
          <button onClick={copyShareLink}>Copiar Link</button>
        </div>
      )}

            <button id="publicar" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar"}
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
