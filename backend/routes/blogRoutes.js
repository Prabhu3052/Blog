const path = require('path');
const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { 
  getBlogs, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} = require(path.join(__dirname, '..', 'controllers', 'blogController'));

const router = express.Router();

router.route('/')
  .get(getBlogs)
  .post(protect, createBlog);

router.route('/:id')
  .put(protect, updateBlog)
  .delete(protect, admin, deleteBlog);

module.exports = router;