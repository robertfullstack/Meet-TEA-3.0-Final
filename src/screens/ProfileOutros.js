import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import IconHome from "../img/icon_home.png";
import IconConfig from "../img/icon_config.png";
import IconProfile from "../img/icon_profile.png";
import loading1 from "../img/loading-meet-tea.gif";
import defaultProfile from "../img/default-profile.png";

const ProfileOutros = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [reportText, setReportText] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasReported, setHasReported] = useState(false);
  const [openModalVisualizar, setOpenModalVisualizar] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const [followersData, setFollowersData] = useState([]); // Novo estado para armazenar dados dos seguidores
  const [openModalSeguidores, setOpenModalSeguidores] = useState(false); // Estado para abrir o modal

  useEffect(() => {
    if (id) {
      db.collection("users")
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            setUser(doc.data());
            setFollowersCount(doc.data().followersCount || 0);
          } else {
            console.log("Usuário não encontrado");
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar usuário:", error);
        });

      // Verifica se o usuário atual já está seguindo este perfil
      checkIfFollowing();
      // Carrega dados dos seguidores
      fetchFollowers();
    }
  }, [id]);

  const checkIfFollowing = async () => {
    if (auth.currentUser) {
      const currentUser = auth.currentUser.uid;
      const followerDoc = await db
        .collection("users")
        .doc(id)
        .collection("followers")
        .doc(currentUser)
        .get();

      setIsFollowing(followerDoc.exists);
    }
  };

  const fetchFollowers = async () => {
    if (id) {
      try {
        const followersSnapshot = await db
          .collection("users")
          .doc(id)
          .collection("followers")
          .get();

        const followers = await Promise.all(
          followersSnapshot.docs.map(async (doc) => {
            const followerData = await db.collection("users").doc(doc.id).get();
            return followerData.exists
              ? { ...followerData.data(), uid: doc.id } // inclui o ID do seguidor
              : null;
          })
        );

        const validFollowers = followers.filter(Boolean);
        setFollowersData(validFollowers);
      } catch (error) {
        console.error("Erro ao carregar seguidores:", error);
      }
    }
  };

  const handleProfileClick = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  const toggleFollow = async () => {
    if (!auth.currentUser) {
      alert("Você precisa estar logado para seguir usuários.");
      return;
    }

    const currentUser = auth.currentUser.uid;
    const userRef = db.collection("users").doc(id); // O perfil que está sendo seguido
    const followerRef = userRef.collection("followers").doc(currentUser); // O seguidor atual

    try {
      if (isFollowing) {
        // Se já está seguindo, "desseguir"
        await followerRef.delete();
        await userRef.update({
          followersCount: followersCount - 1,
        });
        setFollowersCount(followersCount - 1);
      } else {
        // Caso contrário, "seguir"
        await followerRef.set({
          followedAt: new Date(),
        });
        await userRef.update({
          followersCount: followersCount + 1,
        });
        setFollowersCount(followersCount + 1);
      }

      setIsFollowing(!isFollowing); // Inverte o estado de seguir/desseguir
    } catch (error) {
      console.error("Erro ao seguir/desseguir o usuário:", error);
    }
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

      await db
        .collection("users")
        .doc(id)
        .collection("reports")
        .add({
          emailDenunciante: currentUser.email,
          motivo: reportReason,
          justificativa: reportText || null,
          timestamp: new Date(),
        });

      setSuccessMessage("Denúncia enviada com sucesso.");
      setReportReason("");
      setReportText("");
      setHasReported(true);
      setOpenModalVisualizar(false);
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      setErrorMessage("Erro ao enviar denúncia. Tente novamente mais tarde.");
    }
  };

  if (!user) {
    return (
      <div className="loading">
        <img
          className="loading"
          src={loading1}
          alt="Xicára com quebra-cabeça balançando como formato de carregamento da página"
          width={450}
          height={800}
        />
      </div>
    );
  }

  {
    showChat && (
      <iframe
        src="https://chat-meet-tea-2-0-wm58.vercel.app/?vercelToolbarCode=Com5DEzl90d5zzw"
        style={{ width: "100%", height: "100vh" }}
      />
    );
  }

  return (
    <div className="profile-outros-container">
      <div className="sidbar">
        <nav className="nav flex-column">
          <a
            className="nav-link active"
            id="inicio"
            aria-current="page"
            onClick={() => navigate("/Home")}
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
            <button id="btn-chat" onClick={() => navigate("/chat")}>
              {showChat ? "Fechar" : "Chat"}
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

      <div className="profile-outros-border">
        <div id="controle-img">
          <div
            id="img-perfil"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              backgroundImage: `url(${user.profilePhotoURL || defaultProfile})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
        <div className="info-outros">
          <p>
            <strong>Nome:</strong> {user.displayName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>Seguidores: {followersCount}</p>
          <button onClick={toggleFollow}>
            {isFollowing ? "Deixar de Seguir" : "Seguir"}
          </button>
          <button onClick={() => setOpenModalSeguidores(true)}>
            Ver Seguidores
          </button>
        </div>

        {/* Modal para exibir seguidores */}
        {openModalSeguidores && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Seguidores</h3>
              <button onClick={() => setOpenModalSeguidores(false)}>
                Fechar
              </button>
              <ul>
                {followersData.length > 0 ? (
                  followersData.map((follower, index) => (
                    <li key={index} className="follower-item">
                      <span
                        onClick={() => handleProfileClick(follower.uid)}
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          textDecoration: "underline",
                        }}
                      >
                        {follower.displayName || "Usuário Anônimo"}
                      </span>
                      <li>{follower.id}</li>
                    </li>
                  ))
                ) : (
                  <li>Este usuário ainda não possui seguidores.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <button onClick={() => setOpenModalVisualizar(true)}>
          Denunciar Usuário
        </button>

        {/* Modal de denúncia */}
        {openModalVisualizar && (
          <div className="modal-overlay">
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
                    <option value="conteúdo impróprio">
                      Conteúdo impróprio
                    </option>
                    <option value="discurso de ódio">Discurso de ódio</option>
                    <option value="assédio ou bullying">
                      Assédio ou bullying
                    </option>
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
                  <button onClick={() => setOpenModalVisualizar(false)}>
                    Fechar
                  </button>
                </>
              )}
              {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
              )}
              {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOutros;
