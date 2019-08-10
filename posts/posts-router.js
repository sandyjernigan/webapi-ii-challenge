const express = require('express');

const router = express.Router();

// Database access will be done using the `db.js` file included inside the `data` folder.
const Posts = require('../data/db.js');

// Read
// Returns an array of all the post objects contained in the database.
router.get('/', async (req, res) => {
  try {
    const posts = await Posts.find(req.query);
    res.status(200).json(posts);
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the posts',
    });
  }
});

module.exports = router;