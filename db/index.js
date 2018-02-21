const { exercisesDB } = require('./setup');
const Exercises = require('./exercises');

module.exports = {
    EXERCISES: Exercises(exercisesDB),
};
