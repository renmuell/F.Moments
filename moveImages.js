const inputFolder = './assets/img/photos/';
const fs = require('fs');

fs.readdir(inputFolder + "in", (err, files) => {
    var result = [];
    if (files && files.length>0) {
        files.forEach(file => {
            if (file.toLowerCase().endsWith(".jpeg")) {
                result.push(inputFolder + "done/" + file)
                fs.rename(inputFolder + "in/" + file, inputFolder + "done/" + file, function (err) {
                    if (err) throw err
                    console.log('Successfully renamed - AKA moved!')
                })
            }
        });
    }

    var content = result.join("\r\n");
    content = content.replace(/ /g, "%20").replace(/\.\//g, "")
    fs.writeFile('new_files.txt', content, function (err) {
        if (err) return console.log(err);
        console.log('new_files.txt written');
      });
});

