import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, storage, db } from "../firebase";
import "../styles/Admin.css";

export const DenunciaPost = () => {
    const [showModal, setShowModal] = useState(true);
    const [reportsPosts, setReportsPosts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null); 
    const navigate = useNavigate();


    const handleFetchAllReports = async () => {
        try {
            const postsSnapshot = await db.collection("posts").get();
            const allReports = [];

            for (const postDoc of postsSnapshot.docs) {
                const postId = postDoc.id;
                const reportsSnapshot = await db
                    .collection("posts")
                    .doc(postId)
                    .collection("reportsPosts")
                    .get();

                reportsSnapshot.docs.forEach((doc) =>
                    allReports.push({
                        id: doc.id,
                        postId: postId,
                        ...doc.data(),
                    })
                );
            }

            setReportsPosts(allReports);
        } catch (error) {
            console.error("Erro ao carregar todas as denúncias:", error);
        }
    };

    const fetchPosts = async () => {
        const postsSnapshot = await db.collection("posts").orderBy("timestamp", "desc").get();
        const postsData = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setPosts(postsData);
    };

    useEffect(() => {
        handleFetchAllReports();
        fetchPosts();
    }, []);

    const closeReportsPage = () => {
        navigate('/admin');
    };


    const handleDeleteReport = async (reportId, postId) => {
        try {
            await db.collection("posts").doc(postId).collection("reportsPosts").doc(reportId).delete();
            setReportsPosts(reportsPosts.filter(report => !(report.id === reportId && report.postId === postId)));
            alert("Denúncia excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir denúncia:", error);
        }
    };


    const handleDeletePost = async (postId) => {
        try {

            const reportsSnapshot = await db.collection("posts").doc(postId).collection("reportsPosts").get();
            reportsSnapshot.forEach((doc) => doc.ref.delete());


            const commentsSnapshot = await db.collection("posts").doc(postId).collection("comments").get();
            commentsSnapshot.forEach((doc) => doc.ref.delete());

            await db.collection("posts").doc(postId).delete();

            setPosts(posts.filter(post => post.id !== postId));
            setReportsPosts(reportsPosts.filter(report => report.postId !== postId));
            alert("Postagem e todas as suas denúncias foram excluídas com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir post e dados associados:", error);
        }
    };

    const confirmDeleteAction = (type, reportId, postId) => {
        setConfirmDelete({ type, reportId, postId });
    };

    const handleConfirmDelete = () => {
        if (confirmDelete?.type === "report") {
            handleDeleteReport(confirmDelete.reportId, confirmDelete.postId);
        } else if (confirmDelete?.type === "post") {
            handleDeletePost(confirmDelete.postId);
        }
        setConfirmDelete(null);
    };

    return (
        <div>
            <h1 id="titulo-denuncia">Denúncias de Todas as Postagens</h1>

            {showModal && (
                <div className="modal-confirmation">
                    <div className="modal-content">
                        {reportsPosts.length > 0 ? (
                            <ul id="ul1">
                                {reportsPosts.map((report) => {
                                    const post = posts.find((p) => p.id === report.postId);
                                    return (
                                        <li id="li1" key={report.id}>
                                            <strong>ID da Denúncia de Postagem:</strong> {report.postId} <br />
                                            <strong>Email do Denunciante:</strong> {report.emailDenunciante || 'Não informado'} <br />
                                            <strong>Motivo:</strong> {report.motivo || 'Nenhum motivo informado'} <br />
                                            <strong>Justificativa:</strong> {report.justificativa || 'Nenhuma justificativa'} <br />
                                            <strong>Data:</strong> {new Date(report.timestamp?.seconds * 1000).toLocaleString() || 'Data não disponível'}
                                            
                                            {post && (
                                                <>
                                                    <h2>{post.title}</h2>
                                                    <p><strong>Publicado por:</strong> {post.postUserName}</p>
                                                    {post.imageUrl && (
                                                        <img
                                                            style={{ width: "30%", height: "30%", objectFit: "cover" }}
                                                            src={post.imageUrl}
                                                            alt={post.title}
                                                        />
                                                    )}
                                                    <p>{post.description}</p>

                                                    <button onClick={() => confirmDeleteAction("post", null, post.id)}>Excluir Post</button>
                                                    <button onClick={() => confirmDeleteAction("report", report.id, report.postId)}>Excluir Denúncia</button>
                                                </>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>Nenhuma denúncia encontrada.</p>
                        )}
                        <div className="modal-buttons">
                            <button className="btn-cancel1" onClick={closeReportsPage}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className="modal-confirm-delete">
                    <div className="modal-delete-content">
                        <p>Tem certeza de que deseja {confirmDelete.type === "report" ? "excluir esta denúncia?" : "excluir este post e todos os seus dados?"}</p>
                        <button onClick={handleConfirmDelete}>Sim, excluir</button>
                        <button onClick={() => setConfirmDelete(null)}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DenunciaPost;
