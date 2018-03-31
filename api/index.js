const https = require('https');
const http = require('http');

const ExercisesRouter = require('./exercises-router');

function start(app, db) {
    app.use(ExercisesRouter(db));

    http.createServer(app).listen(80);
    // https.createServer(options, app).listen(443);
}

function stop() {}

module.exports = function(app, db) {
    return {
        start: () => start(app, db),
        stop,
    };
};
