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

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="profile-container">
      <div className="container-home">
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

            <div>
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
                <p>Você ainda não tem posts.</p>
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
    </div>
  );
};

export default Profile;
