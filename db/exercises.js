const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
const fp = require('lodash/fp');

const exerciseDB = new PouchDB('build/db/exercises');

function transformScrapedExerciseToDatabaseEntity({ source, ...exerciseData }) {
    const _id = source;
    return {
        ...exerciseData,
        _id,
    };
}

async function init(exercises) {
    for (let exercise of exercises) {
        try {
            await exerciseDB.put(
                transformScrapedExerciseToDatabaseEntity(exercise)
            );
        } catch (err) {
            console.log('-- ERR - db.put --', err);
        }
    }

    await exerciseDB.createIndex({
        index: { fields: ['name'] },
    });

    // search exercise names for barbell
    // try {
    //     const filtered = await db.find({
    //         selector: {
    //             name: { $regex: /barbell/i },
    //         },
    //         fields: ['_id', 'name'],
    //     });

    //     console.log(filtered.docs);
    // } catch (err) {
    //     console.log('-- ERR - db.find --', err);
    // }
}

module.exports = {
    // TODO do NOT expose a function that lets exercises to be added willy-nilly
    init,
    async getExercises() {
        const exercises = await db.allDocs({ include_docs: true });

        return fp.flow(fp.map(e => e.doc), fp.map(fp.pick(['_id', 'name'])))(
            exercises.rows
        );
    },
};
