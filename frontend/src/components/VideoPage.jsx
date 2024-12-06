import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


const VideoPlayer = () => {
  const { id } = useParams();
  const [url, setUrl] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/video/${id}`);
        setUrl(response.data.url);
        setComments(response.data.comments);
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    fetchVideo();
  }, [id]);

  const handleComment = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/video/${id}/comment`, { text: newComment });
      setComments((prev) => [...prev, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div>
      <iframe
        width="100%"
        height="400"
        src={`https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}`}
        title="YouTube Video"
        allowFullScreen
      />
      <div className="mt-4">
        <h3>Comments</h3>
        <div>
          {comments.map((comment) => (
            <p key={comment.id}>
              <strong>{comment.user}:</strong> {comment.text}
            </p>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button onClick={handleComment} className="mt-2 bg-blue-500 text-white p-2 rounded">
          Comment
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
