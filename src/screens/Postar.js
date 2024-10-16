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

{/* <nav class="navbar bg-body-tertiary fixed-top">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Offcanvas navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Offcanvas</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Dropdown
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </li>
        </ul>
        <form class="d-flex mt-3" role="search">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>
    </div>
  </div>
</nav> */}

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
