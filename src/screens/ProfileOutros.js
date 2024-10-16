import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase'; // Ajuste o caminho conforme necessário

const ProfileOutros = () => {
    const { id } = useParams(); // Obtém o ID da URL
    const [user, setUser] = useState(null);
    const [reportText, setReportText] = useState(""); // Campo para justificar a denúncia
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [hasReported, setHasReported] = useState(false); // Novo estado para controlar se o usuário já denunciou

    useEffect(() => {
        if (id) {
            db.collection("users").doc(id).get().then(doc => {
                if (doc.exists) {
                    setUser(doc.data());
                } else {
                    console.log("Usuário não encontrado");
                }
            }).catch(error => {
                console.error("Erro ao buscar usuário:", error);
            });
        }

        // Verificar se o usuário logado já fez uma denúncia
        const checkIfAlreadyReported = async () => {
            if (auth.currentUser) {
                const currentUser = auth.currentUser;
                const reportsSnapshot = await db
                    .collection("users")
                    .doc(id)
                    .collection("reports")
                    .where("emailDenunciante", "==", currentUser.email)
                    .get();

                if (!reportsSnapshot.empty) {
                    setHasReported(true);
                }
            }
        };

        checkIfAlreadyReported();
    }, [id]);

    // Função para enviar a denúncia
    const handleReport = async () => {
        if (!auth.currentUser) {
            setErrorMessage("Você precisa estar logado para denunciar.");
            return;
        }

        if (reportText.trim() === "") {
            setErrorMessage("A justificativa da denúncia não pode estar vazia.");
            return;
        }

        if (hasReported) {
            setErrorMessage("Você já enviou uma denúncia para este usuário.");
            return;
        }

        try {
            const currentUser = auth.currentUser;

            // Adiciona uma denúncia na subcoleção "reports" do usuário denunciado
            await db.collection("users").doc(id).collection("reports").add({
                emailDenunciante: currentUser.email, // Email de quem está denunciando
                justificativa: reportText, // Justificativa da denúncia
                timestamp: new Date() // Data da denúncia
            });

            setSuccessMessage("Denúncia enviada com sucesso.");
            setReportText(""); // Limpa o campo de texto após enviar
            setHasReported(true); // Define que o usuário já denunciou
        } catch (error) {
            console.error("Erro ao enviar denúncia:", error);
            setErrorMessage("Erro ao enviar denúncia. Tente novamente mais tarde.");
        }
    };

    if (!user) {
        return <div>Carregando informações do usuário...</div>;
    }

    return (
        <div>
            <h1>Informações do Usuário</h1>
            {user.profilePhotoURL && (
                <div style={{ marginBottom: '20px' }}>
                    <img
                        src={user.profilePhotoURL}
                        alt={user.name}
                        style={{ width: '150px', height: '150px', borderRadius: '50%' }}
                    />
                </div>
            )}
            <p><strong>Nome:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>

            {/* Formulário para justificar a denúncia */}
            <div style={{ marginTop: '20px' }}>
                <h3>Denunciar Usuário</h3>
                {hasReported ? (
                    <p style={{ color: 'red' }}>Você já enviou uma denúncia para este usuário.</p>
                ) : (
                    <>
                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Escreva a justificativa para denunciar este perfil"
                            rows="5"
                            cols="50"
                            style={{ width: '100%', marginBottom: '10px' }}
                        ></textarea>
                        <button onClick={handleReport}>Enviar Denúncia</button>
                    </>
                )}

                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
        </div>
    );
};

export default ProfileOutros;
