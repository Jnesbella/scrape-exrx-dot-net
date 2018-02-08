const requireText = require('require-text');

module.exports = {
    benchPressMock: requireText('./bench-press-mock.html', require),
    exerciseDirectoryMock: requireText(
        './exercise-directory-mock.html',
        require
    ),
    backExercisesMock: requireText('./back-exercises-mock.html', require),
};
