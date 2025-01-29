import React from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";

const NewVideo = () => {
  const location = useLocation();
  const { videoId, url } = location.state || {};

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
    },
    onError: (error) => {
      console.error("Error saving video:", error);
      alert("Failed to save video");
    },
  });

  const handleSave = () => {
    saveVideoMutation.mutate(url);
  };

  return (
    <div className="p-4">
      {videoId ? (
        <>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <div className="flex justify-between mt-4">
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={handleSave}
              disabled={saveVideoMutation.isLoading}
            >
              {saveVideoMutation.isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      ) : (
        <p>No video to display</p>
      )}
    </div>
  );
};

export default NewVideo;
