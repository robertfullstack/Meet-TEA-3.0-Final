import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { auth, storage, db } from '../firebase';
import '../styles/Home.css';
import IconSoloMeetTEA from '../icons/icon-solo-meet-tea.png';
import '@fontsource/poetsen-one';
import '@fontsource/nunito';

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
    const navigate = useNavigate();

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
        // Ativa a visualização dos posts automaticamente ao carregar o componente
        setOpenModalVisualizar(true);
    
        if (openModalVisualizar) {
            db.collection("posts").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
                const postPromises = snapshot.docs.map(async (doc) => {
                    const postData = doc.data();
                    const commentsSnapshot = await db.collection("posts").doc(doc.id).collection("comments").orderBy("timestamp", "asc").get();
                    const comments = commentsSnapshot.docs.map(commentDoc => ({
                        id: commentDoc.id,
                        ...commentDoc.data()
                    }));
                    return {
                        id: doc.id,
                        post: postData,
                        comments: comments
                    };
                });
                Promise.all(postPromises).then(posts => setPosts(posts));
            });
        }
    }, [openModalVisualizar]);

    useEffect(() => {
        if (openModalPerfis) {
            db.collection("users").get().then(snapshot => {
                const profilesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProfiles(profilesData);
                setFilteredProfiles(profilesData); // Inicialmente, todos os perfis são exibidos
            }).catch(error => {
                console.error("Erro ao buscar perfis:", error);
            });
        }

        
    }, [openModalPerfis]);

    useEffect(() => {
        const filtered = profiles.filter(profile => {
            const displayName = profile.displayName || ""; // Protege contra undefined
            const email = profile.email || ""; // Protege contra undefined
    
            const calculateAge = (birthDate) => {
                const birth = new Date(birthDate);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const monthDifference = today.getMonth() - birth.getMonth();
    
                if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
    
                return age;
            };
    
            const age = profile.birthDate ? calculateAge(profile.birthDate) : ""; // Calcula a idade
            const gender = profile.gender || ""; // Protege contra undefined
    
            const matchesNameOrEmail = displayName.toLowerCase().includes(filter.toLowerCase()) ||
                email.toLowerCase().includes(filter.toLowerCase());
    
            const matchesAge = ageFilter ? age.toString().includes(ageFilter) : true;
            const matchesGender = genderFilter ? gender.toLowerCase() === genderFilter.toLowerCase() : true;
    
            return matchesNameOrEmail && matchesAge && matchesGender;
        });
        setFilteredProfiles(filtered);
    }, [filter, ageFilter, genderFilter, profiles]);

    if (!props.user) {
        return <Navigate to="/" />;
    }

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                console.log("Usuário deslogado com sucesso");
                window.location.href = '/';
            })
            .catch((error) => {
                console.error("Erro ao tentar deslogar:", error);
            });
    };

    const handleOpenChat = () => {
        setShowChat(!showChat);
    };

    const handleCommentSubmit = (postId) => {
        if (commentText.trim()) {
            const newComment = {
                text: commentText,
                user: props.user,
                timestamp: new Date(),
            };
    
            // Adiciona o comentário ao Firestore
            db.collection("posts").doc(postId).collection("comments").add(newComment);
    
            // Atualiza o estado local para refletir o novo comentário imediatamente
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? { 
                            ...post,
                            comments: [...post.comments, newComment] 
                          }
                        : post
                )
            );
    
            setCommentText("");
            setCurrentPostId(null);
        }
    };
    

    const handleLike = async (postId, currentLikes) => {
        try {
            await db.collection("posts").doc(postId).update({
                likes: currentLikes + 1
            });
        } catch (error) {
            console.error('Erro ao curtir a publicação:', error);
        }
    }

    const handleProfileClick = (profileId) => {
        navigate(`/profile/${profileId}`);
    }

    return (
        <div className="container-home">
        <div className="sidbar"> 
    <nav className="nav flex-column">
        <a className="nav-link active" id="inicio" aria-current="page" href="./Home">Inicio</a>
        <a className="nav-link" id="perfil" onClick={() => navigate('/profile')}>Perfil</a>
        <a className="nav-link" id="config" onClick={() => navigate('/configuracoes')}>Configurações</a>
        
        <div className="nav-buttons"> {/* Mova os botões para uma nova div */}
            <button  id="btn-chat" onClick={handleOpenChat}>
                {showChat ? 'Fechar' : 'Chat'}
            </button>
            <button  id="btn-pub" onClick={() => navigate ('/postar')}> Postar </button>
            <button  id="btn-sair" onClick={handleLogout}>Sair</button>
        </div>
    </nav>
</div>

         <div className="main2"> 
            <div className="header">
                <h1 className="title">
                    <h1 style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={IconSoloMeetTEA} width={100} style={{ margin: '0 10px' }} />
                        MEET TEA
                        <img style={{ margin: '0 10px' }} src={IconSoloMeetTEA} width={100} />
                    </h1>
                </h1>
            </div>

            <button className="btn-post" onClick={() => setOpenModalPerfis(!openModalPerfis)}>
                {openModalPerfis ? 'Fechar' : 'Buscar'} Perfis
            </button>
           
            {openModalPerfis &&
                <div id="container-perfis" className="modal-perfis">
                    <div className="filter-controls">
                        <label >Filtrar por Nome/Email: </label>
                        <input id="filtro"
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filtrar por Nome ou Email"
                        /> <br></br><br></br>
                           
                        <label >Filtrar por Idade: </label>
                        <input id="filtro"
                            type="text"
                            value={ageFilter}
                            onChange={(e) => setAgeFilter(e.target.value)}
                            placeholder="Filtrar por Idade"
                        /> <br></br><br></br>
                            
                        <label >Filtrar por Sexo: </label>
                        <select id="filtro" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                       </div>

                       {filteredProfiles.map(profile => (
                        <div key={profile.id} className="profile" onClick={() => handleProfileClick(profile.id)}>
                            <p><strong>Nome:</strong> {profile.displayName}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Idade:</strong> {calcularIdade(profile.birthDate)}</p> 
                            <p><strong>Sexo:</strong> {profile.gender}</p>
                        </div>
                    ))}
                    </div>
                  }

            {showChat && <iframe src="https://meet-tea-3db7c.web.app/" style={{ width: '100%', height: '100vh' }} />}

            

            {openModalVisualizar &&
                <div id="container-posts" className="modal-posts">
                    {posts.map((post) => (
                        <div key={post.id} className="post">
                        <h2>{post.post.title}</h2>
                        <img style={{ width: '100%' }} src={post.post.imageUrl} alt={post.post.title} />
                        <p>{post.post.description}</p>
                    
                        <button id="btn-curtir" onClick={() => handleLike(post.id, post.post.likes)}>
                            Curtir ({post.post.likes})
                        </button>
                    
                        {/* Botão comentar sempre visível */}
                        <button id="btn-coment" onClick={() => setCurrentPostId(post.id === currentPostId ? null : post.id)}>
                            {currentPostId === post.id ? 'Comentar' : 'Comentar'}
                        </button>
                    
                        {currentPostId === post.id && (
                            <div className="comment-form">
                                <textarea id="comentario"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Escreva um comentário..."
                                />
                               
                                <div className="button-group">
                                    <button id="btn-coment-enviar" onClick={() => handleCommentSubmit(post.id)}>Enviar</button>
                                    <button id="btn-coment-fechar" onClick={() => setCurrentPostId(null)}>Fechar</button>
                                </div>
                            </div>
                        )}
                    
                        <div className="comments">
                            <h3>Comentários:</h3>
                            {post.comments.map(comment => (
                                <div key={comment.id} className="comment">
                                    <p><strong>{comment.user}:</strong> {comment.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>                
                    ))}
                </div>
            }
        </div>
        </div>
    );

}

export default Home;
