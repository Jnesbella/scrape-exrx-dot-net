const PouchDB = require('pouchdb');

const exrxDotNet = require('./exrx-dot-com');

async function loadExerciseData() {
    return await exrxDotNet.scrape();
}

function storeExerciseData() {
    const db = new PouchDB('exercises');
}

function run() {
    loadExerciseData();
}

run();
