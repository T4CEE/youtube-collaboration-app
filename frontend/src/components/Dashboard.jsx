import React from "react";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const fetchVideos = async () => {
    const response = await fetch("http://localhost:5000/dashboard", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard videos");
    }
    return response.json();
  };

  const {
    data: videos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardVideos"],
    queryFn: fetchVideos,
  });

  if (isLoading) return <div>Loading videos...</div>;
  if (error) return <div>Error fetching videos: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4">
        {videos.map((video) => (
          <div
            key={video._id}
            className="p-4 border rounded bg-white shadow-md"
          >
            <a
              href={video.isPlaylist ? `/savedplaylist/${encodeURIComponent(video.url)}` : `/savedvideo/${encodeURIComponent(video.url)}`}
              className="text-blue-500 underline"
            >
              {video.isPlaylist ? "View Playlist" : "View Video"}
            </a>
            <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${video.url}`}
            title={video.title || video.url}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
            <p className="mt-2">{video.url}</p>
            <p className="mt-2">{video.collaborators}</p>
            {video.isPlaylist && (
              <ul className="mt-2">
                {video.videos?.slice(0, 3).map((v, idx) => (
                  <li key={idx} className="text-gray-600 text-sm">
                    {v.title}
                  </li>
                ))}
                {video.videos?.length > 3 && (
                  <li className="text-gray-500 text-sm italic">...and more</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
