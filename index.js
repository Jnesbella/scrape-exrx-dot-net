const fs = require('fs');

const { scrape } = require('./exrx-dot-com');

scrape().then(res => console.log(res));
