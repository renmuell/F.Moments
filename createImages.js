var Jimp = require("jimp");
const inputFolder = './assets/img/photos/';
const fs = require('fs');

fs.readdir(inputFolder, (err, files) => {
  if (files && files.length>0) {
    files.forEach(file => {
        if (file.toLowerCase().endsWith(".jpeg")) {
          resizeImage(file, Jimp.AUTO, 300);
          resizeImage(file, Jimp.AUTO, 200);
          resizeImage(file, Jimp.AUTO, 52);
        }
      });
  }
});

function resizeImage(fileName, width, height) {
  Jimp.read(inputFolder + fileName).then(function (image) {
    image
        .resize(width, height)
        .quality(60)
        .write(inputFolder + fileName.replace(".jpeg", "_"+(width == Jimp.AUTO? "auto" : width )+"x"+(height == Jimp.AUTO? "auto" : height) +".jpeg"));
  }).catch(function (e) {
    console.log(e, foler +fileName);
  });
}
