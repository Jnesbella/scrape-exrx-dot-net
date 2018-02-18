const rp = require('request-promise');
const fs = require('fs-extra');
const path = require('path');
// TODO replace _ with fp
const _ = require('lodash');
const fp = require('lodash/fp');

const {
    exerciseDirectoryMock,
    backExercisesMock,
} = require('./mock/utils-exrx');

const { massageExerciseData } = require('./data-utils');

const {
    scrapeExercise,
    scrapeExerciseDirectory,
    scrapeExerciseMenu,
} = require('./scrapers');

function getFilenameFromUrl(url, fileExtension = '.html') {
    return url
        .match(/\/(?:.(?!\/))+\.html$/)[0]
        .replace(/\.html$/, fileExtension);
}

const root = 'tmp/exrx-dot-net';

async function getHtml({ uri }) {
    let html = '';
    const filename = getFilenameFromUrl(uri);
    const directory = `${root}/html`;
    const path = `${directory}${filename}`;

    try {
        html = await fs.readFile(path);
    } catch (errReadLocalHtml) {
        try {
            html = await rp({ uri });
            await fs.ensureDir(directory);
            await fs.writeFile(path, html);
        } catch (errReadRemoteHtml) {
            console.log('-- ERR - getHtml --', errReadRemoteHtml);
        }
    }

    return html;
}

async function getData({ uri, transform, folder }) {
    let data = null;
    const filename = getFilenameFromUrl(uri, '.json');
    const path = `${root}${folder ? folder : ''}${filename}`;

    try {
        data = await fs.readJson(path);
    } catch (errReadFileFail) {
        try {
            const html = await getHtml({
                filename,
                uri,
            });
            data = transform(html);
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

    try {
        for (let uri of exerciseGroups) {
            let urlsToAdd = [];

            urlsToAdd = await getData({
                uri,
                transform: scrapeExerciseMenu,
                folder: '/muscle-groups',
            });

            exerciseUrls = [...exerciseUrls, ...urlsToAdd];
        }
    } catch (err) {
        console.log('-- ERR - getExerciseUrls --', err);
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

        return fp.flow(
            fp.flatten,
            fp.uniqBy(e => e.source),
            fp.sortBy(e => e.name),
            fp.map(massageExerciseData)
        )(exercises);
    },
};
