const fp = require('lodash/fp');

// const exercise = {
//     equipment: [],
//     muscles: {
//         target: [],
//         synergist: [],
//         ect: []
//     }
// }

function removeParens(str) {
    return str.replace(/\s+\(.+\)$/, '');
}

function toLowerCase(str) {
    return str.toLowerCase();
}

function massageMuscleGroupName(name) {
    const normalizeTarget = toTest =>
        /^target/i.test(toTest) ? 'target' : toTest;

    function convertNameToArray(nameToArrayify) {
        const regexMultiGroup = /\s+\/\s+/;

        return regexMultiGroup.test(nameToArrayify)
            ? nameToArrayify.split(regexMultiGroup)
            : [nameToArrayify];
    }

    return fp.flow(
        toLowerCase,
        removeParens,
        normalizeTarget,
        convertNameToArray
    )(name);
}

function massageMuscleGroupMuscles(muscles) {
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

    return fp.flow(
        fp.map(toLowerCase),
        fp.map(removeParens),
        fp.map(normalizeMuscle)
    )(muscles);
}

function massageMuscleGroups(exercise) {
    const { muscleGroups, ...sansMuscles } = exercise;

    return fp.flow(
        fp.reduce((groups, group) => {
            const { groupName, muscles } = group;

            const names = massageMuscleGroupName(groupName);
            const massagedMuscles = massageMuscleGroupMuscles(muscles);

            let updatedMuscleGroups = { ...groups };
            for (let name of names) {
                const existing = updatedMuscleGroups[name] || [];
                const toAdd = {
                    [name]: fp.uniq([...existing, ...massagedMuscles]),
                };

                updatedMuscleGroups = { ...updatedMuscleGroups, ...toAdd };
            }

            return updatedMuscleGroups;
        }, {}),
        muscles => ({ ...sansMuscles, muscles })
    )(muscleGroups);
}

function addExerciseEquipment(exercise) {
    return {
        ...exercise,
        equipment: [],
    };
}

function massageExerciseData(exercise) {
    return fp.flow(massageMuscleGroups, addExerciseEquipment)(exercise);
}

module.exports = {
    massageExerciseData,
};
