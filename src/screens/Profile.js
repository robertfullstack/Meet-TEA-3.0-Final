import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase.js'; // Certifique-se de importar o Firebase corretamente
import { useNavigate } from "react-router-dom";
import '../styles/Profile.css';
import defaultProfile from '../img/default-profile.png';


export const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        displayName: '',
        phone: '',
        about: '',
    });
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
    const user = auth.currentUser;

    // Função para calcular a idade com base na data de nascimento
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
        if (user) {
            const fetchUserData = async () => {
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        setUserData(userDoc.data());
                        setFormData({
                            displayName: userDoc.data().displayName || '',
                            phone: userDoc.data().phone || '',
                            about: userDoc.data().about || '',
                        });
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
        
            <div>
                <div id="infos">
                    <div id="texto1">
                        <p><strong>E-mail:</strong><br></br>{userData.email}</p>
                        <p><strong>Idade:</strong> <br></br>{calcularIdade(userData.birthDate)}</p>
                        <p><strong>Sexo:</strong> <br></br>{userData.gender}</p>
                    </div>
                    <div id="texto2">
                        <p><strong>Telefone:</strong> <br></br>{userData.phone}</p>
                        <p><strong>Endereço:</strong> <br></br>{userData.address}</p>
                        {userData.fileURL && (
                            <div>
                                <p><strong>Carteira CIPTEA</strong></p>
                                <a id="ciptea-link" href={userData.fileURL} target="_blank" rel="noopener noreferrer">
                                    Visualizar carteira
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        
    </div>
) : (
    <div>Dados do usuário não encontrados.</div>
)}

        </div>
        </div>
    );
}

export default Profile;
