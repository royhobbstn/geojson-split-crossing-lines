

const splitLines = require('./index');
const fs = require('fs').promises;

main();

async function main() {
    const geo_raw = await fs.readFile('./whole.geojson', 'utf8');
    const geo = JSON.parse(geo_raw);

    const split = splitLines(geo);

    await fs.writeFile('./split.geojson', JSON.stringify(split), 'utf8');
}
