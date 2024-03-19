# sound_artwork

## Install static HTTP server

```bash
npm i http-server -g
```

## Install minified package

```bash
npm install uglify-js -g
```

## Minified js files before serve

```bash
uglifyjs src/web3.min.js src/ens.js src/buffer.js src/punycode.js src/sound.js src/script.js --module -o src/sound-piece.js
```

## Run test

```bash
http-server ./src
```
