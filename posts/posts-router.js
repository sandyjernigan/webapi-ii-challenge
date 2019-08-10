const express = require('express');

const router = express.Router();

// Database access will be done using the `db.js` file included inside the `data` folder.
const DB = require('../data/db.js');

// Read
// Returns an array of all the post objects contained in the database.
router.get('/', async (req, res) => {
  try {
    const posts = await DB.find();
    res.status(200).json(posts);
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the posts',
    });
  }
});

// Returns the post object with the specified id.
router.get('/:id', async (req, res) => {
  try {
    const results = await DB.findById(req.params.id);
    res.status(200).json(results);
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the post',
    });
  }
});

// 	Returns an array of all the comment objects associated with the post with the specified id.
router.get('/:id/comments', async (req, res) => {
  try {
    const results = await DB.findPostComments(req.params.id);
    res.status(200).json(results);
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the results.',
    });
  }
});

// Create
// Creates a post using the information sent inside the request body.
router.post('/', async (req, res) => {
  try {
    // calling insert passing it a post object will add it to the database and return an object with the id of the inserted post. The object looks like this: { id: 123 }.
    const addPost = await DB.insert(req.body);
    const results = await DB.findById(addPost.id);
    res.status(200).json(results);
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error adding post',
    });
  }
});

// Creates a comment for the post with the specified id using information sent inside of the request body.
router.post('/:id/comments', async (req, res) => {
  const commentsInfo = {...req.body, post_id: req.params.id}

  try {
    // insertComment(): calling insertComment while passing it a comment object will add it to the database and return an object with the id of the inserted comment. The object looks like this: { id: 123 }. This method will throw an error if the post_id field in the comment object does not match a valid post id in the database.
    const commentAdded = await DB.insertComment(commentsInfo);
    const results = await DB.findCommentById(commentAdded.id);
    res.status(200).json(results);
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error adding comment',
    });
  }
});

module.exports = router;