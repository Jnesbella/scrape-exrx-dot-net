module.exports = {
    exerciseDirectoryFrame: {
        exerciseGroups: ['.exercise-directory-container > li > a @ href'],
    },
    exerciseMenuFrame: {
        exercises: ['a @ href'],
    },
    exerciseFrame: {
        name: '.exercise-name-container h1',
        video: '.ExVideo < html || src=\\"(.+?)\\"',
        muscleGroups: {
            _s: '.exercise-section.muscles .muscle-group',
            _d: [
                {
                    groupName: '.muscle-group-title',
                    // i tags can have some comments
                    // http://www.exrx.net/WeightExercises/Quadriceps/SBSquatSelfSpot.html
                    muscles: ['.muscle-group-list > li > a'],
                    // "http://www.exrx.net/WeightExercises/TransverseAbdominus/AbdominalVacuum.html"
                    // look there ^ for some interesting muscle group use case
                },
            ],
        },
        classification: {
            _s: '.exercise-section.classification',
            _d: {
                utility: 'tr:contains("Force:") a',
                mechanics: 'tr:contains("Mechanics:") a',
                force: 'tr:contains("Force:") a',
            },
        },
        instructions: '.exercise-section.instructions < html',
    },
};
