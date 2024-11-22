import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";
import loading1 from "../img/loading-meet-tea.gif";
import animaAdmin from "../img/admin_laptop2.gif";

export const Admin = () => {
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = localStorage.getItem("isAdminLoggedIn");
    if (storedAdmin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const openReportsPage = (reports) => {
    navigate("/denuncia", { state: { reports } });
  };

  const handleLogin = () => {
    const validAdmins = ["Robert", "Julia", "Isabella", "Marcos"];
    if (validAdmins.includes(adminName) && adminPassword === "MeetTEA") {
      setIsLoggedIn(true);
      localStorage.setItem("isAdminLoggedIn", "true");
    } else {
      alert("Nome ou senha incorretos!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isAdminLoggedIn");
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isLoggedIn) return;

      try {
        const usersCollection = await db.collection("users").get();
        const usersList = [];

        for (const userDoc of usersCollection.docs) {
          const userData = userDoc.data();
          const fileURL = userData.fileURL;

          const reportsCollection = await db
            .collection("users")
            .doc(userDoc.id)
            .collection("reports")
            .get();
          const reports = reportsCollection.docs.map((reportDoc) => ({
            id: reportDoc.id,
            ...reportDoc.data(),
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
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isLoggedIn]);

  const redirectToDenuncia = (reports) => {
    navigate("/denuncias", { state: { reports } });
  };

  const toggleBanUser = async (userId, currentStatus) => {
    try {
      await db.collection("users").doc(userId).update({
        banned: !currentStatus,
      });

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, banned: !currentStatus } : user
        )
      );

      console.log(
        `Usuário ${currentStatus ? "desbanido" : "banido"} com sucesso.`
      );
    } catch (error) {
      console.error("Erro ao banir/desbanir o usuário:", error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container-admin">
        <div className="admin-login">
          <h1 id="title-admin-1">Admin Login</h1>
          <div id="div-btn-admin">
            <label>
              <input
                id="btn-input"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Nome Admin"
              />
            </label>
            <label>
              <input
                id="btn-input"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Senha Admin"
              />
            </label>
            <button id="btn-admin" onClick={handleLogin}>
              Entrar
            </button>
          </div>
        </div>
        <div className="gifAdmin">
          <img
            id="animaAdmin"
            src={animaAdmin}
            width={550}
            height={550}
            alt="..."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 id="title-admin">Usuários Cadastrados</h1>
      <button id="btn-logout" onClick={handleLogout}>
        Logout
      </button>
      <button id="btn-denuncia-post" onClick={() => navigate("/DenunciaPost")}>
        Denúncias de Posts
      </button>
      <button id="btn-denuncia-post" onClick={() => navigate("/ValidarCiptea")}>
        Validar CIPTEAs
      </button>
      <div className="container-admin2">
        <table id="table-admin">
          <thead>
            <tr id="tr-admin">
              <div id="th-admin">
                <th id="th-id">ID do Usuário:</th>
                <th id="th-email">Email:</th>
                <th id="th-arquivo">Arquivo/Carteirinha:</th>
                <th id="th-denuncia">Denúncias:</th>
                <th id="th-ação">Ações (ADM):</th>
              </div>
            </tr>
          </thead>
          <div>
            {loading ? (
              <div className="loading">
                <img
                  className="loading"
                  src={loading1}
                  alt="Xicará com quebra-cabeça balançando como formato de carregamento da página"
                  width={600}
                  height={800}
                />
              </div>
            ) : (
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.fileURL ? (
                        <a
                          href={user.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        "Nenhum arquivo"
                      )}
                    </td>
                    <td>
                      {user.reports.length > 0 ? (
                        <button
                          id="btn-denuncia"
                          onClick={() => openReportsPage(user.reports)}
                        >
                          Exibir Denúncias
                        </button>
                      ) : (
                        "Nenhuma denúncia"
                      )}
                    </td>
                    <td>
                      {!user.banned ? (
                        <button
                          id="btn-banir"
                          onClick={() => toggleBanUser(user.id, user.banned)}
                        >
                          Banir
                        </button>
                      ) : (
                        <button
                          id="btn-banir"
                          onClick={() => toggleBanUser(user.id, user.banned)}
                        >
                          Desbanir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </div>
        </table>
      </div>
    </div>
  );
};

export default Admin;
