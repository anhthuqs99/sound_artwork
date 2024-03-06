# sound_artwork

## Install static HTTP server

npm i http-server -g

## Install minified package

npm install uglify-js -g

## Minified js files before serve

uglifyjs web3.min.js sound.js script.js --module -o sound-piece.js

## Run test

http-server ./src
