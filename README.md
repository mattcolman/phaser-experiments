## Usage

You need [Node.js and npm](https://nodejs.org/). You should also have git installed, but it's not mandatory.

Install dependencies

`npm install`

Run a development build...

`npm start`

Original setup came from `https://github.com/belohlavek/phaser-es6-boilerplate`

Example

```
create() {
  this.buildTextureAtlas()
  let square   = this.game.add.image(100, 100, 'new-atlas', 'square')
  let triangle = this.game.add.image(300, 100, 'new-atlas', 'triangle')
}

buildTextureAtlas() {
  let ssb = new SpriteSheetBuilder(this.game)
  ssb.addFrame('square', square())
  ssb.addFrame('triangle', triangle())
  ssb.buildToCache('new-atlas')
}

square() {
  let g = this.game.make.graphics()
  g.beginFill(0x4ebc96)
   .drawRect(0, 0, 100, 100)
  return g.generateTexture()
}

triangle() {
  let g = this.game.make.graphics()
  g.beginFill(0xee9a2d)
   .moveTo(0, 0)
   .lineTo(100, 0)
   .lineTo(0, 100)
   .lineTo(0, 0)
  return g.generateTexture()
}
```


