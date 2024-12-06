import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/dashboard', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const data = await response.json();

        const sortedVideos = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setVideos(sortedVideos);

      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Dashboard</h2>
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video._id} className="border p-4 rounded">
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${new URL(video.url).searchParams.get('v')}`}
                title="YouTube Video"
                allowFullScreen
              />
              <button
                className="mt-2 bg-green-500 text-white p-2 rounded"  
                onClick={() => navigate(`/video/${video._id}`)}
              >
                Open
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No videos yet</p>
      )}
    </div>
  );
};

export default Dashboard;
