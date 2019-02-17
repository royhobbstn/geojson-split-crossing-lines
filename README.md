# geojson-split-crossing-lines
Turn a GeoJSON FeatureCollection of crossing lines into a clean network dataset.

```bash
npm install geojson-split-crossing-lines --save
```

```javascript
const splitLines = require('geojson-split-crossing-lines');
const fs = require('fs').promises;

main();

async function main() {
    // load and parse GeoJSON LineString dataset
    const geo_raw = await fs.readFile('./whole.geojson', 'utf8');
    const geo = JSON.parse(geo_raw);

    const split = splitLines(geo);

    await fs.writeFile('./split.geojson', JSON.stringify(split), 'utf8');
}
```

For more information, please see my blog post; [Cleaning a GeoJSON Network](https://www.danieltrone.com/post/clean-geojson-network-javascript/#split-crossing-lines).
