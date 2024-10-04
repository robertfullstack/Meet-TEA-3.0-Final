import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase.js';
import { useNavigate } from "react-router-dom";
import '../styles/Profile.css';
import defaultProfile from '../img/default-profile.png';

export const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPosts, setUserPosts] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const navigate = useNavigate();
    const user = auth.currentUser;

    const handleOpenChat = () => {
        setShowChat(!showChat);
    };

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

    // Função para abrir o modal de confirmação antes de excluir o post
    const openModalToDelete = (post) => {
        setPostToDelete(post); // Armazenar o post a ser excluído
        setShowModal(true); // Mostrar o modal de confirmação
    };

    // Função para excluir post
    const handleDeletePost = async () => {
        if (!postToDelete) return; // Verifica se há um post selecionado para excluir
        try {
            // Primeiro exclua a imagem associada do armazenamento (opcional)
            const imageRef = storage.refFromURL(postToDelete.imageUrl);
            await imageRef.delete();

            // Em seguida, exclua o post do Firestore
            await db.collection('posts').doc(postToDelete.id).delete();

            // Atualize o estado dos posts para remover o post excluído da lista
            setUserPosts(userPosts.filter(post => post.id !== postToDelete.id));

            console.log('Postagem excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir postagem:', error);
        } finally {
            setShowModal(false); // Fechar o modal após a exclusão
        }
    };

    // Função para buscar os posts do usuário
    const fetchUserPosts = async () => {
        try {
            const postsSnapshot = await db.collection('posts')
                .where('user', '==', user.uid)
                .get();

            const posts = postsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setUserPosts(posts);
        } catch (error) {
            console.error('Erro ao buscar posts do usuário:', error);
        }
    };

    useEffect(() => {
        if (user) {
            const fetchUserData = async () => {
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        setUserData(userDoc.data());
                    } else {
                        console.log('Usuário não encontrado no Firestore.');
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
            fetchUserPosts();
        } else {
            console.log('Usuário não autenticado.');
            setLoading(false);
        }
    }, [user]);

    return (
        <div className="profile-container">
            <div className="container-home">
                <div className="sidbar">
                    <nav className="nav flex-column">
                        <a className="nav-link active" id="inicio" onClick={() => navigate('/Home')}>Inicio</a>
                        <a className="nav-link" id="perfil" onClick={() => navigate('/profile')}>Perfil</a>
                        <a className="nav-link" id="config" onClick={() => navigate('/configuracoes')}>Configurações</a>

                        <div className="nav-buttons">
                            <button id="btn-chat" onClick={handleOpenChat}>
                                {showChat ? 'Fechar' : 'Chat'}
                            </button>
                            <button id="btn-pub" onClick={() => navigate('/postar')}>
                                Postar
                            </button>
                            <button id="btn-sair" onClick={handleLogout}>Sair</button>
                        </div>
                    </nav>
                </div>

                {userData ? (
                    <div>
                        <img
                            id="img-perfil"
                            src={userData.profilePhotoURL || defaultProfile}
                            alt="Foto de Perfil"
                            width={200}
                            height={200}
                        />
                        <p id="sobre-nome">{userData.displayName}</p>
                        <p><strong id="sobre">Sobre mim:</strong>
                            <p id="sobre-info">{userData.about}</p>
                        </p>

                        {/* Exibir posts do usuário */}
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

                {/* Modal de Confirmação */}
                {showModal && (
                    <div className="modal-confirmation">
                        <div className="modal-content">
                            <h4>Aceitar que essa publicação será excluída?</h4>
                            <div className="modal-buttons">
                                <button className="btn-confirm" onClick={handleDeletePost}>Sim</button>
                                <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
