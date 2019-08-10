const express = require('express');

const HubsRouter = require('./posts/posts-router.js');

const server = express();
server.use(express.json());

// Separate the endpoints that begin with `/api/posts` into a separate `Express Router`.
server.use('/api/posts', PostsRouter);

server.get('/', (req, res) => {
  res.send(`
    <h2>Random Blog</h>
    <p>Welcome to some random Blog.</p>
  `);
});

module.exports = server;