/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const tar = require('tar');

let url =
  'https://raw.githubusercontent.com/GitSquared/node-geolite2-redist/master/redist/GeoLite2-Country.tar.gz';

// let citiesUrl =
//   'https://raw.githubusercontent.com/GitSquared/node-geolite2-redist/master/redist/GeoLite2-City.tar.gz';

if (process.env.MAXMIND_LICENSE_KEY) {
  url =
    `https://download.maxmind.com/app/geoip_download` +
    `?edition_id=GeoLite2-Country&license_key=${process.env.MAXMIND_LICENSE_KEY}&suffix=tar.gz`;
}

const dest = path.resolve(__dirname, '../node_modules/.geo');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

const download = url =>
  new Promise(resolve => {
    https.get(url, res => {
      resolve(res.pipe(zlib.createGunzip({})).pipe(tar.t()));
    });
  });

download(url).then(
  res =>
    new Promise((resolve, reject) => {
      res.on('entry', entry => {
        if (entry.path.endsWith('.mmdb')) {
          const filename = path.join(dest, path.basename(entry.path));
          entry.pipe(fs.createWriteStream(filename));
        }
      });

      res.on('error', e => {
        reject(e);
      });
      res.on('finish', () => {
        resolve();
      });
    }),
);
// download(citiesUrl).then(
//   res =>
//     new Promise((resolve, reject) => {
//       res.on('entry', entry => {
//         if (entry.path.endsWith('.mmdb')) {
//           const filename = path.join(dest, path.basename(entry.path));
//           entry.pipe(fs.createWriteStream(filename));
//         }
//       });

//       res.on('error', e => {
//         reject(e);
//       });
//       res.on('finish', () => {
//         resolve();
//       });
//     }),
// );
