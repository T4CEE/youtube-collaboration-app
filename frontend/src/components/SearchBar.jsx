import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";

const SearchBar = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const queryClient = useQueryClient();

  const extractVideoId = (youtubeUrl) => {
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = youtubeUrl.match(urlPattern);
    return match ? match[1] : null;
  };

  const handlePreview = () => {
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
    } else {
      alert('Please enter a valid YouTube URL');
    }
  };

  // UseMutation to handle saving the video
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
      queryClient.invalidateQueries(["video"]);
    },
    onError: (error) => {
      console.error("Error saving video:", error);
      alert("Failed to save video");
    },
  });

  const handleSave = () => {
    if (!videoId) {
      alert("Preview the video before saving");
      return;
    }
    saveVideoMutation.mutate(url);
  };

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
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded"
          disabled={saveVideoMutation.isLoading}
        >
          {saveVideoMutation.isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      {videoId && (
        <div className="mt-4">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
