const PouchDB = require('pouchdb');
const fp = require('lodash/fp');

const exrxDotNet = require('./exrx-dot-net');

async function loadExerciseData() {
    return await exrxDotNet.scrape();
}

function storeExerciseData() {}

function transformScrapedExerciseToDatabaseEntity({ source, ...exerciseData }) {
    const _id = source;
    return {
        ...exerciseData,
        _id,
    };
}

function massageMuscleGroups(exercise) {
    const regexTarget = /^Target/i;
    const regexWithParens = /\s+\(.+\)$/;
    const regexMultiGroup = /\s+\/\s+/;

    const massagedMuscleGroups = fp.flow(
        fp.reduce((groups, group) => {
            const { groupName, muscles } = group;
            let groupNameSansParens = groupName.replace(regexWithParens, '');
            let names = [groupNameSansParens];

            if (regexTarget.test(groupNameSansParens)) {
                massagedGroupName = ['Target'];
            }
            if (regexMultiGroup.test(groupNameSansParens)) {
                names = groupNameSansParens.split(regexMultiGroup);
            }

            let updatedMuscleGroups = { ...groups };
            for (let name of names) {
                const existing = updatedMuscleGroups[name] || [];
                const toAdd = { [name]: [...existing, ...muscles] };

                updatedMuscleGroups = { ...updatedMuscleGroups, ...toAdd };
            }

            // const temp = fp.each((name, i, coll) => {
            //     console.log(coll);
            //     return {
            //         ...groups,
            //         [name]: [...(groups[name] || []), ...muscles],
            //     };
            // })(names);
            // console.log(updatedMuscleGroups);
            return updatedMuscleGroups;
        }, {}),
        fp.map.convert({ cap: false })((muscles, groupName) => {
            return { groupName, muscles: fp.uniq(muscles) };
        })
    )(exercise.muscleGroups);

    return {
        ...exercise,
        muscleGroups: massagedMuscleGroups,
    };
}

function massageExerciseData(exercise) {
    return fp.flow(massageMuscleGroups)(exercise);
}

function getMuscleGroups(exercises) {
    return fp.flow(
        fp.map(exercise => {
            return fp.map(group => group.groupName)(
                exercise.muscleGroups || []
            );
        }),
        fp.flatten,
        fp.uniq,
        fp.sortBy(name => name)
    )(exercises);
}

function getMuscles(exercises) {
    return fp.flow(
        fp.map(exercise => {
            return fp.map(group => {
                return group.muscles;
            })(exercise.muscleGroups);
        }),
        fp.flatten,
        fp.flatten,
        fp.uniq,
        fp.sortBy(name => name)
    )(exercises);
}

async function run() {
    const exercises = await loadExerciseData();

    const massagedExercises = fp.map(massageExerciseData)(exercises);

    console.log('-- MUSCLE GROUPS --', getMuscleGroups(massagedExercises));
    console.log('-- MUSCLES --', getMuscles(massagedExercises));
    // getMuscles(massagedExercises);

    // const db = new PouchDB('exrxDotNet');
    // for (let exercise of exercises) {
    //     await db.put(transformScrapedExerciseToDatabaseEntity(exercise));
    // }

    // exerciseShape = {
    //     id,
    //     name,
    //     muscles: {
    //         target,
    //         other,
    //     },
    //     videoUrl,
    //     instructions,
    //     force, // push | pull
    //     mechanic, // isolated | compound
    //     instructions,
    //     equipment,
    // }
    // const exerciseDb = new PouchDB('exercises');
}

run();
