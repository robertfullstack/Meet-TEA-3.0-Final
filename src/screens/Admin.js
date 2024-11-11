import React, { useEffect, useState } from 'react';
import { auth, db, storage } from "../firebase.js";
import { useNavigate } from 'react-router-dom';
import "../styles/Admin.css";

export const Admin = () => {
    const [users, setUsers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminName, setAdminName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedAdmin = localStorage.getItem('isAdminLoggedIn');
        if (storedAdmin === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const openReportsPage = (reports) => {
        navigate('/denuncia', { state: { reports } });
    };

    const handleLogin = () => {
        const validAdmins = ['Robert', 'Julia', 'Isabella', 'Marcos'];
        if (validAdmins.includes(adminName) && adminPassword === 'MeetTEA') {
            setIsLoggedIn(true);
            localStorage.setItem('isAdminLoggedIn', 'true');
        } else {
            alert('Nome ou senha incorretos!');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isAdminLoggedIn');
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (!isLoggedIn) return;

            try {
                const usersCollection = await db.collection('users').get();
                const usersList = [];

                for (const userDoc of usersCollection.docs) {
                    const userData = userDoc.data();
                    const fileURL = userData.fileURL;

                    const reportsCollection = await db.collection('users').doc(userDoc.id).collection('reports').get();
                    const reports = reportsCollection.docs.map(reportDoc => ({
                        id: reportDoc.id,
                        ...reportDoc.data()
                    }));

                    usersList.push({
                        id: userDoc.id,
                        email: userData.email,
                        fileURL,
                        banned: userData.banned || false,
                        reports,
                    });
                }

                setUsers(usersList);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };

        fetchUsers();
    }, [isLoggedIn]);

    const redirectToDenuncia = (reports) => {
        navigate('/denuncias', { state: { reports } });
    };

    const toggleBanUser = async (userId, currentStatus) => {
        try {
            await db.collection('users').doc(userId).update({
                banned: !currentStatus
            });

            setUsers(users.map(user =>
                user.id === userId ? { ...user, banned: !currentStatus } : user
            ));

            console.log(`Usuário ${currentStatus ? 'desbanido' : 'banido'} com sucesso.`);
        } catch (error) {
            console.error('Erro ao banir/desbanir o usuário:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Você tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) {
            try {
                // Excluir posts associados ao usuário
                const postsSnapshot = await db.collection("posts")
                    .where("user", "==", userId)
                    .get();
    
                const deletePromises = postsSnapshot.docs.map(async (doc) => {
                    const postData = doc.data();
                    try {
                        if (postData.imageUrl) {
                            const imageRef = storage.refFromURL(postData.imageUrl);
                            await imageRef.delete();
                        }
                        await db.collection("posts").doc(doc.id).delete();
                    } catch (error) {
                        console.error(`Erro ao excluir o post com ID ${doc.id}:`, error);
                    }
                });
    
                await Promise.all(deletePromises);
    
                // Excluir dados do usuário no Firestore
                const userDoc = await db.collection("users").doc(userId).get();
                const userData = userDoc.data();
    
                if (userData?.profilePhotoURL) {
                    const photoRef = storage.refFromURL(userData.profilePhotoURL);
                    await photoRef.delete();
                }
    
                await db.collection("users").doc(userId).delete();
    
                // Excluir arquivos do usuário no Storage (se houver)
                const userFilesRef = storage.ref().child(`user_files/${userId}`);
                await userFilesRef.delete().catch((error) => {
                    console.warn("Nenhum arquivo extra para excluir.", error);
                });
    
                // Exclusão do usuário no Firebase Authentication
                const userToDelete = await auth.getUser(userId);
                await auth.deleteUser(userToDelete);
    
                // Remover da lista de usuários imediatamente
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                alert('Usuário excluído com sucesso!');
    
                // Desativar sessão ativa (opcional)
                if (auth.currentUser && auth.currentUser.uid === userId) {
                    await auth.signOut();
                    window.location.href = "/";
                }
                
            } catch (error) {
                console.error('Erro ao excluir usuário:', error);
    
                if (error.code === "auth/requires-recent-login") {
                    alert("Você precisa fazer login novamente para excluir a conta.");
                    await auth.signOut();
                    window.location.href = "/login";
                } else {
                    alert("Ocorreu um erro ao excluir o usuário.");
                }
            }
        }
    };
    
    

    if (!isLoggedIn) {
        return (
            <div>
                <h1 h1 id="title-admin-1">Admin Login</h1>
                <div id="div-btn-admin"> 
                    <label>
                        <input
                            id="btn-input"
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder='Nome Admin'
                        />
                    </label>
                    <label>
                        <input
                            id="btn-input"
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder='Senha Admin'
                        />
                    </label>
                    <button id="btn-admin" onClick={handleLogin}>Entrar</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 id="title-admin">Usuários Cadastrados</h1>
            <button id="btn-logout" onClick={handleLogout}>Logout</button>
            <button id="btn-denuncia-post" onClick={() => navigate("/DenunciaPost")}>Denúncias de Posts</button>
            <div className='container-admin'>
                <table id="table-admin">
                    <thead>
                        <tr id="tr-admin">
                            <th>ID do Usuário:</th>
                            <th>Email:</th>
                            <th>Arquivo/Carteirinha:</th>
                            <th>Denúncias:</th>
                            <th>Ações (ADM):</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.fileURL ? (
                                        <a href={user.fileURL} target="_blank" rel="noopener noreferrer">Download</a>
                                    ) : (
                                        'Nenhum arquivo'
                                    )}
                                </td>
                                <td>
                                    {user.reports.length > 0 ? (
                                        <button id="btn-denuncia" onClick={() => openReportsPage(user.reports)}>
                                            Exibir Denúncias
                                        </button>
                                    ) : (
                                        'Nenhuma denúncia'
                                    )}
                                </td>
                                <td>
                                    {!user.banned ? (
                                        <button id="btn-banir" onClick={() => toggleBanUser(user.id, user.banned)}>Banir</button>
                                    ) : (
                                        <button id="btn-banir" onClick={() => toggleBanUser(user.id, user.banned)}>Desbanir</button>
                                    )}
                                    <button id="btn-banir" onClick={() => handleDeleteUser(user.id)}>Excluir Conta</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
