import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import "../styles/Admin.css";

export const Denuncia = () => {
    const [showModal, setShowModal] = useState(true);
    const location = useLocation();
    const reports = location.state?.reports || [];
    const navigate = useNavigate();

    const closeReportsPage = () => {
        navigate('/admin');
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div>
            <h1 id="titulo-denuncia">Denúncias feitas ao usuário</h1>

            {showModal && (
                <div className="modal-confirmation">
                    <div className="modal-content">
                        {reports.length > 0 ? (
                            <ul id="ul1">
                                {reports.map((report) => (
                                    <li id="li1" key={report.id}>
                                        <strong>Email do Denunciante:</strong> {report.emailDenunciante || 'Não informado'} <br />
                                        <strong>Email do Denunciado:</strong> {report.emailDenunciado || 'Não informado'} <br />
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
                            <button className="btn-cancel1" onClick={() => closeReportsPage()}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Denuncia;
