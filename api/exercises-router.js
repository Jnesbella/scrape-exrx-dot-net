const express = require('express');

module.exports = function({ EXERCISES }) {
    const router = express.Router();

    router.get('/exercises', async (req, res, next) => {
        res.send(await EXERCISES.getExercises());
    });

    return router;
};
