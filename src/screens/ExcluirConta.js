import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';
import capaMeetTea from '../img/capa_meet_tea.png';
import "../styles/ExcluirConta.css";

const ExcluirConta = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    date: new Date().toLocaleDateString(),
  });
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    setTimeout(() => {
      navigate('/home');
    }, 3000);
  };

  return (
    <div>
      <img src={capaMeetTea} alt="Capa Meet Tea" className="img-fluid" /> 

      <nav id="navbar-example2" className="navbar bg-body-tertiary px-3 mb-3">
        <a className="navbar-brand" href="#">Navegação</a>
        <ul id="ul-excluir" className="nav nav-pills">
          <li  className="nav-item">
            <a className="nav-link" href="#scrollspyHeading1">Exclusão de dados</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#scrollspyHeading2">Irreversibilidade</a>
          </li>
          <li className="nav-item dropdown">
            <a id="info-outros" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Outros</a>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#scrollspyHeading3">Processor de exclusão</a></li>
              <li><a className="dropdown-item" href="#scrollspyHeading4">Responsabilidade do usuário</a></li>
            </ul>
          </li>
        </ul>
      </nav>

    <div className="container">
      <h1 id="titulo-termos">Termo de Exclusão de Conta</h1>
        <form onSubmit={handleSubmit}>
          <p>
            Este documento estabelece os termos para a exclusão permanente de sua conta. 
            Ao concordar com este termo, você compreende e aceita que todos os dados associados à sua conta serão 
            permanentemente excluídos e não poderão ser recuperados.
          </p>

          <h3 id="scrollspyHeading1">Exclusão de Dados</h3>
          <p>
            O usuário compreende que, ao solicitar a exclusão de sua conta, todos os seguintes dados serão removidos de forma permanente:
          </p>
          <ul>
            <li>Postagens
             <p>Todos os conteúdos criados e publicados, como textos, imagens, vídeos e áudios. </p>
            </li>
            <li>Comentários
             <p>Todos os comentários feitos em postagens próprias e de terceiros. </p>
            </li>
            <li>Reações
             <p> Todas as interações como curtidas, reações ou votos em conteúdo de outros usuários. </p>
            </li>
            <li>Mensagens Privadas
             <p>Todo o histórico de conversas e mensagens diretas trocadas com outros usuários. </p>
            </li>
            <li>Histórico de Navegação 
             <p>Todas as atividades de navegação e interações realizadas dentro da rede social, incluindo visualizações de perfis e conteúdos. </p>
            </li>
            <li>Dados Pessoais
             <p> Informações pessoais fornecidas pelo usuário durante o registro e uso da conta, incluindo nome, e-mail, foto de perfil, biografia, e demais detalhes fornecidos voluntariamente.</p>
            </li>
          </ul> <br></br>
          <h4>Importante</h4>
          <p>Todo o conteúdo que você compartilhou publicamente será excluído de sua conta, mas as cópias feitas por outros usuários ou acessíveis publicamente fora de nossa plataforma não poderão ser recuperadas ou apagadas.</p>
          <br></br>
          <h3 id="scrollspyHeading2">Irreversibilidade</h3>
          <p>
            Ao assinar este termo, o usuário compreende que a exclusão de sua conta e de todos os dados relacionados é irreversível.
          </p>

          <h3 id="scrollspyHeading3">Processo de Exclusão</h3>
          <p>
            O pedido de exclusão será processado dentro de X dias úteis a partir da data de solicitação.
          </p>

          <h3 id="scrollspyHeading4">Responsabilidade do Usuário</h3>
          <p>
            O usuário confirma que leu e compreendeu os termos acima e que deseja proceder com a exclusão de sua conta e dados de forma permanente.
            Ao aceitar este termo, o usuário confirma que: <br></br>
            Compreende e concorda com as consequências da exclusão permanente de sua conta. <br></br>
            Está ciente de que a exclusão de sua conta implica na perda irreversível de todos os dados e conteúdo associado.<br></br>
            Não poderá responsabilizar a plataforma pela perda de dados após a exclusão ser processada.
          </p>
        </form>
    </div>
</div>
  );
};

export default ExcluirConta;
