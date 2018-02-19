const exercisesDB = require('./exercises');

const exrxDotNet = require('../exrx-dot-net');
const loadExerciseData = () => exrxDotNet.scrape();

function getMuscleGroups(exercises) {
    return fp.flow(
        fp.map(exercise => {
            return fp.map.convert({ cap: false })((val, key) => key)(
                exercise.muscles
            );
        }),
        fp.flatten,
        fp.uniq,
        fp.sortBy(name => name)
    )(exercises);
}

function getMuscles(exercises) {
    return fp.flow(
        fp.map(({ muscles }) => fp.map(val => val)(muscles)),
        fp.flatten,
        fp.flatten,
        fp.uniq,
        fp.sortBy(name => name)
    )(exercises);
}

module.exports = {
    async init() {
        exercisesDB.init(await loadExerciseData());
    },
    exercises: exercisesDB,
};
