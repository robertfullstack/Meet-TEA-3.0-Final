import React, { useEffect, useState } from 'react';
import { db } from '../firebase';

export const Admin = () => {
    const [users, setUsers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminName, setAdminName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedReports, setSelectedReports] = useState([]);

    const handleLogin = () => {
        const validAdmins = ['Robert', 'Julia', 'Isabella', 'Marcos'];
        if (validAdmins.includes(adminName) && adminPassword === 'MeetTEA') {
            setIsLoggedIn(true);
        } else {
            alert('Nome ou senha incorretos!');
        }
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

    const banUser = async (userId) => {
        try {
            await db.collection('users').doc(userId).update({
                banned: true,
            });

            setUsers(users.map(user =>
                user.id === userId ? { ...user, banned: true } : user
            ));
            console.log('Usuário banido com sucesso!');
        } catch (error) {
            console.error('Erro ao banir o usuário:', error);
        }
    };

    const openReportsModal = (reports) => {
        setSelectedReports(reports);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedReports([]);
    };

    if (!isLoggedIn) {
        return (
            <div>
                <h1>Admin Login</h1>
                <div>
                    <label>
                        Nome Admin:
                        <input
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Senha Admin:
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                        />
                    </label>
                </div>
                <button onClick={handleLogin}>Entrar</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Usuários Cadastrados</h1>
            <table>
                <thead>
                    <tr>
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
                                    <button onClick={() => openReportsModal(user.reports)}>Exibir Denúncias</button>
                                ) : (
                                    'Nenhuma denúncia'
                                )}
                            </td>
                            <td>
                                {!user.banned ? (
                                    <button onClick={() => banUser(user.id)}>Banir</button>
                                ) : (
                                    <span>Banido</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-confirmation">
                    <div className="modal-content">
                        <h4>Denúncias do Usuário</h4>
                        {selectedReports.length > 0 ? (
                            <ul>
                                {selectedReports.map((report) => (
                                    <li key={report.id}>
                                        <strong>Email do Denunciante:</strong> {report.emailDenunciante} <br />
                                        <strong>Motivo:</strong> {report.motivo} <br />
                                        <strong>Justificativa:</strong> {report.justificativa || 'Nenhuma justificativa'} <br />
                                        <strong>Data:</strong> {new Date(report.timestamp?.seconds * 1000).toLocaleString()}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhuma denúncia encontrada.</p>
                        )}
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={closeModal}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
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
