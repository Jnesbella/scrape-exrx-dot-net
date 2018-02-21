const fp = require('lodash/fp');

module.exports = function(exercisesDB) {
    return {
        async getExercises() {
            const allExercises = await exercisesDB.allDocs({
                include_docs: true,
            });

            return fp.flow(
                fp.map(e => e.doc),
                fp.map(fp.pick(['_id', 'name']))
            )(allExercises.rows);
        },
    };
};
