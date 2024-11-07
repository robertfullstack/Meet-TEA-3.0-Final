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

    // Função para verificar se o admin já está logado ao carregar a página
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
            // Salva o estado de login no localStorage
            localStorage.setItem('isAdminLoggedIn', 'true');
        } else {
            alert('Nome ou senha incorretos!');
        }
    };

    // Função para fazer logout e limpar o localStorage
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
                        banned: userData.banned || false, // Verifica se o usuário está banido
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

    if (!isLoggedIn) {
        return (
            <div>
                <h1 h1 id="title-admin-1">Admin Login</h1>
                <div>
                    <label>
                        <input
                            id="btn-input"
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder='Nome Admin'
                        />
                    </label>
                </div>
                <div>
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
            <button id="btn-logout"onClick={handleLogout}>Logout</button>
            <button id="btn-denuncia-post" onClick={() => navigate("/DenunciaPost")}>Denúncias de Posts</button>
            <div className='container-admin'>
                <table id="table-admin" >
                    <thead>
                        <tr id="tr-admin" >
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









// PARA CASO PRECISE DO CODE ANTIGO>....
// import React, { useEffect, useState } from 'react';
// import { db } from '../firebase';

// export const Admin = () => {
//     const [users, setUsers] = useState([]);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const usersCollection = await db.collection('users').get();

//                 const usersList = [];

//                 for (const userDoc of usersCollection.docs) {
//                     const userData = userDoc.data();
//                     const fileURL = userData.fileURL;

//                     usersList.push({
//                         id: userDoc.id,
//                         email: userData.email,
//                         fileURL,
//                         banned: userData.banned || false,
//                         // esse campo banned é o de banimento.
//                     });
//                 }

//                 setUsers(usersList);
//             } catch (error) {
//                 console.error('Erro ao buscar usuários:', error);
//             }
//         };

//         fetchUsers();
//     }, []);

//     const banUser = async (userId) => {
//         try {
//             // Atualiza o campo 'banned' do usuário no Firestore
//             await db.collection('users').doc(userId).update({
//                 banned: true,
//             });
//             // Atualiza a lista de usuários localmente
//             setUsers(users.map(user =>
//                 user.id === userId ? { ...user, banned: true } : user
//             ));
//             console.log('Usuário banido com sucesso!');
//         } catch (error) {
//             console.error('Erro ao banir o usuário:', error);
//         }
//     };

//     return (
//         <div>
//             <h1>Usuários Cadastrados</h1>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>ID do Usuário:</th>
//                         <th>Email:</th>
//                         <th>Arquivo/Carteirinha:</th>
//                         <th>Ações (ADM):</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {users.map((user) => (
//                         <tr key={user.id}>
//                             <td>{user.id}</td>
//                             <td>{user.email}</td>
//                             <td>
//                                 {user.fileURL ? (
//                                     <a href={user.fileURL} target="_blank" rel="noopener noreferrer">Download</a>
//                                 ) : (
//                                     'Nenhum arquivo'
//                                 )}
//                             </td>
//                             <td>
//                                 {!user.banned ? (
//                                     <button onClick={() => banUser(user.id)}>Banir</button>
//                                 ) : (
//                                     <span>Banido</span>
//                                 )}
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// export default Admin;
