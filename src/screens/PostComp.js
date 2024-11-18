import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import "../styles/Home.css";
import defaultProfile from "../img/default-profile.png";
import Heart_puzz from "../img/LogoTEAoutline_heart_puzz1.png";
import Heart_puzz_closed from "../img/LogoTEAoutline_heart_puzz_closed1.png";
import Joia_puzz from "../img/Teacurteecompartilha.png";
import Joia_puzz_closed from "../img/Teacurteecompartilhamandajoia.png";
import IconHome from "../img/icon_home.png";
import loading1 from "../img/loading-meet-tea.gif";

const PostComp = (props) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [loves, setLoves] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoved, setIsLoved] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = db.collection("posts").doc(id);
      const postSnapshot = await postRef.get();
      if (postSnapshot.exists) {
        const postData = postSnapshot.data();
        setPost(postData);
        setLikes(postData.likes || 0);
        setLoves(postData.loves || 0);

        const commentsSnapshot = await postRef.collection("comments").get();
        const loadedComments = commentsSnapshot.docs.map((doc) => doc.data());
        setComments(loadedComments);
      }
    };

    fetchPost();
  }, [id]);

  const checkAuth = () => {
    if (!auth.currentUser) {
      alert("Você precisa estar logado para interagir com o post.");
      navigate("/");
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!checkAuth()) return;
    const postRef = db.collection("posts").doc(id);

    if (isLiked) {
      await postRef.update({ likes: likes - 1 });
      setLikes(likes - 1);
    } else {
      await postRef.update({ likes: likes + 1 });
      setLikes(likes + 1);
      if (isLoved) {
        await postRef.update({ loves: loves - 1 });
        setLoves(loves - 1);
        setIsLoved(false);
      }
    }
    setIsLiked(!isLiked);
  };

  const handleLove = async () => {
    if (!checkAuth()) return;
    const postRef = db.collection("posts").doc(id);

    if (isLoved) {
      await postRef.update({ loves: loves - 1 });
      setLoves(loves - 1);
    } else {
      await postRef.update({ loves: loves + 1 });
      setLoves(loves + 1);
      if (isLiked) {
        await postRef.update({ likes: likes - 1 });
        setLikes(likes - 1);
        setIsLiked(false);
      }
    }
    setIsLoved(!isLoved);
  };

  const handleCommentSubmit = async (postId) => {
    if (commentText.trim()) {
      if (!auth.currentUser || !auth.currentUser.displayName) {
        alert("Você precisa estar logado para comentar.");
        return;
      }

      const newComment = {
        text: commentText,
        user: auth.currentUser.displayName,
        timestamp: new Date(),
      };

      try {
        await db
          .collection("posts")
          .doc(postId)
          .collection("comments")
          .add(newComment);

        setComments((prevComments) => [...prevComments, newComment]);
        setCommentText("");
        setCurrentPostId(null);
      } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
      }
    }
  };

  if (!post) {
    return (
      <div className="loading">
        <img
          className="loading"
          src={loading1}
          alt="Xicára com quebra-cabeça balançando como formato de carregamento da página"
          width={450}
          height={800}
        />
      </div>
    );
  }

  return (
    <div className="container-home">
      <div id="container-post" className="modal-posts">
        <div className="post">
          <h1>{post.title}</h1>
          <img
            id="img-profile-post"
            src={post.profilePhotoURL || defaultProfile}
            alt=""
          />
          <p>Postado por: {post.postUserName}</p>
          <img id="post-img" src={post.imageUrl} alt={post.title} />
          <p>{post.description}</p>

          <div>
            <button id="btn-curtir" onClick={handleLike}>
              <img
                src={isLiked ? Joia_puzz_closed : Joia_puzz}
                width={40}
                alt={isLiked ? "Like ativo" : "Like inativo"}
              />
              ({likes})
            </button>
            <button id="btn-amei" onClick={handleLove}>
              <img
                src={isLoved ? Heart_puzz_closed : Heart_puzz}
                width={40}
                alt={isLoved ? "Amor ativo" : "Amor inativo"}
              />
              ({loves})
            </button>
          </div>

          <button
            id="btn-coment"
            onClick={() =>
              setCurrentPostId(post.id === currentPostId ? null : post.id)
            }
          >
            {currentPostId === post.id ? "Comentar" : "Comentar"}
          </button>

          {currentPostId === post.id && (
            <div className="comment-form">
              <textarea
                id="comentario"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
              />

              <div className="button-group">
                <button
                  id="btn-coment-enviar"
                  onClick={() => handleCommentSubmit(post.id)}
                >
                  Enviar
                </button>
                <button
                  id="btn-coment-fechar"
                  onClick={() => setCurrentPostId(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
          <div>
            <h3>Comentários:</h3>
            {comments.map((comment, index) => (
              <div key={index}>
                <p>
                  <strong>{comment.user}:</strong> {comment.text}
                </p>
              </div>
            ))}
          </div>

          <button id="button-home" onClick={() => navigate("/Home")}>
            <img id="icon-home" src={IconHome} width={30} />
            Página inicial
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostComp;
