import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import "../styles/Profile.css";
import defaultProfile from "../img/default-profile.png";
import { auth, db, storage } from "../firebase";
import loading1 from "../img/loading-meet-tea.gif";
import pontinhos from "../img/pontinhos.png";
import IconHome from "../img/icon_home.png";
import IconConfig from "../img/icon_config.png";
import IconProfile from "../img/icon_profile.png";

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

export const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mostrarSeguidores, setMostrarSeguidores] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [postToDelete, setPostToDelete] = useState(null);
  const navigate = useNavigate();
  const currentUser = auth.currentUser; // Verificação de autenticação
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    about: "",
  });

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

  const fetchFollowers = async () => {
    if (!currentUser) return;

    try {
      const followersSnapshot = await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("followers")
        .get();

      const followersList = await Promise.all(
        followersSnapshot.docs.map(async (doc) => {
          const followerData = await db.collection("users").doc(doc.id).get();
          return followerData.exists
            ? { id: followerData.id, ...followerData.data() }
            : null;
        })
      );

      const validFollowers = followersList.filter(Boolean); // Remove seguidores nulos
      setFollowers(validFollowers);
    } catch (error) {
      console.error("Erro ao buscar seguidores:", error);
    }
  };

  const userRef = id ? db.collection("users").doc(id) : null;

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

      // Carrega dados dos seguidores
      fetchFollowers();
    }
  }, [id]);

  const openModalToDelete = (post) => {
    setPostToDelete(post);
    setShowModal(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      if (postToDelete.imageUrl) {
        const imageRef = storage.refFromURL(postToDelete.imageUrl);
        await imageRef.delete();
      }

      await db.collection("posts").doc(postToDelete.id).delete();

      setUserPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postToDelete.id)
      );

      console.log("Postagem excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir postagem:", error);
      alert("Erro ao excluir postagem. Tente novamente.");
    } finally {
      setShowModal(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!currentUser) return;

    try {
      const postsSnapshot = await db
        .collection("posts")
        .where("user", "==", currentUser.uid)
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

  useEffect(() => {
    if (followers.length) {
      setFollowersCount(followers.length);
    }
  }, [followers]);

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        try {
          const userDoc = await db
            .collection("users")
            .doc(currentUser.uid)
            .get();
          if (userDoc.exists) {
            setUserData(userDoc.data());
            setFormData({
              displayName: userDoc.data().displayName || "",
              phone: userDoc.data().phone || "",
              about: userDoc.data().about || "",
            });
          } else {
            console.log("Usuário não encontrado no Firestore.");
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
      fetchUserPosts();
      fetchFollowers();
    } else {
      console.log("Usuário não autenticado.");
      setLoading(false);
    }
  }, [currentUser]);

  if (loading)
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

  {
    showChat && (
      <iframe
        src="https://chat-meet-tea-2-0-wm58.vercel.app/?vercelToolbarCode=Com5DEzl90d5zzw"
        style={{ width: "100%", height: "100vh" }}
      />
    );
  }

  return (
    <div className="profile-container">
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

      {userData ? (
        <div className="profile-border">
          <div id="controle-img">
            <div
              id="img-perfil"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                backgroundImage: `url(${
                  userData.profilePhotoURL || defaultProfile
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
          <div className="profile-nome">
            <p id="sobre-nome">Seguidores: {followersCount}</p>
            <p id="sobre-nome1">{userData.displayName}</p>
            <div class="dropdown">
              <button
                id="btn-point-personalizar"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img src={pontinhos} alt={"..."} width="100%" height={"50px"} />
              </button>
              <ul id="personalizar" class="dropdown-menu">
                <li id="li-papai">
                  <button
                    id="btn-personalizar"
                    data-bs-target="#staticBackdrop"
                    onClick={() => {
                      navigate("/configuracoes");
                    }}
                  >
                    Personalizar
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <button
            id="btn-seguidores"
            onClick={() => setMostrarSeguidores(true)}
          >
            Mostrar Seguidores
          </button>
          {mostrarSeguidores && (
            <div className="followers-section">
              {followers.length > 0 ? (
                followers.map((follower) => (
                  <div key={follower.uid} className="follower">
                    <p>{follower.displayName}</p>
                  </div>
                ))
              ) : (
                <p id="no-followers">Você não tem seguidores</p>
              )}
              <button
                id="btn-seguidores"
                onClick={() => setMostrarSeguidores(false)}
              >
                Fechar
              </button>
            </div>
          )}
          <p>
            <br></br>
            <strong id="sobre">Sobre mim:</strong>
          </p>
          <p id="sobre-info">{userData.about}</p>

          <div id="infos">
            <div id="texto1">
              <p>
                <strong>E-mail:</strong>
                <br />
                {userData.email}
              </p>
              <p>
                <strong>Idade:</strong>
                <br />
                {calcularIdade(userData.birthDate)}
              </p>
              <p>
                <strong>Sexo:</strong>
                <br />
                {userData.gender}
              </p>
            </div>
            <div id="texto2">
              <p>
                <strong>Telefone:</strong>
                <br />
                {userData.phone}
              </p>
              <p>
                <strong>Endereço:</strong>
                <br />
                {userData.address}
              </p>
              {userData.fileURL && (
                <div>
                  <p>
                    <strong>Carteira CIPTEA</strong>
                  </p>
                  <a
                    id="ciptea-link"
                    href={userData.fileURL}
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
            <h3>Minhas Postagens</h3>
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id} className="post">
                  <h4>{post.title}</h4>
                  <p>{post.description}</p>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post" width={200} />
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => openModalToDelete(post)}
                  >
                    Excluir
                  </button>
                </div>
              ))
            ) : (
              <p id="no-post">Você ainda não tem posts.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="loading">
          <img
            className="loading"
            src={loading1}
            alt="Xicára com quebra-cabeça balançando como formato de carregamento da página"
            width={650}
            height={900}
          ></img>
        </div>
      )}
      {showModal && (
        <div className="modal-confirmation1">
          <div className="modal-content1">
            <h4>Aceitar que essa publicação será excluída?</h4>
            <h5>
              Você perderá todos os comentários que estão incluídos na
              publicação
            </h5>
            <div className="modal-buttons1">
              <button className="btn-confirm1" onClick={handleDeletePost}>
                Sim
              </button>
              <button
                className="btn-cancel1"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
