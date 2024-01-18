const extract = require('extract-zip');
const fs = require('fs');

/*
  source: path to the ePub file
  dest: path to destination folder
*/
async function unzipFile(source, dest) {
  try {
    await extract(source, {dir: dest});
    await checkIfFileIsEpub(dest);
  } catch (err) {
  }
}

async function checkIfFileIsEpub(dest){
  const mimetype = dest + '/mimetype';
  fs.readFile(mimetype, 'utf8', function(err, data) {
    if (err) {
      throw err;
    } else {
      if (data !== 'application/epub+zip') {
        throw new Error('Not an ePub file');
      }
    }
  });
}


module.exports = {
  unzipFile
};
