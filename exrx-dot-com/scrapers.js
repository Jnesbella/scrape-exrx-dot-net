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

        return $('body')
            .scrape(exerciseDirectoryFrame)
            .exerciseGroups.map(group => `http://www.exrx.net/Lists/${group}`);
    },
    scrapeExerciseMenu(exerciseMenuAsHtml) {
        const transformedExerciseMenu = exerciseMenuTransformer(
            exerciseMenuAsHtml
        );

        const $ = cheerio.load(transformedExerciseMenu);
        jsonframe($);

        // return $('body')
        //     .scrape(exerciseMenuFrame)
        //     .exercises.map(exerciseUrl =>
        //         exerciseUrl.replace(/(\.{2}\/)+/g, 'www.exrx.net/')
        //     );

        const regex = /^(\.{2}\/){2}/g;

        return _.flow([
            ({ exercises }) =>
                _.filter(exercises, exercise => regex.test(exercise)),
            exercises =>
                exercises.map(exerciseUrl =>
                    exerciseUrl.replace(regex, 'www.exrx.net/')
                ),
            _.uniq,
            exercises => _.sortBy(exercises, exercise => exercise),
        ])($('body').scrape(exerciseMenuFrame));
    },
    scrapeExercise(exerciseAsHtml) {
        const transformedExercise = exerciseTransformer(exerciseAsHtml);

        const $ = cheerio.load(transformedExercise);
        jsonframe($);

        return $('body').scrape(exerciseFrame, { string: true });
    },
};
