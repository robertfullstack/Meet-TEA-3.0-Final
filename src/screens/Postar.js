import React, { useState, useEffect } from "react"; // useEffect adicionado
import { auth, storage, db } from '../firebase';
import { useNavigate } from "react-router-dom";
import '../styles/Home.css';
import '@fontsource/nunito';

const Postar = (props) => {
    const [openModalPublicar, setOpenModalPublicar] = useState(true); // Mudar para true para abrir automaticamente
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [showChat, setShowChat] = useState(false); 
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null); // Estado para armazenar o usuário atual

    // useEffect para monitorar o estado de autenticação
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

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

    const uploadPost = (e) => {
        e.preventDefault();

        let titlePost = document.getElementById("titlePost").value;
        let descricaoPost = document.getElementById("descricaoPost").value;

        if (!file) {
            alert("Selecione um arquivo para upload");
            return;
        }

        if (!currentUser) { // Verifica se o usuário está autenticado
            alert("Usuário não autenticado.");
            return;
        }

        const uploadTask = storage.ref(`images/${file.name}`).put(file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(progress);
            },
            (error) => {
                console.error("Erro no upload:", error);
                alert(error.message);
            },
            () => {
                storage
                    .ref("images")
                    .child(file.name)
                    .getDownloadURL()
                    .then((url) => {
                        console.log("Dados do Post:", {
                            title: titlePost,
                            description: descricaoPost,
                            imageUrl: url,
                            timestamp: new Date(),
                            user: currentUser.uid, // Utilize UID ou outro identificador
                            likes: 0,
                        });

                        db.collection("posts").add({
                            title: titlePost,
                            description: descricaoPost,
                            imageUrl: url,
                            timestamp: new Date(),
                            user: currentUser.uid, // ou currentUser.email, etc.
                            likes: 0,
                        })
                        .then(() => {
                            setProgress(0);
                            setFile(null);
                            setOpenModalPublicar(false);
                            alert("Postagem criada com sucesso!");
                        })
                        .catch((error) => {
                            console.error("Erro ao adicionar documento: ", error);
                            alert("Erro ao criar postagem.");
                        });
                    })
                    .catch((error) => {
                        console.error("Erro ao obter URL da imagem:", error);
                        alert("Erro ao obter URL da imagem.");
                    });
            }
        );
    };

    return (
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

            {openModalPublicar && (
                <div id="container-publicar" className="modal-publicar">
                    <form onSubmit={uploadPost}>
                        <label>Título</label>
                        <input type="text" id="titlePost" placeholder="Insira um Título para sua Publicação..." required />

                        <label>Imagem:</label>
                        <input type="file" id="imagePost" onChange={(e) => setFile(e.target.files[0])} placeholder="Image..." required />

                        <label>Descrição</label>
                        <textarea placeholder="Insira uma descrição para sua publicação..." id="descricaoPost" required></textarea>

                        <button id="publicar" type="submit">Publicar</button>
                        <button id="fechar1" type="button" onClick={() => setOpenModalPublicar(false)}>Fechar Publicação</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Postar;
