const path = require('path');
const bcrypt = require('bcryptjs');
const User = require(path.join(__dirname, '..', 'models', 'User'));
const fs = require('fs').promises;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('Registration request received:', {
      body: req.body,
      file: req.file
    });

    const { username, email, password, bio } = req.body;
    let avatarPath = '/default-avatar.jpg';

    if (!username || !email || !password) {
      console.log('Missing required fields:', { username, email, password });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists:', { email, username });
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }

    // Handle avatar upload
    if (req.file) {
      const uploadDir = path.join(__dirname, '../uploads');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        avatarPath = `/uploads/${req.file.filename}`;
        console.log('Avatar uploaded successfully:', avatarPath);
      } catch (error) {
        console.error('Error handling avatar upload:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error processing avatar upload' 
        });
      }
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      bio: bio || 'New user',
      avatar: avatarPath
    });

    console.log('User created successfully:', user._id);

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    
    if (!isMatch) {
      console.log('Password mismatch for user:', user.email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const token = user.generateAuthToken();
    console.log('Token generated successfully for user:', user.email);
    
    const userData = {
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar
      }
    };
    
    console.log('Sending response:', userData);
    res.json(userData);
  } catch (err) {
    console.error('Login error details:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = { registerUser, authUser };