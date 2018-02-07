const rp = require('request-promise');
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

const {
    exerciseDirectoryMock,
    backExercisesMock,
} = require('./mock/utils-exrx');

const {
    scrapeExercise,
    scrapeExerciseDirectory,
    scrapeExerciseMenu,
} = require('./scrapers');

const root = 'http://www.exrx.net/Lists/Directory.html';
const dir = 'tmp/exrx-dot-net';

function getFilenameFromUrl(url) {
    return url.match(/\/(?:.(?!\/))+$/)[0].replace('html', 'json');
}

async function getData({ uri, transform }) {
    const filename = getFilenameFromUrl(uri);
    const path = `${dir}${filename}`;

    try {
        return await fs.readJson(path);
    } catch (err) {
        const data = await rp({
            uri,
            transform,
        });
        await fs.outputJson(path, data);

        return data;
    }
}

function getExerciseDirectory() {
    return getData({ uri: root, transform: scrapeExerciseDirectory });
}

function getExercises(exerciseGroupUrl) {
    return getData({
        uri: exerciseGroupUrl,
        transform: scrapeExerciseMenu,
    });
}

function getExercise(exerciseUrl) {
    return getData({
        uri: exerciseUrl,
        transform: scrapeExercise,
    });
}

module.exports = {
    async scrape() {
        const exerciseGroups = await getExerciseDirectory();
    },
};
