const express = require('express');

const { EXERCISES } = require('../db');

const router = express.Router();

router.get('/exercises', async (req, res, next) => {
    const exercises = await EXERCISES;
    res.send(await exercises.getExercises());
});

// async function test() {
//     const e = await EXERCISES;
//     const es = await e.getExercises();
//     console.log(es[1]);
// }
// test();

module.exports = router;
