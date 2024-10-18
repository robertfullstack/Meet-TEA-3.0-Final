import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import defaultProfile from "../img/default-profile.png";
import { auth, db, storage } from "../firebase"; // Certifique-se de importar corretamente seus módulos do Firebase

const calcularIdade = (dataNascimento) => {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  // Verifica se o aniversário ainda não aconteceu neste ano
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
};

export const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
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

  const openModalToDelete = (post) => {
    setPostToDelete(post);
    setShowModal(true);
  };

  const openModalToDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const closeModalDeleteAccount = () => {
    setShowDeleteAccountModal(false);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      const imageRef = storage.refFromURL(postToDelete.imageUrl);
      await imageRef.delete();
      await db.collection("posts").doc(postToDelete.id).delete();
      setUserPosts(userPosts.filter((post) => post.id !== postToDelete.id));
      console.log("Postagem excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir postagem:", error);
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
    } else {
      console.log("Usuário não autenticado.");
      setLoading(false);
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    if (!user) return alert("Nenhum usuário autenticado!");

    const confirmDelete = window.confirm(
      "Tem certeza de que deseja excluir sua conta? Esta ação é irreversível!"
    );

    if (confirmDelete) {
      try {
        const postsSnapshot = await db
          .collection("posts")
          .where("user", "==", user.uid)
          .get();
        const deletePromises = postsSnapshot.docs.map(async (doc) => {
          const postData = doc.data();
          if (postData.imageUrl) {
            const imageRef = storage.refFromURL(postData.imageUrl);
            await imageRef.delete(); // Excluir a imagem do Storage
          }
          await db.collection("posts").doc(doc.id).delete(); // Excluir o post do Firestore
        });

        await Promise.all(deletePromises);
        console.log("Todos os posts do usuário foram excluídos.");

        if (userData.profilePhotoURL) {
          const photoRef = storage.refFromURL(userData.profilePhotoURL);
          await photoRef.delete();
          console.log("Foto de perfil excluída do Storage.");
        }

        await db.collection("users").doc(user.uid).delete();
        console.log("Dados do Firestore excluídos.");

        await user.delete();
        console.log("Conta excluída com sucesso.");

        window.location.href = "/";
      } catch (error) {
        console.error("Erro ao excluir a conta:", error);

        if (error.code === "auth/requires-recent-login") {
          alert(
            "Para segurança, você precisa fazer login novamente antes de excluir sua conta."
          );
          auth.signOut().then(() => {
            window.location.href = "/login";
          });
        }
      }
    }
  };

  if (loading) return <div>Carregando...</div>;

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
              <button id="btn-excluir-conta" onClick={openModalToDeleteAccount}>
                Excluir Conta
              </button>
            </div>
          </div>

          {showDeleteAccountModal && (
            <div className="modal-confirmation">
              <div className="modal-content">
                <h4>
                  Tem certeza de que deseja excluir sua conta? Esta ação é
                  irreversível!
                </h4>
                <div className="modal-buttons">
                  <button className="btn-confirm" onClick={handleDeleteAccount}>
                    Sim
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={closeModalDeleteAccount}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
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
