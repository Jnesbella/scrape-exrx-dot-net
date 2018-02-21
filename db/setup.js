const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
const fp = require('lodash/fp');

const exrxDotNet = require('../exrx-dot-net');
const loadExerciseData = () => exrxDotNet.scrape();

function transformScrapedExerciseToDatabaseEntity({ source, ...exerciseData }) {
    const _id = source;
    return {
        ...exerciseData,
        _id,
    };
}

async function initExerciseDB() {
    const exerciseDB = new PouchDB('build/db/exercises');
    const exercises = await loadExerciseData();

    for (let exercise of exercises) {
        try {
            await exerciseDB.put(
                transformScrapedExerciseToDatabaseEntity(exercise)
            );
        } catch (err) {
            // console.log('-- ERR - db.put --', err);
        }
    }

    // await exerciseDB.createIndex({
    //     index: { fields: ['name'] },
    // });

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

    return exerciseDB;
}

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
    exercisesDB: initExerciseDB(),
};
