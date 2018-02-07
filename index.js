const fs = require('fs');

const { scrape } = require('./exrx-dot-com');

const data = JSON.stringify(scrape());
