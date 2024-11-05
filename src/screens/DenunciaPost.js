import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Admin.css";

export const DenunciaPost = () => {
    const [showModal, setShowModal] = useState(true);
    // const [reports, setReports] = useState([]); // Estado para armazenar todas as denúncias
    const reports = location.state?.reports || []; // Obtém as denúncias do estado ou lista vazia
    const navigate = useNavigate();

    // Função para buscar todas as denúncias de todas as postagens
    const handleFetchAllReports = async () => {
        try {
            const postsSnapshot = await db.collection("posts").get();
            const allReports = [];

            // Itera por cada post para buscar as denúncias na subcoleção "reports"
            for (const postDoc of postsSnapshot.docs) {
                const postId = postDoc.id;
                const reportsSnapshot = await db
                    .collection("posts")
                    .doc(postId)
                    .collection("reports")
                    .get();

                // Adiciona as denúncias de cada post ao array `allReports`
                reportsSnapshot.docs.forEach((doc) =>
                    allReports.push({
                        id: doc.id,
                        postId: postId,
                        ...doc.data(),
                    })
                );
            }

            setReports(allReports); // Armazena todas as denúncias no estado
        } catch (error) {
            console.error("Erro ao carregar todas as denúncias:", error);
        }
    };

    useEffect(() => {
        handleFetchAllReports(); // Chama a função ao montar o componente
    }, []);

    const closeReportsPage = () => {
        navigate('/admin');
    };

    return (
        <div>
            <h1 id="titulo-denuncia">Denúncias de Todas as Postagens</h1>

            {showModal && (
                <div className="modal-confirmation">
                    <div className="modal-content">
                        {reports.length > 0 ? (
                            <ul id="ul1">
                                {reports.map((report) => (
                                    <li id="li1" key={report.id}>
                                        <strong>ID da Postagem:</strong> {report.postId} <br />
                                        <strong>Email do Denunciante:</strong> {report.emailDenunciante || 'Não informado'} <br />
                                        <strong>Motivo:</strong> {report.motivo || 'Nenhum motivo informado'} <br />
                                        <strong>Justificativa:</strong> {report.justificativa || 'Nenhuma justificativa'} <br />
                                        <strong>Data:</strong> {new Date(report.timestamp?.seconds * 1000).toLocaleString() || 'Data não disponível'}
                                    </li>
                                ))}
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
        </div>
    );
};

export default DenunciaPost;
