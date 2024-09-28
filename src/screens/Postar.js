import React, { useState } from "react";
import { auth, storage, db } from '../firebase';
import { useNavigate } from "react-router-dom";
import '../styles/Home.css';
import '@fontsource/nunito';

const Postar = (props) => {
    const [openModalPublicar, setOpenModalPublicar] = useState(true); // Mudar para true para abrir automaticamente
    const [file, setFile] = useState(null);
    const [setProgress] = useState(0);
    const [showChat, setShowChat] = useState(false); 
    const navigate = useNavigate();

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
                        db.collection("posts").add({
                            title: titlePost,
                            description: descricaoPost,
                            imageUrl: url,
                            timestamp: new Date(),
                            user: props.user, // Certifique-se de que props.user está disponível
                            likes: 0,
                        });

                        setProgress(0);
                        setFile(null);
                        setOpenModalPublicar(false); // Fecha a modal após a publicação
                        alert("Postagem criada com sucesso!");
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
                        <button  id="btn-chat" onClick={handleOpenChat}>
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
