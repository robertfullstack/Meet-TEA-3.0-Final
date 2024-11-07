import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth, storage} from "../firebase"; // Ajuste o caminho conforme necessário
import { useNavigate } from "react-router-dom";

const ProfileOutros = () => {
  const { id } = useParams(); // Obtém o ID da URL
  const [user, setUser] = useState(null);
  const [reportText, setReportText] = useState(""); // Campo opcional para justificar a denúncia
  const [reportReason, setReportReason] = useState(""); // Campo para selecionar o motivo da denúncia
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasReported, setHasReported] = useState(false); // Novo estado para controlar se o usuário já denunciou
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (id) {
      db.collection("users")
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            setUser(doc.data());
          } else {
            console.log("Usuário não encontrado");
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar usuário:", error);
        });
    }

    // Verificar se o usuário logado já fez uma denúncia
    const checkIfAlreadyReported = async () => {
      if (auth.currentUser) {
        const currentUser = auth.currentUser;
        const reportsSnapshot = await db
          .collection("users")
          .doc(id)
          .collection("reports")
          .where("emailDenunciante", "==", currentUser.email)
          .get();

        if (!reportsSnapshot.empty) {
          setHasReported(true);
        }
      }
    };

    checkIfAlreadyReported();
  }, [id]);

  // Função para enviar a denúncia
  const handleReport = async () => {
    if (!auth.currentUser) {
      setErrorMessage("Você precisa estar logado para denunciar.");
      return;
    }

    if (reportReason === "") {
      setErrorMessage("Por favor, selecione um motivo para a denúncia.");
      return;
    }

    if (hasReported) {
      setErrorMessage("Você já enviou uma denúncia para este usuário.");
      return;
    }

    try {
      const currentUser = auth.currentUser;

      // Adiciona uma denúncia na subcoleção "reports" do usuário denunciado
      await db
        .collection("users")
        .doc(id)
        .collection("reports")
        .add({
          emailDenunciante: currentUser.email, // Email de quem está denunciando
          motivo: reportReason, // Motivo da denúncia
          justificativa: reportText || null, // Justificativa opcional da denúncia
          timestamp: new Date(), // Data da denúncia
        });

      setSuccessMessage("Denúncia enviada com sucesso.");
      setReportReason(""); // Limpa o motivo após enviar
      setReportText(""); // Limpa o campo de justificativa após enviar
      setHasReported(true); // Define que o usuário já denunciou
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      setErrorMessage("Erro ao enviar denúncia. Tente novamente mais tarde.");
    }
  };

  if (!user) {
    return <div>Carregando informações do usuário...</div>;
  }

  {showChat && (
    <iframe
      src="https://chat-meet-tea-2-0-wm58.vercel.app/?vercelToolbarCode=Com5DEzl90d5zzw"
      style={{ width: "100%", height: "100vh" }}
    />
  )}
  
  return (
    <div className="profile-outros-container">
      <div className="sidbar">
        <nav className="nav flex-column">
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

      <div className="profile-outros-border">
        {user.profilePhotoURL && (
          <div style={{ marginBottom: "20px" }}>
            <img
              id="profile-other-icon"
              src={user.profilePhotoURL}
              alt={user.name}
              style={{ width: "150px", height: "150px", borderRadius: "50%" }}
            />
          </div>
        )}
        <div className="info-outros">
          <p>
            <strong>Nome:</strong> {user.displayName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        {/* Formulário para justificar a denúncia */}
        <div className="ban-form" style={{ marginTop: "20px" }}>
          <h3>Denunciar Usuário</h3>
          {hasReported ? (
            <p style={{ color: "red" }}>
              Você já enviou uma denúncia para este usuário.
            </p>
          ) : (
            <>
              <label htmlFor="reportReason">Motivo da denúncia:</label>
              <select
                id="reportReason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
                required
              >
                <option value="">Selecione um motivo</option>
                <option value="conteúdo impróprio">Conteúdo impróprio</option>
                <option value="discurso de ódio">Discurso de ódio</option>
                <option value="assédio ou bullying">Assédio ou bullying</option>
                <option value="spam ou fraude">Spam ou fraude</option>
                <option value="falsidade ideológica">
                  Falsidade ideológica
                </option>
              </select>

              <label htmlFor="reportText">Justificativa (opcional):</label>
              <textarea
                id="reportText"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Escreva uma justificativa para a denúncia (opcional)"
                rows="5"
                cols="50"
                style={{ width: "100%", marginBottom: "10px" }}
              ></textarea>

              <button onClick={handleReport}>Enviar Denúncia</button>
            </>
          )}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileOutros;
