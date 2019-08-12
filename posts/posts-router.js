const express = require('express');

const router = express.Router();

// Database access will be done using the `db.js` file included inside the `data` folder.
const DB = require('../data/db.js');

// Read All - Returns an array of all the post objects contained in the database.
router.get('/', async (req, res) => {
  try {
    // `find()`: calling find returns a promise that resolves to an array of all the `posts` contained in the database.
    const posts = await DB.find();
    res.status(200).json(posts);
  } catch (error) {
    // If there's an error in retrieving the posts from the database:
    console.log(error);
    res.status(500).json({
      // return the following JSON object:
      error: "The posts information could not be retrieved."
    });
  }
});

// Read by ID - Returns the post object with the specified id.
router.get('/:id', async (req, res) => {
  try {
    // findById(id): this method expects an `id` as it's only parameter and returns the post corresponding to the `id` provided or an empty array if no post with that `id` is found.
    const results = await DB.findById(req.params.id);

    // If the post with the specified id is not found:
    if (!Array.isArray(results) || !results.length) {
      res.status(404).json({ // 404: Not Found
        message: "The post with the specified ID does not exist."
      });
    } else {
      res.status(200).json(results);
    }
  } catch (error) {
    // If there's an error in retrieving the post from the database:
    console.log(error);
    res.status(500).json({
      error: "The post information could not be retrieved."
    });
  }
});

// 	Read Comments - Returns an array of all the comment objects associated with the post with the specified id.
router.get('/:id/comments', async (req, res) => {
  try {
    const postResults = await DB.findById(req.params.id);

    // If the post with the specified id is not found:
    if (!postResults || !Array.isArray(postResults) || !postResults.length) {
      res.status(404).json({ // 404: Not Found
        message: "The post with the specified ID does not exist."
      });
    } else {

      // (else) post found, check for comments
      const commentResults = await DB.findPostComments(req.params.id);

      // check if comments exists
      if (!Array.isArray(commentResults) || !commentResults.length) {
        res.status(404).json({ // 404: Not Found
          message: "No comments found."
        });
      } else {

        // (else) return comments
        res.status(200).json(commentResults);
      }
    }
  } catch (error) {
    // If there's an error in retrieving the comments from the database
    console.log(error);
    res.status(500).json({
      error: "The comments information could not be retrieved.",
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

// Update
// 	Updates the post with the specified id using data from the request body. Returns the modified document, NOT the original.
router.put('/:id', async (req, res) => {
  console.log(req.params.id)
  try {
    // update(id, post): accepts two arguments, the first is the id of the post to update and the second is an object with the changes to apply. It returns the count of updated records. If the count is 1 it means the record was updated correctly.
    const updateResults = await DB.update(req.params.id, req.body);
    if (updateResults) {
      const results = await DB.findById(req.params.id);
      res.status(200).json(results);
    } else {
      res.status(404).json({ message: 'The post could not be found' });
    }
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error updating the post',
    });
  }
});

// Delete 
// Removes the post with the specified id and returns the **deleted post object**. You may need to make additional calls to the database in order to satisfy this requirement.
router.delete('/:id', async (req, res) => {
  try {
    // `remove(id)`: the remove method accepts an `id` as its first parameter and upon successfully deleting the post from the database it returns the number of records deleted.
    const deleteResults = await DB.remove(req.params.id);
    if (deleteResults > 0) {
      res.status(200).json({ message: 'Deleted post object.' });
    } else {
      res.status(404).json({ message: 'The post could not be found' });
    }
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      message: 'Error removing the hub',
    });
  }
});

module.exports = router;