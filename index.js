const fs = require('fs');

const { scrape } = require('./exrx-dot-com');

const data = JSON.stringify(scrape());

fs.writeFile('tmp/test.json', data, err => {
    if (err) throw err;

    console.log('The file was saved!');
});
