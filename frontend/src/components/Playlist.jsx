import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Playlist = () => {
  const location = useLocation();
  const { playlistId, url } = location.state || {};
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (playlistId) {
      fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=25&key=AIzaSyAzSQxccCGVjLzj3DLgB8if4juTYaTRN7M`)
        .then((response) => response.json())
        .then((data) => {
          const videoList = data.items.map((item) => ({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
          }));
          setVideos(videoList);
        })
        .catch((error) => console.error('Error fetching playlist:', error));
    }
  }, [playlistId]);

  const savePlaylistMutation = useMutation({
    mutationFn: async (playlist) => {
      const res = await fetch("http://localhost:5000/video", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          isPlaylist: true,
          videos: playlist
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 409) {
          alert("This playlist has already been saved.");
        }
        throw new Error(errorData.error || "Failed to save playlist");
      }

      return res.json();
    },
    onSuccess: () => {
      alert("Playlist saved successfully!");
    },
    onError: (error) => {
      console.error("Error saving playlist:", error);
      alert("Failed to save playlist");
    },
  });

  const handleSavePlaylist = () => {
    if (videos.length === 0) {
      alert("No videos to save in the playlist.");
      return;
    }

    savePlaylistMutation.mutate(videos);
  };

  return (
    <div className="p-4">
      {videos.length > 0 ? (
        <>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videos[0].videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

          <div className="flex justify-between mt-4">
            <button
              className="bg-green-500 text-white p-2 rounded"
              // onClick={handlePlayAll}
            >
              Play All
            </button>
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={handleSavePlaylist}
            >
              Save Playlist
            </button>
          </div>

          <ul className="mt-4">
            {videos.map((video, index) => (
              <li key={index} className="mb-4">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{video.title}</h3>
                    <p className="text-sm text-gray-600">{video.description}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading playlist...</p>
      )}
    </div>
  );
};

export default Playlist;
