const fp = require('lodash/fp');
const express = require('express');

const app = express();
const db = require('./db');
const api = require('./api');

async function run() {
    api(app, await db()).start();
    app.use(express.static('public'));
}

run();
