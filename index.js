//

const geojsonRbush = require('geojson-rbush').default;
const bBox = require('@turf/bbox').default;
const lineSplit = require('@turf/line-split').default;
const booleanEqual = require('@turf/boolean-equal').default;
const lineLength = require('@turf/length').default;

const splitLines = (geo, debugBoolean) => {

  const log = debugBoolean ? console.log : () => {};

  const features = Array.isArray(geo) ? [...geo] : [...geo.features];

  let last_id = 0;

  features.forEach((f, index) => {
    last_id = 100 + index;
    f.properties.__parentFeature__ = index;
    f.properties.__prId__ = last_id;
  });

  const tree = geojsonRbush();
  tree.load(features);

  const updated = [];

  for (let i = 0; i < features.length; i++) {
    const result = tree.search(bBox(features[i]));

    log(`\nFeature: ${i}`);

    if (result.features.length > 1) {
      log(`There are ${result.features.length} potential matches`);

      // loop through all index matches
      for (let j = 0; j < result.features.length; j++) {

        const match = result.features[j];
        log(`match ${j}: `);

        if (!booleanEqual(features[i], match)) {

          const f_root = features[i].properties.__parentFeature__;
          const m_root = match.properties.__parentFeature__;

          if (f_root !== m_root) {

            const split = lineSplit(features[i], match);

            if (split.features.length > 1) {
              log(`can be split into ${split.features.length} features`);

              const falsePositive = split.features.some(f => {
                // sometimes turf line-split can unnecessarily cut a line
                // leaving a main segment and a microscopic segment
                const len = lineLength(f, {units: 'kilometers'});
                return len < 0.0000000001;
              });

              if(!falsePositive) {
                split.features.forEach((segment, index) => {
                  const copy_properties = Object.assign({}, features[i].properties);
                  const reconstructed = Object.assign(segment, {properties: copy_properties});
                  last_id++;
                  reconstructed.properties.__prId__ = last_id;
                  features.push(reconstructed);
                  log(`Adding segment ${index} back to the loop as #${last_id}`);
                });

                log('No further action will be taken on this feature.');
                break;
              }

            } else {
              log(` - it could not be split: ${features[i].properties.__prId__}`);
            }

          } else {
            log(' - this is a parent feature');
          }

        } else {
          log(' - its the same feature');
        }

        if (j === result.features.length - 1) {
          log(`Can't reduce any further, adding to final array. \n`);
          updated.push(features[i]);
        }

      }

    } else {
      log(`Did not intersect with anything: ${features[i].properties.__prId__}`);
      log('Adding to final array.\n');
      updated.push(features[i]);
    }
  }

  if(!debugBoolean) {
    features.forEach(f=> {
      delete f.properties.__prId__;
      delete f.properties.__parentFeature__;
    })
  }

  return {
    "type": "FeatureCollection",
    "features": updated
  }

};

exports.splitLines = splitLines;

module.exports = splitLines;
