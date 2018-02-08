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

function getFilenameFromUrl(url) {
    return url.match(/\/(?:.(?!\/))+\.html$/)[0].replace('html', 'json');
}

async function getData({ uri, transform, folder }) {
    let data = null;
    const filename = getFilenameFromUrl(uri);
    const path = `tmp/exrx-dot-net${folder ? folder : ''}${filename}`;

    try {
        data = await fs.readJson(path);
    } catch (errReadFileFail) {
        try {
            data = await rp({
                uri,
                transform,
            });
            await fs.outputJson(path, data);
        } catch (errGetDataFail) {
            console.log('-- ERR - getData --', errGetDataFail);
        }
    }

    return data;
}

function getExerciseGroups() {
    try {
        return getData({
            uri: 'http://www.exrx.net/Lists/Directory.html',
            transform: scrapeExerciseDirectory,
        });
    } catch (err) {
        console.log('-- ERR - getExerciseGroups --', err);
    }
}

async function getExerciseUrls(exerciseGroups) {
    let exerciseUrls = [];

    for (let uri of exerciseGroups) {
        let urlsToAdd = [];

        try {
            urlsToAdd = await getData({
                uri,
                transform: scrapeExerciseMenu,
                folder: '/muscle-groups',
            });
        } catch (err) {
            console.log('-- ERR - getExerciseUrls --', err);
        }

        exerciseUrls = [...exerciseUrls, ...urlsToAdd];
    }

    return exerciseUrls;
}

async function getExercises(exerciseUrls) {
    let exercises = [];

    for (let uri of exerciseUrls) {
        let exercise = null;

        try {
            exercise = await getData({
                uri,
                transform: html => ({
                    ...scrapeExercise(html),
                    source: uri,
                }),
                folder: '/exercises',
            });
        } catch (err) {
            console.log('-- ERR - getExercises --', err);
        }

        exercises = exercise ? [...exercises, exercise] : exercises;
    }

    return exercises;
}

module.exports = {
    async scrape() {
        const exerciseGroups = await getExerciseGroups();
        const exerciseUrls = await getExerciseUrls(exerciseGroups);
        const exercises = await getExercises(exerciseUrls);

        return _.flow([
            _.flatten,
            flattenedExercises => _.uniqBy(flattenedExercises, e => e.source),
            uniqueExercises => _.sortBy(uniqueExercises, e => e.name),
        ])(exercises);
    },
};
