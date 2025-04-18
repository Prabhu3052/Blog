const path = require('path');
const Blog = require(path.join(__dirname, '..', 'models', 'Blog'));

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'username avatar');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  const { title, content, image, tags } = req.body;

  try {
    const blog = await Blog.create({
      title,
      content,
      image,
      tags,
      author: req.user._id
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ message: 'Invalid blog data' });
  }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Only admin can delete any blog
    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }

    await blog.remove();
    res.json({ message: 'Blog removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBlogs, createBlog, updateBlog, deleteBlog };