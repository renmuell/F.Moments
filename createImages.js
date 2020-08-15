
// https://www.npmjs.com/package/jimp

var Jimp = require("jimp");
const inputFolder = './assets/img/photos/';
const fs = require('fs');

fs.readdir(inputFolder + "in", (err, files) => {
  if (files && files.length>0) {
    files.forEach(file => {
        if (file.toLowerCase().endsWith(".jpeg")) {
          resizeImage(file, Jimp.AUTO, 300);
          resizeImage(file, Jimp.AUTO, 200);
          resizeImage(file, Jimp.AUTO, 50);
        }
      });
  }
});

function resizeImage(fileName, width, height) {
  Jimp.read(inputFolder+ "in/" + fileName).then(function (image) {
    image
        .resize(width, height)
        .quality(60)
        .write(inputFolder + "done/" + fileName.replace(".jpeg", "-"+(width == Jimp.AUTO? "AUTO" : width )+"x"+(height == Jimp.AUTO? "AUTO" : height) +".jpeg"));
  }).catch(function (e) {
    console.log(e, foler +fileName);
  });
}
