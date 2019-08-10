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

// 	Returns an array of all the comment objects associated with the post with the specified id.
router.get('/:id/comments', async (req, res) => {
  try {
    const results = await DB.findPostComments(req.params.id);
    res.status(200).json(results);
    console.log(results)
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the results.',
    });
  }
});

module.exports = router;