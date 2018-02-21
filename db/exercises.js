const fp = require('lodash/fp');

module.exports = async function(exercisesDB) {
    const exercises = await exercisesDB;
    // console.log(await exercisesDB.allDocs());

    return {
        async getExercises() {
            const allExercises = await exercises.allDocs({
                include_docs: true,
            });

            // console.log(allExercises.rows[1].doc);

            return fp.flow(
                fp.map(e => e.doc),
                fp.map(fp.pick(['_id', 'name']))
            )(allExercises.rows);
        },
    };
};
