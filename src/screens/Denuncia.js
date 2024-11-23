import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { db, auth, storage } from "../firebase";
import "../styles/Admin.css";
import loading1 from "../img/loading-meet-tea.gif";

export const Denuncia = () => {
  const [showModal, setShowModal] = useState(true);
  const [reports, setReports] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  const handleFetchUserReports = async () => {
    try {
      const usersSnapshot = await db.collection("users").get();
      const allReports = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const reportsSnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("reports")
          .get();

        reportsSnapshot.docs.forEach((doc) =>
          allReports.push({
            id: doc.id,
            userId: userId,
            ...doc.data(),
          })
        );
      }

      setReports(allReports);
    } catch (error) {
      console.error("Erro ao carregar todas as denúncias de usuários:", error);
    }
  };

  useEffect(() => {
    handleFetchUserReports();
  }, []);

  const closeReportsPage = () => {
    navigate("/admin");
  };

  const handleDeleteUserReport = async (reportId, userId) => {
    try {
      await db
        .collection("users")
        .doc(userId)
        .collection("reports")
        .doc(reportId)
        .delete();
      setReports(reports.filter((report) => report.id !== reportId));
      alert("Denúncia excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir denúncia:", error);
    }
  };

  const confirmDeleteAction = (type, reportId, userId) => {
    setConfirmDelete({ type, reportId, userId });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete?.type === "report") {
      handleDeleteUserReport(confirmDelete.reportId, confirmDelete.userId);
    }
    setConfirmDelete(null);
  };

  return (

    <div>
      <h1 id="titulo-denuncia">Denúncias feitas ao usuário</h1>
      {reports.length > 0 ? (
        <ul id="ul1">
          {reports.map((report) => (
            <li id="li1" key={report.id}>
              <strong>Email do Denunciante:</strong> {report.emailDenunciante || 'Não informado'} <br />
              <strong>Motivo:</strong> {report.motivo || 'Nenhum motivo informado'} <br />
              <strong>Justificativa:</strong> {report.justificativa || 'Nenhuma justificativa'} <br />
              <strong>Data:</strong> {new Date(report.timestamp?.seconds * 1000).toLocaleString() || 'Data não disponível'} <br />
              <button className="btn-excluir-denuncia" onClick={() => confirmDeleteAction("report", report.id, report.userId)}>Excluir Denúncia</button>
            </li>
          ))}
        </ul>
      ) : (
          <div className="loading">
                <img
                  className="loading"
                  src={loading1}
                  alt="Xicará com quebra-cabeça balançando como formato de carregamento da página"
                  width={600}
                  height={800}
                />
              </div>
        )}
        {confirmDelete && (
          <div className="modal-confirm">
            <p>Tem certeza de que deseja excluir esta denúncia?</p>
            <button onClick={handleConfirmDelete}>Sim</button>
            <button onClick={() => setConfirmDelete(null)}>Cancelar</button>
          </div>
        )}
        <button onClick={closeReportsPage}>Fechar</button>
      </div>
  );
};

export default Denuncia;