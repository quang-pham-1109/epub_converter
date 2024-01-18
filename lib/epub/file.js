const fs = require('fs');
const path = require('path');
const {getPathToCSS, getPathToImage, parseContentFile, getPathToFont} = require("./manifest.js");

//Read content.opf file
async function loadContentFile(pathToContent) {
  try {
    return fs.readFileSync(path.join(pathToContent, 'content.opf'), 'utf8');
  } catch {
    console.log("Could not find content.opf file");
  }
}

//Clear all folders and files in a given directory
async function clearDirectory(outputPath) {
  if (fs.existsSync(outputPath)) {
    const files = fs.readdirSync(outputPath);
    for (const file of files) {
      const filePath = path.join(outputPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        await clearDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
  }
}

async function createOutputFiles(outputPath, epub, pathToContent){
  //Parse XML file
  const fileContent = await loadContentFile(pathToContent);
  const contentObject = await parseContentFile(fileContent);

  //CSS
  const cssPaths = await getPathToCSS(contentObject);
  for (const cssPath of cssPaths) {
    await createDir(cssPath, outputPath);
    await copyFile(pathToContent, outputPath, cssPath);
  }

  //HTML
  await createBoilerPlateHTML(epub, cssPaths, outputPath);
  //Images
  const imagePath = await getPathToImage(contentObject);
  for (const image of imagePath){
    await createDir(image, outputPath);
    await copyFile(pathToContent, outputPath, image);
  }

  //Font
  const fontPaths = await getPathToFont(contentObject);
  if (fontPaths.length !== 0) {
    for (const fontPath of fontPaths) {
      await createDir(fontPath, outputPath);
      await copyFile(pathToContent, outputPath, fontPath);
    }
  }
}

//Create the folder to hold the output files such as font, css, images, etc.
async function createDir(inputPath, outputPath) {
  const filePaths = String(inputPath).split('/');
  if(filePaths.length === 1){
    return;
  }
  else if(filePaths.length === 2) {
    if (!fs.existsSync(path.join(outputPath, filePaths[0]))) {
      fs.mkdirSync(path.join(outputPath, filePaths[0]), {recursive: true});
    }
  }
  else if(filePaths.length === 3){
    if (!fs.existsSync(path.join(outputPath, filePaths[1]))) {
      fs.mkdirSync(path.join(outputPath, filePaths[1]), {recursive: true});
    }
  }
}

async function createBoilerPlateHTML(title, cssPaths, outputPath) {
  let boilerPlateHtml = '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '    <meta charset="UTF-8">\n' +
      '    <title>' + title + '</title>\n'

  //Link CSS file
  for (const cssPath of cssPaths) {
    boilerPlateHtml += '<link rel="stylesheet" href="' + cssPath + '">\n';
  }

  boilerPlateHtml += '</head>\n' +
      '<body>\n' +
      '\n' +
      '</body>\n' +
      '</html>';
  fs.writeFileSync(path.join(outputPath, '/output.html'), boilerPlateHtml);
}

async function copyFile(pathToContent, outputPath, filePath) {
  const splitFilePath = filePath.split('/');
  let outputFilePath = '';
  if (splitFilePath.length >= 3) {
    outputFilePath = splitFilePath.slice(-2).join('/');
  } else {
    outputFilePath = filePath;
  }

  const fileOutputPath = path.join(outputPath, outputFilePath);
  const fileInputPath = path.join(pathToContent, filePath);
  fs.writeFileSync(fileOutputPath, "");
  fs.copyFileSync(fileInputPath, fileOutputPath);
}

module.exports = {
  loadContentFile,
  clearDirectory,
  createOutputFiles
};