## Usage

You need [Node.js and npm](https://nodejs.org/). You should also have git installed, but it's not mandatory.

Install dependencies

`npm install`

Run a development build...

`npm start`

Original setup came from `https://github.com/belohlavek/phaser-es6-boilerplate`

##SpriteSheet Builder

SpriteSheets and Texture Atlases have proven to help with performance. By drawing vector shapes into a spritesheet
we save on load time (nothing to download) and performance is still fast (because we draw the vectors to a spritesheet).

This repo includes one example using particles. Tests are as follows.

1. Storing each texture in memory individually the average frame time was ~4.5ms. We see in chrome dev tools a `bindTexture` call. I assume this is where textures are uploaded to GPU as there are 3 different textures to draw.
2. Using SpriteSheetBuilder the average frame time was ~3ms. There is no `bindTexture` call as all particles are drawn from the same texture.


###Example

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

## ListView

![](http://i.imgur.com/XgdgqYX.gif)

Making iOS-like ListViews are pretty common. It's also common that when you make them yourself performance suffers. Here is a start at making a high-performance ListView for Phaser. Currently the example adds 500 items to the ListView and performance is holding up. With that said, if the list view is truely infinite we should think about completely removing items beyond a certain threshold. 

This approach uses a mask to mask items that overlap the bounds. (Not sure if this is the fastest method? But it seems pretty fast actually).
The main performance boost comes from autoculling items. Chrome actually still runs at 60fps without culling, but FF slowed down dramatically and showed 500 draw calls in the canvas inspector. After culling the drawing calls were reduced to ~10 and fps back up to 60.

###Example

```
create() {

    var w = 600
    var h = 100

    this.listView = new ListView(this.game, this.world, new Phaser.Rectangle(this.world.centerX - w/2, 120, w, 400), {
      overflow: 100,
      autocull: true
    })
    
    for (var i = 0; i < 500; i++) {
      let color = Phaser.Color.getRandomColor()
      let group = this.game.make.group(null)
      let g = this.game.add.graphics(0, 0, group)
      g.beginFill(color)
       .drawRect(0, 0, w, h)

      let txt = this.game.add.text(w/2, h/2, i, {font: "40px Arial", fill: "#000"}, group)
      txt.anchor.set(.5)
      let img = this.game.add.image(0, 0, group.generateTexture())
      this.listView.add(img)
    }
  }
  
  ```
![](http://i.imgur.com/Sp5aE0H.gif)
