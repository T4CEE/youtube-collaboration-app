import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const fetchPlaylistByUrl = async (url) => {
  const response = await fetch(
    `http://localhost:5000/video?url=${encodeURIComponent(url)}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch playlist");
  }
  return response.json();
};

const SavedPlaylist = () => {
  const { url } = useParams();

  const { data: playlistData, isLoading, error } = useQuery({
    queryKey: ["playlistByUrl", url],
    queryFn: () => fetchPlaylistByUrl(url),
    enabled: !!url,
  });

  if (isLoading) return <div>Loading playlist...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { video, videos, collaborators, comments } = playlistData || {};

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Playlist Details</h1>
      <p>Playlist URL: {video?.url}</p>

      <h2 className="text-lg font-semibold mt-4">Collaborators:</h2>
      <p>{collaborators?.join(", ") || "No collaborators"}</p>

      <h2 className="text-lg font-semibold mt-4">Videos:</h2>
      {videos?.length ? (
        <ul className="list-disc ml-6">
          {videos.map((video, index) => (
            <li key={index} className="mb-4">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${video.url.split("v=")[1]}`}
                title={video.title || video.url}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <p>{video.title || video.url}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No videos in this playlist.</p>
      )}

      <h2 className="text-lg font-semibold mt-4">Comments:</h2>
      {comments?.length ? (
        <ul className="list-disc ml-6">
          {comments.map((comment, idx) => (
            <li key={idx} className="mb-2">
              <strong>{comment.author}:</strong> {comment.text}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export default SavedPlaylist;
