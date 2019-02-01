

const splitLines = require('./index');
const geo = require('./geo.json');
const fs = require('fs');

const split = splitLines(geo, true);

fs.writeFileSync('./full_network.geojson', JSON.stringify(split), 'utf8');