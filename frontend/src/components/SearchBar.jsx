import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [urlType, setUrlType] = useState(null); 
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const extractVideoId = (youtubeUrl) => {
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = youtubeUrl.match(urlPattern);
    return match ? match[1] : null;
  };

  const checkUrlType = (youtubeUrl) => {
    try {
      const parsedUrl = new URL(youtubeUrl);
      if (parsedUrl.searchParams.has('list')) {
        return 'playlist';
      } else if (parsedUrl.searchParams.has('v')) {
        return 'video';
      } else {
        return 'unknown';
      }
    } catch (e) {
      return 'invalid';
    }
  };

  const handlePreview = () => {
    const type = checkUrlType(url);
    setUrlType(type);

    if (type === 'video') {
      const id = extractVideoId(url);
      if (id) {
        setVideoId(id);
        navigate('/newvideo', { state: { videoId: id, url } });
      } else {
        alert('Please enter a valid YouTube video URL');
      }
    } else if (type === 'playlist') {
      const listId = new URL(url).searchParams.get('list');
      if (listId) {
        navigate('/playlist', { state: { playlistId: listId, url } });
      } else {
        alert('Please enter a valid YouTube playlist URL');
      }
    } else if (type === 'invalid') {
      alert('Please enter a valid YouTube URL');
    } else {
      alert('Unknown URL type');
    }
  };

  const saveVideoMutation = useMutation({
    mutationFn: async (url) => {
      const res = await fetch("http://localhost:5000/video", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 409) {
          alert("This video has already been saved.");
        }
        throw new Error(errorData.error || "Failed to save video");
      }

      return res.json();
    },
    onSuccess: () => {
      alert("Video saved successfully!");
      setUrl('');
      setVideoId(null);
      setUrlType(null);
      queryClient.invalidateQueries(["video"]);
    },
    onError: (error) => {
      console.error("Error saving video:", error);
      alert("Failed to save video");
    },
  });


  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <div className="flex space-x-2">
        <button
          onClick={handlePreview}
          className="bg-green-500 text-white p-2 rounded"
        >
          Preview
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
