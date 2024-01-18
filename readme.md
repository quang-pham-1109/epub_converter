This is a simple converter that converts `.epub` to `.html`. Written mainly in Javascript and made used of regex and cheerio

## How to run
- Install dependencies
```
npm install
```
- Make sure that the folder writable is created and an output folder is created within it. If not
```
mkdir writable/output
```
- Put your epub file in the `samples` folder, and in `parse.js`, change the epub variable to the name of your file. Ex: convert `Alices Adventures in Wonderland.epub`
```javascript
const epub = 'Alices Adventures in Wonderland';
```
You can test by trying to convert some of the samples file

### Contribution
Any contribution is welcomed, I wrote this in 2 days so any suggestions is much appreciated.