var fs = require('fs')
  , mime = require('mime-types')
  , path = require('path')
  , CryptoJS = require("crypto-js");

// Given a file path, return the contents as a base64-encoded data: URI.
var asBase64DataURI = function(path) {
    let data = fs.readFileSync(path, 'binary');
    let buff = new Buffer.from(data, 'binary');
    let base64data = buff.toString('base64');
    let mimetype = mime.lookup(path);
    return 'data:' + mimetype + ';base64,' + base64data;
};

// Given a folder containing index.html plus other assets, return the contents
// of index.html with all asset references replaced with base64-encoded data:
// URIs.
var indexWithInlineAssets = function(workdir) {
    let assets = fs.readdirSync(workdir);
    let index = fs.readFileSync(path.join(workdir, 'index.html'), 'utf8');
    for (i in assets) {
        let dataURI = asBase64DataURI(path.join(workdir, assets[i]));
        index = index.replace(assets[i], dataURI);
    }
    return index;    
}

if (process.argv.length < 4) {
    console.log('usage: ' + process.argv[1] + ' <dir> <password>');
    process.exit(1);
}
var workdir = process.argv[2];
var passphrase = process.argv[3];

var contents = indexWithInlineAssets(workdir);
var encrypted = CryptoJS.AES.encrypt(contents, passphrase);

// Write base64-encoded encyrpted data as a variable "data" in data.js.
var jsonp = 'var data = "' + encrypted + '";';
fs.writeFileSync('data.js', jsonp)
