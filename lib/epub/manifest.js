const {XMLParser} = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');

//Parse a given XML file and return an object of the content
async function parseContentFile(fileContent) {
  const option = {
    ignoreAttributes: false
  };
  const parser = new XMLParser(option);
  return parser.parse(fileContent);
}

//Get the content.opf path in container.xml
async function getPathToContentOpfFile(unzipPath){
  try {
    const containerContent = fs.readFileSync(path.join(unzipPath, '/META-INF/container.xml'), 'utf8');
    const container = await parseContentFile(containerContent);
    return path.join(unzipPath, container.container.rootfiles.rootfile['@_full-path']) ;
  } catch (e) {
    console.log(e);
  }
}

//Get ordered list of html items in spine tag
async function getOrderedHtmlItems(contentObject){
  const items = contentObject.package.spine.itemref.map(
      item => item['@_idref']
  )
  return items;
}

async function getPathToHtmlItemFromId(htmlId, contentObject){
  const items = contentObject.package.manifest.item;
  const htmlFilePath = items.filter(
      item => item['@_id'] === htmlId
  ).map(item => item['@_href']);
  return htmlFilePath;
}

async function getPathToCoverPage(contentObject){
  const packageObject = contentObject.package;

  //If guide doesn't exist return null
  if (packageObject.guide === undefined){
    return null;
  }
  const guides = contentObject.package.guide.reference;

  //If there is only one cover image, return the href
  if (guides.length === undefined){
    return guides['@_href'];
  }

  else {
    return guides.filter(
        guide => guide['@_type'] === 'cover'
    ).map(guide => guide['@_href']);
  }
}

async function getPathToCSS(contentObject){
  const items = contentObject.package.manifest.item;
  const cssFilePath = items
      .filter(
          item => item['@_media-type'] === 'text/css'
      )
      .map(item => item['@_href']);
  return cssFilePath;
}

async function getPathToImage(contentObject){
  const items = contentObject.package.manifest.item;
  const imageFilePath = items.filter(
      item => item['@_media-type'].includes('image')
  ).map(item => item['@_href'])
  return imageFilePath;
}

async function getPathToFont(contentObject){
  const items = contentObject.package.manifest.item;
  let fontPaths = [];
  for (const item of items){
    if(item['@_href'].includes('font')){
      fontPaths.push(item['@_href']);
    }
  }
  return fontPaths;
}

module.exports = {
  getOrderedHtmlItems,
  getPathToCoverPage,
  getPathToCSS,
  parseContentFile,
  getPathToImage,
  getPathToContentOpfFile,
  getPathToHtmlItemFromId,
  getPathToFont
};