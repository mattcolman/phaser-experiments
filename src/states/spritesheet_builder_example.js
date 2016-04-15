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

    let numCircles = 300

    this.addSpriteSheetBuilder(numCircles)

    this.circles = []
    for (var i = 0; i < numCircles; i++) {
      let circle = this.game.add.image(0, 0, 'new-atlas', `circle${i}`)
      circle.position.set(Util.randInt(0, this.world.width), Util.randInt(0, this.world.height))
      this.circles.push(circle)
    }
  }

  addSpriteSheetBuilder(numCircles) {
    var ssb = new SpriteSheetBuilder(this.game)
    var i = 0
    _.times(numCircles, ()=> {
      ssb.addFrame(`circle${i++}`, this.makeBmd(50, 10).texture)
    })

    ssb.buildToCache('new-atlas')
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
