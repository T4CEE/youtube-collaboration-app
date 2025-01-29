import express from "express";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from "cookie-parser";
import connectMongoDB from './db/connectMongoDB.js'
import User from './models/user.model.js';
import Video from "./models/video.models.js"
import cors from "cors";
import authMiddleware from './middleware/auth.middleware.js'


const corsOptions = {
    origin: "http://localhost:3000", 
    credentials: true, 
};

dotenv.config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))

app.use(cookieParser());

connectMongoDB();

const PORT = process.env.PORT || 5000;

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
// console.log(YOUTUBE_API_KEY, 'i am key');




const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in environment variables');
}


app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: false });

        res.status(201).json({ id: user._id, email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user?.password || "");
        console.log("password match", isMatch)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: false, });

        res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});


app.post("/logout", (req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
      } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
  });


// app.get('/verify', (req, res) => {
//     const token = req.cookies.token || req.headers['x-auth-token'];
//     if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         res.status(200).json({ id: decoded.id });
//     } catch (error) {
//         res.status(401).json({ message: 'Token is not valid' });
//     }
// });

app.get('/user', async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password'); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error verifying token:', err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});



app.post('/video', authMiddleware, async (req, res) => {
  const { url } = req.body;
  const userEmail = req.user.email;

  const youtubeVideoRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([^&]+)/;
  const youtubePlaylistRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/.*[?&]list=([^&]+)/;

  try {
    if (!youtubeVideoRegex.test(url) && !youtubePlaylistRegex.test(url)) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const isPlaylist = youtubePlaylistRegex.test(url);

    const existingEntry = await Video.findOne({ url, email: userEmail });
    if (existingEntry) {
      return res.status(409).json({ message: 'This video/playlist already exists' });
    }

    const video = new Video({ url, email: userEmail, isPlaylist });
    await video.save();

    res.status(201).json({ message: 'Video/Playlist saved successfully', video });
  } catch (error) {
    console.error('Error saving video/playlist:', error);
    res.status(500).json({ message: 'Error saving video/playlist', error });
  }
});

app.get("/video", authMiddleware, async (req, res) => {
  const { url } = req.query;
  const userEmail = req.user.email;

  try {
    const youtubePlaylistRegex = /[?&]list=([^&]+)/;
    const playlistIdMatch = url.match(youtubePlaylistRegex);

    if (playlistIdMatch) {
      const playlistId = playlistIdMatch[1];

      const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(youtubeApiUrl);
if (!response.ok) {
  console.error("YouTube API error:", await response.text());
  throw new Error("Failed to fetch YouTube playlist");
}
const data = await response.json();

if (!data.items) {
  throw new Error("Invalid YouTube API response. No items found.");
}
      // const { data } = await fetch(youtubeApiUrl);

      const videos = data.items.map((item) => ({
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        title: item.snippet.title,
      }));

      const playlist = await Video.findOne({ url, email: userEmail });

      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      res.json({
        video: playlist,
        videos,
        collaborators: playlist.collaborators,
        comments: playlist.comments,
      });
    } else {

      const video = await Video.findOne({ url, email: userEmail });

      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.json({
        video,
        videos: [],
        collaborators: video.collaborators,
        comments: video.comments,
      });
    }
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ message: "Error fetching playlist", error });
  }
});


app.get('/dashboard', authMiddleware, async (req, res) => {
  const userEmail = req.user.email;

  try {
    const videos = await Video.find({
      $or: [{ email: userEmail }, { collaborators: userEmail }],
    }).populate('comments.email', 'name email');

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching dashboard videos:', error);
    res.status(500).json({ message: 'Error fetching dashboard videos', error });
  }
});

app.get('/savedplaylist', authMiddleware, async (req, res) => {
  const userEmail = req.user.email;

  try {
    const playlists = await Video.find({
      email: userEmail,
      isPlaylist: true,
    }).populate('comments.email', 'name email');

    res.status(200).json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Error fetching playlists', error });
  }
});

  

  app.get('/video/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.user.email;
  
    try {
      const video = await Video.findById(id).populate('comments.email', 'name email');
  
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
  
      if (video.email !== userEmail && !video.collaborators.includes(userEmail)) {
        return res.status(403).json({ message: 'You do not have access to this video' });
      }
  
      res.status(200).json(video);
    } catch (error) {
      console.error('Error fetching video:', error);
      res.status(500).json({ message: 'Error fetching video', error });
    }
  });

  
  

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  