import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const VideoDetails = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/video/${id}`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }
        const data = await response.json();
        setVideo(data);
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    };

    fetchVideoDetails();
  }, [id]);

  if (!video) return <p>Loading...</p>;

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 p-4 bg-gray-100 min-h-screen">
      {/* Left Section: Video Player and Details */}
      <div className="flex-1">
        <iframe
          className="w-full h-64 md:h-96 rounded-md shadow-lg"
          src={`https://www.youtube.com/embed/${new URL(video.url).searchParams.get('v')}`}
          title={video.title}
          allowFullScreen
        />
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <p className="text-gray-700 mt-2">{video.description || "No description provided."}</p>
        </div>
      </div>

      {/* Right Section: Comments */}
      <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {video.comments?.length > 0 ? (
          <ul className="space-y-4">
            {video.comments.map((comment, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  {/* Placeholder Avatar */}
                  <span className="text-sm font-bold text-gray-600">U</span>
                </div>
                <div>
                  <p className="text-gray-800">{comment}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default VideoDetails;
