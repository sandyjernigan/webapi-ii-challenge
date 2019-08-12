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
    res.status(500).json({ // respond with HTTP status code 500 (Server Error).
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
    res.status(500).json({ // respond with HTTP status code 500 (Server Error).
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
    res.status(500).json({ // respond with HTTP status code 500 (Server Error).
      error: "The comments information could not be retrieved.",
    });
  }
});

// Create
// Creates a post using the information sent inside the request body.
router.post('/', async (req, res) => {
  try {
    const { title, contents } = req.body

    // If the request body is missing the title or contents property:
    if (!title || !contents) {
      res.status(400).json({ // respond with HTTP status code 400 (Bad Request)
        errorMessage: "Please provide title and contents for the post.",
      });
    } else {
      // calling insert passing it a post object will add it to the database and return an object with the id of the inserted post. The object looks like this: { id: 123 }.
      const addPost = await DB.insert(req.body);
      const results = await DB.findById(addPost.id);

      // check that post was added
      if (results) {
        res.status(201).json(results); // return HTTP status code 201 (Created)
      } else {
        res.status(404).json({ // return HTTP status code 404 (Not Found).
          errorMessage: "There was an error while saving the post.",
        });
      }
    }

  } catch (error) {
    // If there's an error while saving the post:
    console.log(error);
    res.status(500).json({ // respond with HTTP status code 500 (Server Error)
      error: "There was an error while saving the post to the database",
    });
  }
});

// Creates a comment for the post with the specified id using information sent inside of the request body.
router.post('/:id/comments', async (req, res) => {
  const commentsInfo = {...req.body, post_id: req.params.id}
  try {
    const postResults = await DB.findById(req.params.id);

    // If the post with the specified id is not found:
    if (!postResults || !Array.isArray(postResults) || !postResults.length) {
      res.status(404).json({ // 404: Not Found
        message: "The post with the specified ID does not exist."
      });
    } else { 
      // If the request body is missing the text property:
      const { text } = req.body
      if (!text) {
        res.status(400).json({ // respond with HTTP status code 400 (Bad Request).
          errorMessage: "Please provide text for the comment."
        });
      } else {
        // insertComment(): calling insertComment while passing it a comment object will add it to the database and return an object with the id of the inserted comment. The object looks like this: { id: 123 }. This method will throw an error if the post_id field in the comment object does not match a valid post id in the database.
        const commentAdded = await DB.insertComment(commentsInfo);
        const results = await DB.findCommentById(commentAdded.id);
        if (!results) {
          res.status(404).json({ // 404: Not Found
            errorMessage: "Error adding comment."
          });
        } else {
          res.status(201).json(results); // return HTTP status code 201 (Created).
        }
      }
    }
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({ // respond with HTTP status code 500 (Server Error).
      error: "There was an error while saving the comment to the database"
    });
  }
});

// Update
// 	Updates the post with the specified id using data from the request body. Returns the modified document, NOT the original.
router.put('/:id', async (req, res) => {
  try {
    const postResults = await DB.findById(req.params.id);

    // If the post with the specified id is not found:
    if (!postResults || !Array.isArray(postResults) || !postResults.length) {
      res.status(404).json({ // 404: Not Found
        message: "The post with the specified ID does not exist."
      });
    } else { 
      const { title, contents } = req.body
      // If the request body is missing the title or contents property:
      if (!title || !contents) {
        res.status(400).json({ // respond with HTTP status code 400 (Bad Request)
          errorMessage: "Please provide title and contents for the post.",
        });
      } else {
        // update(id, post): accepts two arguments, the first is the id of the post to update and the second is an object with the changes to apply. It returns the count of updated records. If the count is 1 it means the record was updated correctly.
        const updateResults = await DB.update(req.params.id, req.body);
        if (updateResults) {
          const results = await DB.findById(req.params.id);
          res.status(200).json(results); // return HTTP status code 200 (OK) and the newly updated post.
        } else {
          res.status(404).json({ message: 'The post could not be found' });
        }
      }
    }
  } catch (error) {
    // If there's an error when updating the post:
    console.log(error);
    res.status(500).json({
      error: "The post information could not be modified."
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
      res.status(200).json({ message: 'Deleted post object was successful.' });
    } else {
      res.status(404).json({ // return HTTP status code 404 (Not Found).
        message: "The post with the specified ID does not exist."
      });
    }
  } catch (error) {
    // log error to database
    console.log(error);
    res.status(500).json({
      error: "The post could not be removed"
    });
  }
});

module.exports = router;