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
    const regexTarget = /^target/i;
    const regexWithParens = /\s+\(.+\)$/;
    const regexMultiGroup = /\s+\/\s+/;

    const removeParens = str => str.replace(regexWithParens, '');

    const normalizeTriceps = muscle => {
        if (!/^triceps/i.test(muscle)) return muscle;
        else if (/long head$/i.test(muscle))
            return 'triceps brachii, long head';
        return 'triceps brachii';
    };

    const normalizeTraps = muscle =>
        /^trapezius/i.test(muscle) && !/fibers$/i.test(muscle)
            ? `${muscle} fibers`
            : muscle;

    const normalizeMuscle = fp.flow(normalizeTriceps, normalizeTraps);

    const massageGroupName = fp.flow(
        groupName => groupName.toLowerCase(),
        removeParens,
        nameWithoutParens =>
            regexTarget.test(nameWithoutParens) ? 'target' : nameWithoutParens,
        nameToArrayify =>
            regexMultiGroup.test(nameToArrayify)
                ? nameToArrayify.split(regexMultiGroup)
                : [nameToArrayify]
    );
    const massageMuscleList = fp.flow(
        fp.map(muscleName => muscleName.toLowerCase()),
        fp.map(removeParens),
        fp.map(normalizeMuscle)
    );

    const massagedMuscleGroups = fp.flow(
        fp.reduce((groups, group) => {
            const { groupName, muscles } = group;

            const names = massageGroupName(groupName);
            const massagedMuscles = massageMuscleList(muscles);

            let updatedMuscleGroups = { ...groups };
            for (let name of names) {
                const existing = updatedMuscleGroups[name] || [];
                const toAdd = {
                    [name]: [...existing, ...massagedMuscles],
                };

                updatedMuscleGroups = { ...updatedMuscleGroups, ...toAdd };
            }

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
