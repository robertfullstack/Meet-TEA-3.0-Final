import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import defaultProfile from "../img/default-profile.png";

const PostComp = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [loves, setLoves] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoved, setIsLoved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = db.collection('posts').doc(id);
      const postSnapshot = await postRef.get();
      if (postSnapshot.exists) {
        const postData = postSnapshot.data();
        setPost(postData);
        setLikes(postData.likes || 0);
        setLoves(postData.loves || 0);

        // Carrega os comentários do post
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
    const postRef = db.collection('posts').doc(id);

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
    const postRef = db.collection('posts').doc(id);

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;

    if (commentText.trim()) {
      const newComment = {
        text: commentText,
        user: auth.currentUser.displayName,
        timestamp: new Date(),
      };

      await db.collection("posts").doc(id).collection("comments").add(newComment);
      setComments((prevComments) => [...prevComments, newComment]);
      setCommentText("");
    }
  };

  if (!post) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p><img
                    style={{ width: "10%" }}
                  src={post.profilePhotoURL || defaultProfile}
                alt=""
                  />Postado por: {post.postUserName}</p>
      <img src={post.imageUrl} alt={post.title} />
      <p>{post.description}</p>

      <div>
        <button onClick={handleLike}>
          {isLiked ? "Descurtir" : "Curtir"} ({likes})
        </button>
        <button onClick={handleLove}>
          {isLoved ? "Remover Love" : "Love"} ({loves})
        </button>
      </div>

      <div>
        <h3>Comentários:</h3>
        {comments.map((comment, index) => (
          <div key={index}>
            <p><strong>{comment.user}:</strong> {comment.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Adicione um comentário..."
        />
        <button type="submit">Comentar</button>
      </form>
      <button onClick={() => navigate("/Home")}>
          Ir à página incicial
        </button>
    </div>
  );
};

export default PostComp;
