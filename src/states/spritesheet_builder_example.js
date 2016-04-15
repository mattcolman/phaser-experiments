import GameState from './game_state';
import _ from 'lodash';
import SpriteSheetBuilder from '../spritesheet_builder'

var Util = {
  randInt(lo, hi) {
    return lo + Math.random()*(hi-lo);
  }
}

var useSpritesheetBuilder = true

class SpriteSheetBuilderExample extends GameState {

  preload() {
    this.game.load.crossOrigin = 'anonymous'
  }

  create() {
    super.create()

    this.createShapes()

    window.State = this
  }

  createShapes() {
    let numCircles = 300

    if (useSpritesheetBuilder) this.addSpriteSheetBuilder(numCircles)

    let xPadding = 10
    let yPadding = 10

    this.circles = []
    for (var i = 0; i < numCircles; i++) {
      let circle = this.addCircle(i)
      circle.position.set(Util.randInt(0, this.world.width), Util.randInt(0, this.world.height))
      this.circles.push(circle)
    }
  }

  addSpriteSheetBuilder(numCircles) {
    let ssb = new SpriteSheetBuilder(this.game)

    let square = this.game.add.graphics(0, 0)
    square.beginFill(0xff0000)
          .drawRect(0, 0, 100, 100)
    let squareImage = square.generateTexture()
    square.destroy()

    let circle = this.game.add.graphics(0, 0)
    circle.beginFill(0x333333)
          .drawCircle(0, 0, 100)
    let circleImage = circle.generateTexture()
    circle.destroy()
    // ssb.addFrames([['square', squareImage], ['circle', circleImage]])

    // Draw the atlas
    // let im = this.game.add.image(0, 0, ssb.bmd)

    let circles = _.times(numCircles, ()=> {
      return this.makeBmd(50, 10)
    })

    var i = 0
    ssb.addFrames(
      _.map(circles, (circle)=> {
        return [`circle${i++}`, circle.texture]
      })
    )

    ssb.buildToCache('new-atlas')
  }

  addCircle(i) {
    if (useSpritesheetBuilder) {
      return this.game.add.image(0, 0, 'new-atlas', `circle${i}`)
    } else {
      return this.game.add.image(0, 0, this.makeBmd(50, 10))
    }
  }

  update() {
    super.update()

    this.circles.forEach((_item)=> {
      _item.x += Util.randInt(-10, 10)
      _item.y += Util.randInt(-10, 10)
    })
  }

  makeBmd(r, thickness) {
    let w = r*2 + thickness
    let bmd = this.game.add.bitmapData(w, w)
    let c = bmd.ctx
    let offset = 0

    c.setLineDash([2, 4])
    c.lineWidth = thickness
    c.beginPath()
    c.arc(w/2, w/2, r, offset, offset + (Phaser.Math.PI2-offset*2) * 1)
    c.strokeStyle = Phaser.Color.getWebRGB(Phaser.Color.getRandomColor())
    c.stroke()
    c.closePath()

    return bmd
  }

}

export default SpriteSheetBuilderExample;
