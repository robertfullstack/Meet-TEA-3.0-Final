import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';

const PostComp = () => {
  const { id } = useParams(); // Pega o ID da URL
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = db.collection('posts').doc(id);
      const postSnapshot = await postRef.get();
      if (postSnapshot.exists) {
        setPost(postSnapshot.data());
      }
    };

    fetchPost();
  }, [id]);

  if (!post) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <img src={post.imageUrl} alt={post.title} />
      <p>{post.description}</p>
    </div>
  );
};

export default PostComp;
