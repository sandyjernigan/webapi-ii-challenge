const express = require('express');

const router = express.Router();

// Database access will be done using the `db.js` file included inside the `data` folder.
const Posts = require('../data/db.js');



module.exports = router;