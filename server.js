const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(cors());
// MongoDB connection string
const mongoURI = 'mongodb://127.0.0.1:27017/TestingNew';
mongoose.connect(mongoURI);

const db=mongoose.connection;
db.once('open',()=>{
    console.log('DB Connected....');
})
// User model
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});
const User = mongoose.model('User', UserSchema);
// Post model
const PostSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    content: String,
    likes: { type: Number, default: 0 },
    likesBy: [String],
    comments: [{
        userId: mongoose.Schema.Types.ObjectId,
        username: String,
        text: String
    }],
    
});
const Post = mongoose.model('Post', PostSchema);

// Middleware for token verification
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('A token is required for authentication');
    try {
        req.user = jwt.verify(token.split(' ')[1], 'YOUR_SECRET_KEY'); // Split to remove 'Bearer'
        next();
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
}
// Register user
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);
        const user = new User({
            username: req.body.username, password: hashedPassword
        });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});
// Login user
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user && bcrypt.compareSync(req.body.password, user.password)) {
            const token = jwt.sign({ userId: user._id }, 'YOUR_SECRET_KEY');
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Error during login');
    }
});
// Create a post
app.post('/posts', verifyToken, async (req, res) => {
    try {
        const post = new Post({
            userId: req.user.userId, title: req.body.title,
            content: req.body.content
        });
        await post.save();
        res.status(201).send('Post created successfully');
    } catch (error) {
        res.status(500).send('Error creating post');
    }
});
// Get all posts
app.get('/posts', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).send('Error fetching posts');
    }
});
// Fetch a single post
app.get('/posts/:postId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate({
            path: 'comments.userId',
            select: 'username', // Select the username field
        });

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.json(post);
    } catch (error) {
        res.status(500).send('Error fetching post');
    }
});

  
// Remaining server code...
// Update a post
app.put('/posts/:postId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findOne({
            _id: req.params.postId, userId:
                req.user.userId
        });
        if (!post) return res.status(404).send('Post not found or unauthorized');
        post.title = req.body.title;
        post.content = req.body.content;
        await post.save();
        res.status(200).send('Post updated successfully');
    } catch (error) {
        res.status(500).send('Error updating post');
    }
});
// Delete a post
app.delete('/posts/:postId', verifyToken, async (req, res) => {
    try {
        const result = await Post.findOneAndDelete({
            _id: req.params.postId, userId:
                req.user.userId
        });
        if (!result) {
            return res.status(404).send('Post not found or unauthorized');
        }
        res.status(200).send('Post deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting post');
    }
});

app.post('/posts/:postId/like', async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.headers.authorization.split(' ')[1]; // Assuming you are storing user ID in the token

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (!post.likesBy.includes(userId)) {
            post.likesBy.push(userId);
            post.likes += 1;
            await post.save();
        }

        res.json({ likes: post.likes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Add a comment to a post
app.post('/posts/:postId/comment', verifyToken, async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      
      if (!post) {
        return res.status(404).send('Post not found');
      }
  
      const newComment = {
        userId: req.user.userId,
        username: req.user.username,
        text: req.body.text,
      };
  
      post.comments.push(newComment);
      await post.save();
  
      res.status(200).json({ comments: post.comments });
    } catch (error) {
      res.status(500).send('Error adding comment');
    }
  });
  

// Add the following routes to your Express app:

// Follow a user
// Follow a user
app.post('/follow/:userId', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const targetUserId = req.params.userId;

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!currentUser.following.includes(targetUserId)) {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
            await currentUser.save();
            await targetUser.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Unfollow a user
app.post('/unfollow/:userId', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const targetUserId = req.params.userId;

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (currentUser.following.includes(targetUserId)) {
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
            await currentUser.save();
            await targetUser.save();
        }

        res
        console.error('Error unfollowing user:', error);
        res.status(500).send('Internal Server Error');
    }
    catch{
        error = error;
    }
});


const port = 3000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});