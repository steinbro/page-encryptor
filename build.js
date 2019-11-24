// page-encryptor (https://github.com/steinbro/page-encryptor)
// Copyright (c) 2019 Daneil W. Steinbrook
var fs = require('fs')
  , mime = require('mime-types')
  , path = require('path')
  , CryptoJS = require("crypto-js");

// Convert data to base64 data: URI. Filename is needed for proper mimetype.
var asBase64DataURI = function(data, filename) {
    let buff = new Buffer.from(data, 'binary');
    let base64data = buff.toString('base64');
    let mimetype = mime.lookup(filename);
    return 'data:' + mimetype + ';base64,' + base64data;
};

// Recursively replace asset references with encoded data.
var recurseReplaceAssets = function(workdir, filename, assets) {
    let data = fs.readFileSync(path.join(workdir, filename), 'binary');
    for (var i in assets) {
        if (assets[i].isFile() && data.includes(assets[i].name)) {
            console.debug('In ' + filename + ', found ' + assets[i].name);
            referencedData = recurseReplaceAssets(workdir, assets[i].name, assets);
            data = data.replace(assets[i].name, asBase64DataURI(referencedData, assets[i].name));
        }
    }
    return data;
}

// Given a folder containing index.html plus other assets, return the contents
// of index.html with all asset references replaced with base64-encoded data:
// URIs.
var indexWithInlineAssets = function(workdir) {
    let assets = fs.readdirSync(workdir, {withFileTypes: true});
    return recurseReplaceAssets(workdir, 'index.html', assets);
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
