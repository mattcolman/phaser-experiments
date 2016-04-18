## Usage

You need [Node.js and npm](https://nodejs.org/). You should also have git installed, but it's not mandatory.

Install dependencies

`npm install`

Run a development build...

`npm start`

Original setup came from `https://github.com/belohlavek/phaser-es6-boilerplate`

##Idea

SpriteSheets and Texture Atlases have proven to help with performance. By drawing vector shapes into a spritesheet
we save on load time (nothing to download) and performance is still fast (because we draw the vectors to a spritesheet).

This repo includes one example using particles. Tests are as follows.

1. Storing each texture in memory individually the average frame time was ~4.5ms. We see in chrome dev tools a `bindTexture` call. I assume this is where textures are uploaded to GPU as there are 3 different textures to draw.
2. Using SpriteSheetBuilder the average frame time was ~3ms. There is no `bindTexture` call as all particles are drawn from the same texture.


##Example

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


