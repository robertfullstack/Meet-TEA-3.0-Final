import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import IconHome from "../img/icon_home.png";
import IconConfig from "../img/icon_config.png";
import IconProfile from "../img/icon_profile.png";
import loading1 from "../img/loading-meet-tea.gif";
import defaultProfile from "../img/default-profile.png";
import "../styles/Profile.css";

import pontinhos from "../img/pontinhos.png";

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
  const [userPosts, setUserPosts] = useState([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [followersData, setFollowersData] = useState([]);
  const [openModalSeguidores, setOpenModalSeguidores] = useState(false);

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

      checkIfFollowing();
      fetchFollowers();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  };
  const fetchUserPosts = async () => {
    if (!user.uid) return;

    try {
      const postsSnapshot = await db
        .collection("posts")
        .where("user", "==", user.uid)
        .get();

      const posts = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserPosts(posts);
    } catch (error) {
      console.error("Erro ao buscar posts do usuário:", error);
    }
  };
  const checkIfFollowing = async () => {
    if (!auth.currentUser || !id) return;
  
    try {
      const currentUser = auth.currentUser.uid;
      const followerDoc = await db
        .collection("users")
        .doc(id)
        .collection("followers")
        .doc(currentUser)
        .get();
  
      setIsFollowing(followerDoc.exists);
    } catch (error) {
      console.error("Erro ao verificar se está seguindo:", error);
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

  useEffect(() => {
    if (id && currentUser) {
      checkIfFollowing();
    }
  }, [id, currentUser]);
  
  
  
  const toggleFollow = async () => {
    if (!auth.currentUser) {
      alert("Você precisa estar logado para seguir usuários.");
      return;
    }
  
    const currentUser = auth.currentUser.uid;
    const userRef = db.collection("users").doc(id);
    const followerRef = userRef.collection("followers").doc(currentUser);
  
    try {
      if (isFollowing) {
        // Remover seguidor
        await followerRef.delete();
        await userRef.update({
          followersCount: Math.max(0, followersCount - 1), // Evitar valores negativos
        });
        setFollowersCount(Math.max(0, followersCount - 1));
      } else {
        // Adicionar seguidor
        const followerSnapshot = await followerRef.get();
        if (!followerSnapshot.exists) {
          await followerRef.set({
            followedAt: new Date(),
          });
          await userRef.update({
            followersCount: followersCount + 1,
          });
          setFollowersCount(followersCount + 1);
        }
      }
  
      // Atualizar estado local
      setIsFollowing(!isFollowing);
      fetchFollowers();
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

  useEffect(() => {
    const savedReportStatus = localStorage.getItem(`hasReported_${id}`);
    if (savedReportStatus === "true") {
      setHasReported(true);
    }
  }, [id]);
  
  

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
      await db
        .collection("users")
        .doc(id)
        .collection("reports")
        .add({
          emailDenunciante: auth.currentUser.email,
          motivo: reportReason,
          justificativa: reportText || null,
          timestamp: new Date(),
        });
  
      alert("Denúncia enviada com sucesso.");
      setReportReason("");
      setReportText("");
      setHasReported(true);
      setOpenModalVisualizar(false);
  
      // Persistir estado no localStorage
      localStorage.setItem(`hasReported_${id}`, "true");
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
              <abbr title="Botão que abre o chat">
                {showChat ? "Fechar" : "Chat"}
              </abbr>
            </button>
            <button id="btn-pub" onClick={() => navigate("/postar")}>
              <abbr title="Botão que abre a tela de postagem"> Postar </abbr>
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
                      <button id="btn-chat" onClick={() => navigate("/chat")}>
                        <abbr title="Botão que abre o chat">
                          {showChat ? "Fechar" : "Chat"}
                        </abbr>
                      </button>
                      <button id="btn-pub" onClick={() => navigate("/postar")}>
                        <abbr title="Botão que abre a tela de postagem">
                          {" "}
                          Postar{" "}
                        </abbr>
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

      <div className="profile-outros-border">
        <div id="controle-img">
          <div
            id="img-perfil"
            style={{
              borderRadius: "50%",
              backgroundImage: `url(${user.profilePhotoURL || defaultProfile})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div id="pontinhos-followers">
          <button
            id="btn-seguir-outros"
            className={isFollowing ? "btn-unfollow" : "btn-follow"}
            onClick={toggleFollow}
          >
            {isFollowing ? "Deixar de Seguir" : "Seguir"}
          </button>
          <p id="sobre-nome1">{user.displayName}</p>
          <button
            id="btn-point-denunciar"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src={pontinhos}
              alt="Imagem com 3 pontos horizontais que levam para a seção denunciar"
              height="50px"
            />
          </button>
          <ul id="denuncia" class="dropdown-menu">
            <li id="li-papai">
              <button
                id="btn-personalizar"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#reportModal"
              >
                Denunciar
              </button>
            </li>
          </ul>
        </div>

        <p>
          <br></br>
          <strong id="sobre">Sobre mim:</strong>
        </p>
        <p id="sobre-info">{user.about}</p>
        <p id="seguidores">Seguidores: {followersCount}</p>

        <button
          id="btn-seguidores"
          onClick={() => setOpenModalSeguidores(true)}
        >
          Ver Seguidores
        </button>
        {openModalSeguidores && (
          <div className="modal-overlay">
            <div className="followers-section">
              <ul id="span-followers">
                {followersData.length > 0 ? (
                  followersData.map((follower, index) => (
                    <p key={index} className="follower-item">
                      <span
                        onClick={() => handleProfileClick(follower.uid)}
                        style={{
                          cursor: "pointer",
                          textDecoration: "none",
                        }}
                      >
                        {follower.displayName || "Usuário Anônimo"}
                      </span>
                      <p>{follower.id}</p>
                    </p>
                  ))
                ) : (
                  <li>Este usuário ainda não possui seguidores.</li>
                )}
              </ul>
              <button
                id="btn-seguidores"
                onClick={() => setOpenModalSeguidores(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
        <div></div>
        <br></br>
        <div id="infos">
          <div id="texto1">
            <p>
              <strong>E-mail:</strong>
              <br />
              {user.email}
            </p>
            <p>
              <strong>Idade:</strong>
              <br />
              {calcularIdade(user.birthDate)}
            </p>
            <p>
              <strong>Sexo:</strong>
              <br />
              {user.gender}
            </p>
          </div>
          <div id="texto2">
            <p>
              <strong>Telefone:</strong>
              <br />
              {user.phone}
            </p>
            <p>
              <strong>Endereço:</strong>
              <br />
              {user.address}
            </p>
            {user.fileURL && (
              <div>
                <p>
                  <strong>Carteira CIPTEA</strong>
                </p>
                <a
                  id="ciptea-link"
                  href={user.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visualizar carteira
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="profile-post">
          <h3>Postagens de {user.displayName}</h3>
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id} className="post">
                <h4>{post.title}</h4>
                <p>{post.description}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" width={200} />
                )}
              </div>
            ))
          ) : (
            <p id="no-post">Ainda não possui posts.</p>
          )}
        </div>
      </div>

      <div
        className="modal fade"
        id="reportModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="reportModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div id="modal-content-denuncia" className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="reportModalLabel">
                Denunciar Usuário
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {hasReported ? (
                <p style={{ color: "red" }}>
                  Você já enviou uma denúncia para este usuário.
                </p>
              ) : (
                <>
                  <label htmlFor="reportReason">Motivo da denúncia:</label>
                  <select
                    id="motivo-denuncia"
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
                    id="motivo-denuncia"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Escreva uma justificativa para a denúncia (opcional)"
                    rows="5"
                    cols="50"
                    style={{ width: "100%", marginBottom: "10px" }}
                  ></textarea>
                </>
              )}
              {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            </div>
            <div className="modal-footer">
              {!hasReported && (
                <>
                  <button
                    className="btn-enviar-denuncia-outros"
                    onClick={handleReport}
                  >
                    Enviar Denúncia
                  </button>
                </>
              )}
              <button
                className="btn-fechar-denuncia-outros"
                data-bs-dismiss="modal"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOutros;
