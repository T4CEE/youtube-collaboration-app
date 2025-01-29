import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SingleVideo = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: video, isLoading, isError, error } = useQuery(["video", id], async () => {
    const res = await fetch(`http://localhost:5000/video/${id}`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch video");
    }
    return res.json();
  });

  const commentMutation = useMutation(
    async (newComment) => {
      const res = await fetch(`http://localhost:5000/video/${id}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });
      if (!res.ok) {
        throw new Error("Failed to add comment");
      }
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["video", id]);
        setCommentText("");
      },
    }
  );

  const handleAddComment = () => {
    if (commentText.trim() !== "") {
      commentMutation.mutate(commentText);
    }
  };

  if (isLoading) return <p>Loading video...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Video</h1>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${video.url.split("v=")[1]}`}
        title={video.url}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Comments</h2>
        {video.comments.map((comment) => (
          <p key={comment._id}>
            <strong>{comment.user.name}:</strong> {comment.text}
          </p>
        ))}
      </div>
      <div className="mt-4">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="border p-2 rounded w-full mb-2"
          placeholder="Add a comment..."
        ></textarea>
        <button onClick={handleAddComment} className="bg-blue-500 text-white p-2 rounded">
          Add Comment
        </button>
      </div>
    </div>
  );
};

export default SingleVideo;
