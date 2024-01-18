const { unzipFile } = require('./lib/epub/zip');
const { compileContentFilesToHtml, beatifyHtml} = require('./lib/epub/html');
const {createOutputFiles, clearDirectory} = require("./lib/epub/file");
const {getPathToContentOpfFile} = require("./lib/epub/manifest");

/*
   To run: Create a writable folder in the root directory,
   and an output folder in that directory
 */

const epub = 'Alices Adventures in Wonderland';
// const epub = 'Around the World in 28 Languages';
// const epub = 'ong-gia-va-bien-ca';
// const epub = 'SachMoi.Net_tri-tue-loai-rua-suc-manh-den-tu-noi-tai-donna-denomme';
// const epub = 'kinh-trung-bo';

const epubPath  = __dirname + '/samples/' + epub + '.epub';
const unzipPath = __dirname + '/writable/unzip';
const outputPath = __dirname + '/writable/output';

global.pathToContent = '';

async function clearOutputFolder(){
  await clearDirectory(outputPath);
  await clearDirectory(unzipPath);
  console.log('Cleared output folder');
}

async function unZipFile(){
  await unzipFile(epubPath, unzipPath);
  console.log('Unzipped file');
}

async function getPathToContent(){
  const contentOpfPath = await getPathToContentOpfFile(unzipPath);
  global.pathToContent = contentOpfPath.substring(0, contentOpfPath.indexOf('content.opf'));
  console.log('Path to content read')
}

async function createFile(){
  await createOutputFiles(outputPath, epub, global.pathToContent);
  console.log('Created output files');
}

async function compileContent(){
  await compileContentFilesToHtml(global.pathToContent, outputPath);
  console.log('Compiled content files');
}

 clearOutputFolder()
  .then(unZipFile)
  .then(getPathToContent)
  .then(createFile)
  .then(compileContent)
  .catch(console.error);

