import React, { useState } from "react";
import { auth, db, storage } from "../firebase.js";
import "../styles/Configuracoes.css";
import defaultProfile from "../img/default-profile.png";
import { useNavigate } from "react-router-dom";
import loading1 from "../img/loading-meet-tea.gif";
import IconHome from "../img/icon_home.png";
import IconConfig from "../img/icon_config.png";
import IconProfile from "../img/icon_profile.png";

const Configuracoes = () => {
  const [userData, setUserData] = useState(null);
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    about: "",
    address: "",
    birthDate: "",
    email: "",
  });

  const checkBanStatus = async () => {
    const authUser = auth.currentUser;
    if (authUser) {
      const userDoc = await db.collection("users").doc(authUser.uid).get();
      if (userDoc.exists && userDoc.data().banned) {
        // toast.error('Sua conta foi banida. Fale com algum ADM.');
        await auth.signOut();
        navigate("/");
      }
    }
  };

  const [showChat, setShowChat] = useState(false);

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

  const user = auth.currentUser;

  React.useEffect(() => {
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
              address: userDoc.data().address || "",
              birthDate: userDoc.data().birthDate || "",
              email: userDoc.data().email || "",
            });
          } else {
            console.log("Usuário não encontrado no Firestore.");
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleFileChange = (event) => {
    setNewProfilePhoto(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!newProfilePhoto) return;

    setUploading(true);
    const uniqueFileName = `${Date.now()}_${newProfilePhoto.name}`;
    const fileRef = storage.ref(`profilePhotos/${user.uid}/${uniqueFileName}`);
    try {
      await fileRef.put(newProfilePhoto);
      const newPhotoURL = await fileRef.getDownloadURL();

      await db.collection("users").doc(user.uid).update({
        profilePhotoURL: newPhotoURL,
      });

      setUserData((prevData) => ({
        ...prevData,
        profilePhotoURL: newPhotoURL,
      }));
      alert("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      alert("Erro ao atualizar a foto de perfil.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await db.collection("users").doc(user.uid).update(formData);
      setUserData((prevData) => ({ ...prevData, ...formData }));
      alert("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      alert("Erro ao atualizar os dados.");
    }
  };
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

          try {
            if (postData.imageUrl) {
              const imageRef = storage.refFromURL(postData.imageUrl);
              await imageRef.delete();
            }

            await db.collection("posts").doc(doc.id).delete();
            console.log(`Post com ID ${doc.id} excluído com sucesso`);
          } catch (error) {
            console.error(`Erro ao excluir o post com ID ${doc.id}:`, error);
          }
        });

        await Promise.all(deletePromises);
        console.log(
          "Todos os posts e imagens associadas foram excluídos com sucesso."
        );

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
            window.location.href = "/";
          });
        }
      }
    }
  };

  const openModalToDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const closeModalDeleteAccount = () => {
    setShowDeleteAccountModal(false);
  };

  if (!userData) {
    return (
      <div className="loading">
        <img
          className="loading"
          src={loading1}
          alt="Xicára com quebra-cabeça balançando como formato de carregamento da página"
          width={500}
          height={900}
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
    <div className="container-conf">
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
                    <button id="btn-chat" onClick={() => navigate("/chat")}>
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
      <div className="configuracoes-container">
        <h4 id="text-info">Configurações de Perfil</h4>
        <div className="profile-photo-update">
          <div id="controle-img">
            <div
              id="img-perfil"
              style={{
                borderRadius: "50%",
                backgroundImage: `url(${
                  userData.profilePhotoURL || defaultProfile
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
          <div className="profile_atualizar">
            <input
              id="bnt-profile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button
              id="btn-atualizar"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Atualizando..." : "Atualizar Foto de Perfil"}
            </button>
          </div>
        </div>

        <div className="edit-profile-form">
          <h5 id="text-info1">Editar Informações</h5>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            placeholder="Nome"
          />
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="E-mail"
          />
          <input
            type="text"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            placeholder="Idade"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Telefone"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Endereço"
          />
          <textarea
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            placeholder="Sobre mim"
          />
          <button id="btn-save" onClick={handleSaveChanges}>
            Salvar Alterações
          </button>
        </div>

        <div className="container-excluir">
          <button id="btn-excluir-conta" onClick={openModalToDeleteAccount}>
            Excluir Conta
          </button>
          {showDeleteAccountModal && (
            <div className="modal-confirmation1">
              <div className="modal-content1">
                <h4 id="confirma-excluir">
                  Antes de excluir sua conta, leia os{" "}
                  <a
                    href="/excluir-conta"
                    onClick={() => navigate("/excluir-conta")}
                  >
                    termos de exclusão de conta
                  </a>
                </h4>
                <div className="modal-buttons1">
                  <button className="btn-confirm" onClick={handleDeleteAccount}>
                    Concordo
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
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
