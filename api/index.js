const express = require('express');
const https = require('https');
const http = require('http');

const exerciseRouter = require('./exercises');

const app = express();

function start() {
    app.use(exerciseRouter);

    http.createServer(app).listen(80);
    https.createServer(options, app).listen(443);
}

function stop() {}

module.exports = {
    start,
    stop,
};
