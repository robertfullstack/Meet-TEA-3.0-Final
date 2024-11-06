import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, storage, db } from "../firebase";
import "../styles/Admin.css";

export const DenunciaPost = () => {
    const [showModal, setShowModal] = useState(true);
    const [reportsPosts, setReportsPosts] = useState([]); // Estado para armazenar todas as denúncias
    const [posts, setPosts] = useState([]); // Armazena todos os posts
    const navigate = useNavigate();

    // Função para buscar todas as denúncias de todas as postagens
    const handleFetchAllReports = async () => {
        try {
            const postsSnapshot = await db.collection("posts").get();
            const allReports = [];

            // Itera por cada post para buscar as denúncias na subcoleção "reportsPosts"
            for (const postDoc of postsSnapshot.docs) {
                const postId = postDoc.id;
                const reportsSnapshot = await db
                    .collection("posts")
                    .doc(postId)
                    .collection("reportsPosts")
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

            setReportsPosts(allReports); // Usa a variável correta para definir o estado
        } catch (error) {
            console.error("Erro ao carregar todas as denúncias:", error);
        }
    };

    // Função para buscar os dados de todos os posts
    const fetchPosts = async () => {
        const postsSnapshot = await db.collection("posts").orderBy("timestamp", "desc").get();
        const postsData = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setPosts(postsData);
    };

    useEffect(() => {
        handleFetchAllReports(); // Chama a função ao montar o componente
        fetchPosts(); // Busca todos os posts ao montar o componente
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
                        {reportsPosts.length > 0 ? (
                            <ul id="ul1">
                                {reportsPosts.map((report) => {
                                    // Encontrar o post correspondente à denúncia
                                    const post = posts.find((p) => p.id === report.postId);
                                    return (
                                        <li id="li1" key={report.id}>
                                            <strong>ID da Denúncia de Postagem:</strong> {report.postId} <br />
                                            <strong>Email do Denunciante:</strong> {report.emailDenunciante || 'Não informado'} <br />
                                            <strong>Motivo:</strong> {report.motivo || 'Nenhum motivo informado'} <br />
                                            <strong>Justificativa:</strong> {report.justificativa || 'Nenhuma justificativa'} <br />
                                            <strong>Data:</strong> {new Date(report.timestamp?.seconds * 1000).toLocaleString() || 'Data não disponível'}
                                            
                                            {/* Verifica se o post foi encontrado e exibe os dados */}
                                            {post && (
                                                <>
                                                    {/* Título do post */}
                                                    <h2>{post.title}</h2>

                                                    {/* Nome do usuário que publicou */}
                                                    <p><strong>Publicado por:</strong> {post.postUserName}</p>

                                                    {/* Imagem do post */}
                                                    {post.imageUrl && (
                                                        <img
                                                            style={{ width: "30%", Height: "30%", objectFit: "cover" }}
                                                            src={post.imageUrl}
                                                            alt={post.title}
                                                        />
                                                    )}

                                                    {/* Descrição do post */}
                                                    <p>{post.description}</p>
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
        </div>
    );
};

export default DenunciaPost;
