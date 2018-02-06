const rp = require('request-promise');

const {
    exerciseDirectoryMock,
    backExercisesMock,
} = require('./mock/utils-exrx');

const {
    scrapeExercise,
    scrapeExerciseDirectory,
    scrapeExerciseMenu,
} = require('./scrapers');

// rp({
//     uri:
//         'http://www.exrx.net/WeightExercises/PectoralSternal/BBBenchPress.html',
//     transform: scrapeExercise,
// })
//     .then(res => console.log(res))
//     .catch(rej => console.log(rej));

const root = 'www.exrx.net/Lists/Directory.html';

module.exports = {
    scrape() {
        // get muscle groups
        // get exercises

        return scrapeExerciseMenu(backExercisesMock);
    },
};
