const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const _ = require('lodash');

const {
    exerciseFrame,
    exerciseDirectoryFrame,
    exerciseMenuFrame,
} = require('./frames');
const {
    exerciseTransformer,
    exerciseDirectoryTransformer,
    exerciseMenuTransformer,
} = require('./transformers');

module.exports = {
    scrapeExerciseDirectory(exerciseDirectoryAsHtml) {
        const transformedExerciseDirectory = exerciseDirectoryTransformer(
            exerciseDirectoryAsHtml
        );

        const $ = cheerio.load(transformedExerciseDirectory);
        jsonframe($);

        return _.flow([
            ({ exerciseGroups }) =>
                exerciseGroups.map(
                    group => `http://www.exrx.net/Lists/${group}`
                ),
            exerciseGroups => _.sortBy(exerciseGroups, group => group),
            _.uniq,
        ])($('body').scrape(exerciseDirectoryFrame));
    },
    scrapeExerciseMenu(exerciseMenuAsHtml) {
        const transformedExerciseMenu = exerciseMenuTransformer(
            exerciseMenuAsHtml
        );

        const $ = cheerio.load(transformedExerciseMenu);
        jsonframe($);

        const regex = /^(\.{2}\/){2}/g;

        return _.flow([
            ({ exercises }) =>
                _.filter(exercises, exercise => regex.test(exercise)),
            exercises =>
                exercises.map(exerciseUrl =>
                    exerciseUrl.replace(regex, 'http://www.exrx.net/')
                ),
            _.uniq,
            exercises => _.sortBy(exercises, exercise => exercise),
        ])($('body').scrape(exerciseMenuFrame));
    },
    scrapeExercise(exerciseAsHtml) {
        const transformedExercise = exerciseTransformer(exerciseAsHtml);

        const $ = cheerio.load(transformedExercise);
        jsonframe($);

        return $('body').scrape(exerciseFrame);
    },
};
