
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Validate username
    if (
      typeof username !== 'string' ||
      username.trim().length < 3 ||
      username.trim().length > 30
    ) {
      return res.status(400).json({
        message: 'Username must be 3-30 characters'
      });
    }

    // Validate email
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        message: 'Invalid email address'
      });
    }

    // Validate password
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: 'Password must be 8-72 characters'
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanEmail }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Username or email already exists'
      });
    }

    console.error('Signup failed:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof password !== 'string' ||
      (!username && !email)
    ) {
      return res.status(400).json({
        message: 'Username/email and password are required'
      });
    }

    const identifier = username || email;

    if (typeof identifier !== 'string') {
      return res.status(400).json({
        message: 'Invalid login information'
      });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier.trim() },
        { email: identifier.trim().toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login failed:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = { signup, login };
