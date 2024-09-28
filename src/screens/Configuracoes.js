import React, { useState } from 'react';
import { auth, db, storage } from '../firebase.js';
import '../styles/Configuracoes.css'; 
import defaultProfile from '../img/default-profile.png';
import { useNavigate } from "react-router-dom";

const Configuracoes = () => {
    const [userData, setUserData] = useState(null);
    const [newProfilePhoto, setNewProfilePhoto] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        displayName: '',
        phone: '',
        about: '',
        address: '',
        birthDate: '',
        email: '',

    });
    const [showChat, setShowChat] = useState(false); 

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

    React.useEffect(() => {
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
                            address: userDoc.data().address || '',
                            birthDate: userDoc.data().birthDate || '',
                            email: userDoc.data().email || '',
                        });
                    } else {
                        console.log('Usuário não encontrado no Firestore.');
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
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

            await db.collection('users').doc(user.uid).update({
                profilePhotoURL: newPhotoURL
            });

            setUserData(prevData => ({ ...prevData, profilePhotoURL: newPhotoURL }));
            alert('Foto de perfil atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            alert('Erro ao atualizar a foto de perfil.');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        try {
            await db.collection('users').doc(user.uid).update(formData);
            setUserData(prevData => ({ ...prevData, ...formData }));
            alert('Dados atualizados com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            alert('Erro ao atualizar os dados.');
        }
    };

    if (!userData) {
        return <div>Carregando...</div>;
    }
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
            
            <div className="configuracoes-container">
            <h4 id="text-info">Configurações de Perfil</h4>
            <div className="profile-photo-update">
                <img
                    className="img-perfil"
                    src={userData.profilePhotoURL || defaultProfile}
                    alt="Foto de Perfil"
                    width={200}
                    height={200}
                    />
                <input id="bnt-profile" type="file" accept="image/*" onChange={handleFileChange} />
                <button id="btn-atualizar" onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Atualizando...' : 'Atualizar Foto de Perfil'}
                </button>
            </div>

            <div className="edit-profile-form">
                <h5 id="text-info1">Editar Informações</h5>
                <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder= "Nome"
                    />
                <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder= "E-mail"
                    />
                <input
                    type="text"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    placeholder= "Idade"
                />
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder= "Telefone"
                    />
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder= "Endereço"
                    />
                <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    placeholder= "Sobre mim"
                    />
                <button id="btn-save" onClick={handleSaveChanges}>Salvar Alterações</button>
            </div>
        </div>
    </div>
     );
   
};

export default Configuracoes;
