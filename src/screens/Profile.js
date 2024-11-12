import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import defaultProfile from "../img/default-profile.png";
import { auth, db, storage } from "../firebase";

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
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mostrarSeguidores, setMostrarSeguidores] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;
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
    try {
      const followersSnapshot = await db
        .collection("users")
        .doc(user.uid)
        .collection("followers")
        .get();
  
      const followersList = await Promise.all(
        followersSnapshot.docs.map(async (doc) => {
          const followerData = await db.collection("users").doc(doc.id).get();
          return followerData.exists ? { id: followerData.uid, ...followerData.data() } : null;
        })
      );
  
      const validFollowers = followersList.filter(Boolean); // Remove seguidores nulos
      setFollowers(validFollowers);
    } catch (error) {
      console.error("Erro ao buscar seguidores:", error);
    }
  };
  

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

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDoc = await db.collection("users").doc(user.uid).get();
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
  }, [user]);

  if (loading) return <div>Carregando...</div>;

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

      {userData ? (
        <div className="profile-border">
          <img
            id="img-perfil"
            src={userData.profilePhotoURL || defaultProfile}
            alt="Foto de Perfil"
            width={200}
            height={200}
          />
          <p id="sobre-nome">{userData.displayName}</p>
          <p>
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
          <button onClick={() => setMostrarSeguidores(true)}>Seguidores</button>
          {mostrarSeguidores && (
          <div className="followers-section">
            <h3>Seguidores</h3>
            {followers.length > 0 ? (
              followers.map((follower) => (
                <div key={follower.uid} className="follower">
                  <img
                    src={follower.profilePhotoURL || defaultProfile}
                    alt="Seguidor"
                    width={50}
                    height={50}
                  />
                  <p>{follower.displayName}</p>
                </div>
              ))
            ) : (
              <p id="no-followers">Você ainda não tem seguidores.</p>
            )}
            <button onClick={() => setMostrarSeguidores(false)}>Fechar</button>
          </div>
          )};

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
        <div>Dados do usuário não encontrados.</div>
      )}
      {showModal && (
        <div className="modal-confirmation">
          <div className="modal-content">
            <h4>Aceitar que essa publicação será excluída?</h4>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={handleDeletePost}>
                Sim
              </button>
              <button
                className="btn-cancel"
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
