const fp = require('lodash/fp');
const express = require('express');

const db = require('./db');
const api = require('./api');

async function run() {
    await db.init();
    api.start();
}

run();
