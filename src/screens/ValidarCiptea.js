import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ValidarCiptea = () => {
    const [cipteaList, setCipteaList] = useState([]);
    const navigate = useNavigate();

    // Busca todos os usuários com carteira CIPTEA no Firestore e organiza os não validados primeiro
    useEffect(() => {
        const fetchCiptea = async () => {
            try {
                const usersSnapshot = await db.collection("users").get();
                const cipteaEntries = [];

                usersSnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.cipteaURL) {
                        cipteaEntries.push({
                            id: doc.id,
                            url: data.cipteaURL,
                            validated: data.validated || false,
                        });
                    }
                });

                // Ordena por prioridade: não validados primeiro
                cipteaEntries.sort((a, b) => Number(a.validated) - Number(b.validated));
                setCipteaList(cipteaEntries);
            } catch (error) {
                toast.error("Erro ao carregar as carteiras CIPTEA.");
            }
        };

        fetchCiptea();
    }, []);

    // Função para validar uma carteira CIPTEA específica
    const validarCiptea = async (userId) => {
        try {
            await db.collection("users").doc(userId).update({ validated: true });
            toast.success("Carteira CIPTEA validada com sucesso!");

            // Atualiza a lista de carteiras localmente
            setCipteaList((prevList) =>
                prevList.map((entry) =>
                    entry.id === userId ? { ...entry, validated: true } : entry
                )
            );
        } catch (error) {
            toast.error("Erro ao validar a carteira CIPTEA.");
        }
    };

    return (
        <div>
            <h1>Lista de Carteiras CIPTEA</h1>
            <button id="btn-denuncia-post" onClick={() => navigate("/admin")}>
            Voltar
            </button>
            {cipteaList.length === 0 ? (
                <p>Nenhuma carteira disponível.</p>
            ) : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {cipteaList.map((ciptea) => (
                        <li
                            key={ciptea.id}
                            style={{
                                marginBottom: "20px",
                                padding: "15px",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                backgroundColor: ciptea.validated
                                    ? "#d4edda"
                                    : "#f8d7da",
                            }}
                        >
                            <p>
                                <strong>Usuário ID:</strong> {ciptea.id}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                {ciptea.validated ? "Validado" : "Pendente"}
                            </p>
                            <div style={{ margin: "10px 0" }}>
                                <iframe
                                    src={ciptea.url}
                                    title={`Carteira CIPTEA ${ciptea.id}`}
                                    style={{
                                        width: "100%",
                                        height: "300px",
                                        border: "none",
                                    }}
                                />
                            </div>
                            {!ciptea.validated && (
                                <button
                                    onClick={() => validarCiptea(ciptea.id)}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#28a745",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Validar Carteira CIPTEA
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <ToastContainer />
        </div>
    );
};

export default ValidarCiptea;
