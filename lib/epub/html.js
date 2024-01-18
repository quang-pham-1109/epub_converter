const fs= require('fs');
const pretty = require('pretty');
const cheerio = require('cheerio');
const {parseContentFile, getOrderedHtmlItems, getPathToHtmlItemFromId, getPathToCoverPage, getPathToImage} = require('./manifest');
const {loadContentFile} = require("./file");
const path = require('path');

//Compile all content files to html
async function compileContentFilesToHtml(pathToContent, outputPath) {
  //Parse XML file
  const fileContent = await loadContentFile(pathToContent);
  const contentObject = await parseContentFile(fileContent);

  //Get all the html files
  const orderedHtmlIds = await getOrderedHtmlItems(contentObject);

  let extractedContent = [];

  //Add Cover Page if exists
  const coverPath = await getPathToCoverPage(contentObject);
  if (coverPath !== null){
    if (coverPath.includes(".jpg") || coverPath.includes(".png")) {
      extractedContent.push(await addCoverImageToHtml(coverPath));
    }
    //If cover page is not an image, add it to output.html
    else {
      extractedContent.push(await addCoverPageToHtml(pathToContent, coverPath));
      await orderedHtmlIds.shift();
    }
  }

  //Add content from each html file to output.html
  for (const htmlId of orderedHtmlIds){
      const htmlPath = await getPathToHtmlItemFromId(htmlId, contentObject);
      const itemContent = await readHtmlFiles(path.join(pathToContent, String(htmlPath)));
      const content = await extractContent(itemContent);
      extractedContent.push(content);
  }
  await modifyHtmlFile(outputPath, extractedContent.join(''));
}

//This function receives an input array of strings and modify output.html
async function modifyHtmlFile(outputPath, newText) {
  fs.readFile(path.join(outputPath, '/output.html'), 'utf8', function (err, data) {
    if (err){
      throw err;
    }
    else {
      const bodyTagIndex = data.indexOf("<body>");
      const modifiedData = data.slice(0, bodyTagIndex + 6) + newText + data.slice(bodyTagIndex + 6);

      fs.writeFile(path.join(outputPath, '/output.html'), pretty(modifiedData), "utf8", function (err) {
        if (err) return err;
      });
    }
  });
}

async function addCoverImageToHtml(coverImagePath) {
  return (`
        <div style="text-align: center">
            <img src="${coverImagePath}">
          </div>
      `);
}

async function addCoverPageToHtml(pathToContent, coverPath) {
  const content = fs.readFileSync(path.join(pathToContent, String(coverPath)), 'utf8');
  const extractedContent = await extractContent(content);

  //Parse XML file
  const fileContent = await loadContentFile(pathToContent);
  const contentObject = await parseContentFile(fileContent);
  const imagePaths = await getPathToImage(contentObject);

  if (imagePaths[0].split('/').length === 3){
    const imageFileName = path.join(imagePaths[0].split('/')[1], imagePaths[0].split('/')[2]);
    const imageSrc = `${imageFileName}`;
    const $ = cheerio.load(extractedContent, {xmlMode: true});
    $('image').attr('xlink:href', imageSrc);
    return $.html();
  }

  //This section is to remove the "../" in the src attribute of the img tag
  const $ = cheerio.load(extractedContent, {xmlMode: true});
  $('image').attr('xlink:href', function (i, val) {
    return val.replace('../', '');
  });

  return $.html();
}

async function readHtmlFiles(htmlPath){
  let html = fs.readFileSync(htmlPath, 'utf8');

  //This section is to remove the "../" in the src attribute of the img tag
  const $ = cheerio.load(html);

  // Select all image elements and update their src attribute
  $('img').each((index, element) => {
    const src = $(element).attr('src');
    if (src) {
      // Modify the src attribute by removing "../"
      const newSrc = src.replace('../', '');
      $(element).attr('src', newSrc);
    }
  });
  return $.html();
}

//Return a string of content that is in between the body tag in the XHTML file
async function extractContent(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const bodyContent = $('body').html();
  return bodyContent;
}

module.exports = {
  compileContentFilesToHtml,
};