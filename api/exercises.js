const express = require('express');

const { exercises } = require('../db');

const router = express.Router();
router.get('/exercises', (req, res, next) => {
    res.send(await db.getExercises());
});

moduel.exports = router;
