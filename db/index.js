const setup = require('./setup');
const Exercises = require('./exercises-table');

module.exports = async function() {
    const { exercisesDB } = await setup();

    return {
        EXERCISES: Exercises(exercisesDB),
    };
};
