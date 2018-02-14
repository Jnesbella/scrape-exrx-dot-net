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

            return fp.each(name => {
                return {
                    ...groups,
                    [name]: [...(groups[name] || []), ...muscles],
                };
            })(names);
        }, {}),
        fp.map((groupName, muscles) => {
            return {
                groupName,
                muscles: fp.uniq(muscles),
            };
        })
    )(exercise.muscleGroups);

    // console.log(massagedMuscleGroups);

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
        fp.uniq
    )(exercises);
}

function getMuscles(exercises) {
    return _.flow([
        () =>
            exercises.map(exercise =>
                exercise.muscleGroups.map(group => group.muscles)
            ),
        arrOfGroups => _.flatten(arrOfGroups),
        arrOfMuscles => _.flatten(arrOfMuscles),
        muscles => _.uniq(muscles),
    ])();
}

async function run() {
    const exercises = await loadExerciseData();

    const massagedExercises = fp.map(massageExerciseData)(exercises);

    console.log('-- MUSCLE GROUPS --', getMuscleGroups(massagedExercises));
    // console.log('-- MUSCLES --', getMuscles(exercises));

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
