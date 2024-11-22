import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { auth, storage, db } from "../firebase";
import "../styles/Home.css";
import { ToastContainer, toast } from "react-toastify";
import IconSoloMeetTEA from "../icons/icon-solo-meet-tea.png";
import Heart_puzz from "../img/LogoTEAoutline_heart_puzz1.png";
import Heart_puzz_closed from "../img/LogoTEAoutline_heart_puzz_closed1.png";
import Joia_puzz from "../img/Teacurteecompartilha.png";
import Joia_puzz_closed from "../img/Teacurteecompartilhamandajoia.png";
import pontinhos from "../img/pontinhos.png";
import defaultProfile from "../img/default-profile.png";
import IconHome from "../img/icon_home.png";
import IconConfig from "../img/icon_config.png";
import IconProfile from "../img/icon_profile.png";
import "@fontsource/poetsen-one";
import "@fontsource/nunito";

const Home = (props) => {
  const [openModalVisualizar, setOpenModalVisualizar] = useState(false);
  const [openModalPerfis, setOpenModalPerfis] = useState(false);
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [filter, setFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState(""); // Novo estado para idade
  const [genderFilter, setGenderFilter] = useState(""); // Novo estado para sexo
  const [userReactions, setUserReactions] = useState({});
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();
  const [reportReason, setReportPostReason] = useState("");
  const [reportPostText, setReportPostText] = useState("");
  const [hasReportedPost, setHasReportedPost] = useState(false);
  const [openModalDenuncia, setOpenModalDenuncia] = useState(false);
  const [addressFilter, setAddressFilter] = useState("");


  //calcula a idade com base na data de nascimento
  const calcularIdade = (birthDate) => {
    const hoje = new Date();
    const nascimento = new Date(birthDate);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    // Verifica se o aniversário ainda não aconteceu neste ano
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  };

  useEffect(() => {
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

    checkBanStatus();
  }, []);

  // Função para buscar os usuários seguidos
  const fetchFollowing = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const followingSnapshot = await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("following")
        .get();

      const followingList = followingSnapshot.docs.map((doc) => doc.id);
      setFollowing(followingList);
    }
  };

  // Atualização dos posts com prioridade para os seguidos
  useEffect(() => {
    setOpenModalVisualizar(true);
    // Carrega os usuários seguidos e os posts depois disso
    fetchFollowing().then(() => {
      if (openModalVisualizar) {
        db.collection("posts")
          .orderBy("timestamp", "desc")
          .onSnapshot((snapshot) => {
            const postPromises = snapshot.docs.map(async (doc) => {
              const postData = doc.data();
              const commentsSnapshot = await db
                .collection("posts")
                .doc(doc.id)
                .collection("comments")
                .orderBy("timestamp", "asc")
                .get();
              const comments = commentsSnapshot.docs.map((commentDoc) => ({
                id: commentDoc.id,
                ...commentDoc.data(),
              }));
              return {
                id: doc.id,
                post: postData,
                comments: comments,
              };
            });

            Promise.all(postPromises).then((posts) => {
              // Ordenação: coloca os posts dos seguidos no topo da lista
              const sortedPosts = posts.sort((a, b) => {
                const isAFollowed = following.includes(a.post.userId);
                const isBFollowed = following.includes(b.post.userId);

                if (isAFollowed && !isBFollowed) return -1;
                if (!isAFollowed && isBFollowed) return 1;
                return 0; // Mantém a ordem original entre seguidos
              });
              setPosts(sortedPosts);
            });
          });
      }
    });
  }, [openModalVisualizar]);

  useEffect(() => {
    if (openModalPerfis) {
      db.collection("users")
        .get()
        .then((snapshot) => {
          const profilesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProfiles(profilesData);
          setFilteredProfiles(profilesData);
        })
        .catch((error) => {
          console.error("Erro ao buscar perfis:", error);
        });
    }
  }, [openModalPerfis]);

  useEffect(() => {
    const filtered = profiles.filter((profile) => {
      const displayName = profile.displayName || "";
      const email = profile.email || "";
      const address = profile.address || ""; // Novo campo para endereço

       // Verifica se 'address' é um objeto
    const fullAddress =
    typeof address === "object"
      ? `${address.rua || ""} ${address.cidade || ""} ${address.estado || ""}`
      : address; // Concatena se for um objeto ou usa como string
  
      const calculateAge = (birthDate) => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDifference = today.getMonth() - birth.getMonth();
  
        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birth.getDate())
        ) {
          age--;
        }
  
        return age;
      };
  
      const age = profile.birthDate ? calculateAge(profile.birthDate) : "";
      const gender = profile.gender || "";
  
      const matchesNameOrEmail =
        displayName.toLowerCase().includes(filter.toLowerCase()) ||
        email.toLowerCase().includes(filter.toLowerCase());
  
      const matchesAge = ageFilter ? age.toString().includes(ageFilter) : true;
      const matchesGender = genderFilter
        ? gender.toLowerCase() === genderFilter.toLowerCase()
        : true;
  
        const matchesAddress =
        addressFilter
          ? 
              fullAddress.toLowerCase().includes(addressFilter)
            
          : true;      
  
      return matchesNameOrEmail && matchesAge && matchesGender && matchesAddress;
    });
  
    setFilteredProfiles(filtered);
  }, [filter, ageFilter, genderFilter, addressFilter, profiles]);
  

  if (!props.user) {
    return <Navigate to="/" />;
  }

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

  const handleOpenChat = () => {
    setShowChat(!showChat);
  };

  const handleSharePost = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;

    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        alert("Link copiado para a área de transferência!");
      })
      .catch((error) => {
        console.error("Erro ao copiar o link: ", error);
        alert("Falha ao copiar o link. Tente novamente.");
      });
  };

  const handleCommentSubmit = (postId) => {
    const maxCharacters = 400;
    const offensiveWords = [
      "cu",
      "caralho",
      "ca ralho",
      "ca ra lho",
      "porra",
      "filha da puta", 
      "puta", 
      "pu ta", 
      "buce ta", 
      "bct", 
      "carai", 
      "caraio", 
      "caraleo", 
      "caraliu", 
      "crl", 
      "burro", 
      "idiota", 
      "feio", 
      "energumeno", 
      "rapariga", 
      "filha da" 
    ];
  
    if (!commentText.trim()) {
      alert("O comentário não pode estar vazio.");
      return;
    }
  
    if (commentText.length > maxCharacters) {
      alert(`O comentário não pode exceder ${maxCharacters} caracteres.`);
      return;
    }
  
    const containsOffensiveWords = offensiveWords.some((word) =>
      commentText.toLowerCase().includes(word)
    );
  
    if (containsOffensiveWords) {
      alert("Seu comentário contém palavras ofensivas. Por favor, revise.");
      return;
    }
  
    const newComment = {
      text: commentText,
      user: props.user,
      timestamp: new Date(),
    };
  
    db.collection("posts").doc(postId).collection("comments").add(newComment);
  
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, newComment],
            }
          : post
      )
    );
  
    setCommentText("");
    setCurrentPostId(null);
  };
  

  const handleLike = async (postId, currentLikes) => {
    const userReaction = userReactions[postId];

    const validLikes = currentLikes || 0;

    // Referência do post
    const postRef = db.collection("posts").doc(postId);
    const postSnapshot = await postRef.get();
    const postData = postSnapshot.data();

    const currentLoves = postData.loves || 0;

    if (userReaction === "like") {
      await postRef.update({
        likes: validLikes - 1,
      });
      setUserReactions((prev) => ({ ...prev, [postId]: null }));
    } else {
      const decrementLoves = userReaction === "love" ? 1 : 0;

      await postRef.update({
        likes: validLikes + 1,
        loves: currentLoves - decrementLoves,
      });
      setUserReactions((prev) => ({ ...prev, [postId]: "like" }));
    }
  };

  const handleLove = async (postId, currentLoves) => {
    const userReaction = userReactions[postId];

    const validLoves = currentLoves || 0;

    const postRef = db.collection("posts").doc(postId);
    const postSnapshot = await postRef.get();
    const postData = postSnapshot.data();

    const currentLikes = postData.likes || 0;

    if (userReaction === "love") {
      await postRef.update({
        loves: validLoves - 1,
      });
      setUserReactions((prev) => ({ ...prev, [postId]: null }));
    } else {
      const decrementLikes = userReaction === "like" ? 1 : 0;

      await postRef.update({
        loves: validLoves + 1,
        likes: currentLikes - decrementLikes,
      });
      setUserReactions((prev) => ({ ...prev, [postId]: "love" }));
    }
  };

  const handleProfileClick = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  const handleReportPost = async (postId) => {
    if (!auth.currentUser) {
      alert("Você precisa estar logado para denunciar uma postagem.");
      return;
    }

    if (!reportReason) {
      alert("Por favor, selecione um motivo para a denúncia.");
      return;
    }

    if (hasReportedPost) {
      alert("Você já enviou uma denúncia para esta postagem.");
      return;
    }

    setCurrentPostId(postId);
    try {
      const currentUser = auth.currentUser;

      await db
        .collection("posts")
        .doc(postId)
        .collection("reportsPosts")
        .add({
          emailDenunciante: currentUser.email,
          motivo: reportReason,
          justificativa: reportPostText || null,
          timestamp: new Date(),
        });

      alert("Denúncia de postagem enviada com sucesso.");
      setHasReportedPost(true);
    } catch (error) {
      console.error("Erro ao enviar denúncia de postagem:", error);
      alert("Erro ao enviar denúncia. Tente novamente mais tarde.");
    } finally {
      setOpenModalDenuncia(false);
      setReportPostReason("");
      setReportPostText("");
    }
  };

  return (
    <div className="container-home">
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
      <div className="main2">
        <div className="header">
          <h1 className="title">
            <h1
              style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={IconSoloMeetTEA}
                width={100}
                style={{ margin: "0 10px" }}
              />
              MEET TEA
              <img
                style={{ margin: "0 10px" }}
                src={IconSoloMeetTEA}
                width={100}
              />
            </h1>
          </h1>
        </div>

        <button
          className="btn-post"
          onClick={() => setOpenModalPerfis(!openModalPerfis)}
        >
          {openModalPerfis ? "Fechar" : "Buscar"} Perfis
        </button>

        {openModalPerfis && (
          <div id="container-perfis" className="modal-perfis">
            <div className="filter-controls">
              <label>Filtrar por Nome/Email: </label>
              <input
                id="filtro"
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar por Nome ou Email"
              />{" "}
              <br></br>
              <br></br>
              <label>Filtrar por Idade: </label>
              <input
                id="filtro"
                type="text"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                placeholder="Filtrar por Idade"
              />{" "}
              <br></br>
              <br></br>
              <label>Filtrar por Endereço: </label>
              <input
                id="filtro"
                type="text"
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
                placeholder="Filtrar por Endereço"
              />{" "}
              <br></br>
              <br></br>
              <label>Filtrar por Sexo: </label>
              <select
                id="filtro"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>{" "}
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="profile"
                onClick={() => handleProfileClick(profile.id)}
              >
                <div
                  id="img-perfil"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundImage: `url(${
                      profile.profilePhotoURL || defaultProfile
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <p>
                  <strong>Nome:</strong> {profile.displayName}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Idade:</strong> {calcularIdade(profile.birthDate)}
                </p>
                <p>
                  <strong>Sexo:</strong> {profile.gender}
                </p>
                <p>
                  <strong>Endereço:</strong> {profile.address || null}
                </p>
              </div>
            ))}
          </div>
        )}

        {showChat && (
          <iframe
            src="https://chat-meet-tea-2-0-wm58.vercel.app/?vercelToolbarCode=Com5DEzl90d5zzw"
            style={{ width: "100%", height: "100vh" }}
          />
        )}

        {openModalVisualizar && (
          <div id="container-posts" className="modal-posts">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <div class="dropdown">
                  <button
                    id="btn-point"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={pontinhos}
                      alt={"..."}
                      width="100%"
                      height={"50px"}
                    />
                  </button>
                  <ul id="menu-denuncia" class="dropdown-menu">
                    <li id="li-papai">
                      <button
                        id="btn-denuncia-point"
                        data-bs-toggle="modal"
                        data-bs-target="#staticBackdrop"
                        onClick={() => {
                          setCurrentPostId(post.id);
                          setOpenModalDenuncia(true);
                        }}
                      >
                        Denunciar
                      </button>
                    </li>

                    <li>
                      <button
                        class="dropdown-item"
                        onClick={() => handleSharePost(post.id)}
                      >
                        Compartilhar
                      </button>
                    </li>
                  </ul>
                </div>

                <div
                  className="modal fade"
                  id="staticBackdrop"
                  data-bs-backdrop="static"
                  data-bs-keyboard="false"
                  tabindex="-1"
                  aria-labelledby="staticBackdropLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1
                          className="modal-title fs-5"
                          id="staticBackdropLabel"
                        >
                          Denunciar Post
                        </h1>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          onClick={() => setOpenModalDenuncia(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        {openModalDenuncia && (
                          <div
                            id="container-denuncia"
                            className="modal-denuncia"
                          >
                            <div className="report-controls">
                              <label id="desc-texto">Motivo da Denúncia:</label>{" "}
                              <br></br>
                              <select
                                id="motivo"
                                value={reportReason}
                                onChange={(e) =>
                                  setReportPostReason(e.target.value)
                                }
                                required
                              >
                                <option value="">Selecione um motivo</option>
                                <option value="Spam">Spam</option>
                                <option value="Conteúdo Inapropriado">
                                  Conteúdo Inapropriado
                                </option>
                                <option value="Assédio">Assédio</option>
                                <option value="Fake News">Fake News</option>
                                <option value="Outro">Outro</option>
                              </select>
                              <br />
                              <br />
                              <label id="desc-texto">
                                Descrição (opcional):
                              </label>{" "}
                              <br></br>
                              <textarea
                                id="descricao"
                                value={reportPostText}
                                onChange={(e) =>
                                  setReportPostText(e.target.value)
                                }
                                placeholder="Descreva o motivo da denúncia"
                              ></textarea>
                              <br />
                              <br />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          id="btn-cancel"
                          data-bs-dismiss="modal"
                          onClick={() => setOpenModalDenuncia(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          id="btn-enviar"
                          onClick={() => handleReportPost(currentPostId)}
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <img
                  id="img-profile-post"
                  src={post.post.profilePhotoURL || defaultProfile}
                  alt=""
                  onClick={() => handleProfileClick(post.post.user)}
                />

                <p onClick={() => handleProfileClick(post.post.user)}>
                  {post.post.postUserName}
                </p>

                <h2>{post.post.title}</h2>

                <img
                  style={{ width: "100%" }}
                  src={post.post.imageUrl}
                  alt={post.post.title}
                />

                <p>{post.post.description}</p>

                <button
                  id="btn-curtir"
                  onClick={() => handleLike(post.id, post.post.likes)}
                  style={{
                    color: userReactions[post.id] === "like" ? "blue" : "black",
                  }}
                >
                  <img
                    src={
                      userReactions[post.id] === "like"
                        ? Joia_puzz_closed
                        : Joia_puzz
                    }
                    width={40}
                  />{" "}
                  ({post.post.likes})
                </button>

                <button
                  id="btn-amei"
                  onClick={() => handleLove(post.id, post.post.loves)}
                  style={{
                    color: userReactions[post.id] === "love" ? "red" : "black",
                  }}
                >
                  <img
                    src={
                      userReactions[post.id] === "love"
                        ? Heart_puzz_closed
                        : Heart_puzz
                    }
                    width={40}
                  />{" "}
                  ({post.post.loves})
                </button>

                <button
                  id="btn-coment"
                  onClick={() =>
                    setCurrentPostId(post.id === currentPostId ? null : post.id)
                  }
                >
                  {currentPostId === post.id ? "Comentar" : "Comentar"}
                </button>

                {currentPostId === post.id && (
  <div className="comment-form">
    <textarea
      id="comentario"
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      placeholder="Escreva um comentário..."
      maxLength={400}
    />
    <p>
      Caracteres restantes: {400 - commentText.length}
    </p>

    <div className="button-group">
      <button
        id="btn-coment-enviar"
        onClick={() => handleCommentSubmit(post.id)}
      >
        Enviar
      </button>
      <button
        id="btn-coment-fechar"
        onClick={() => setCurrentPostId(null)}
      >
        Fechar
      </button>
    </div>
  </div>
)}


                <div className="comments">
                  <h3>Comentários:</h3>
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <p>
                        <strong>{comment.user}:</strong> {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
