Package a static HTML page and its assets into an encrypted blob, that is decrypted in JavaScript client-side.

### Usage
Starting with a directory like:
```
my-page/
    index.html
    image1.jpg
    image2.jpg
    style.css
    code.js
```
1. Run: node bulk.js my-page/ "some password"
2. A file data.js is created, containing an encrypted version of index.html with JPEG/CSS/JS assets embedded inline.
3. Serve data.js alongside index.html (from this repo). It contains the minimal JavaScript to prompt the user for a password and decrypt the contents from data.js.
