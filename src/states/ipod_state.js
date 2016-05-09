import GameState from './game_state';
import _ from 'lodash';
import {scaleBetween} from '../utils/math_utils'
import {ListViewCore, WheelScroller} from 'phaser-list-view'

const OUTPUT_Y = 600
const INPUT_DIAMETER = 250
const TILE_WIDTH = 300

class IpodState extends GameState {

  create() {
    super.create()

    this.mainGrp = this.game.add.group()

    let bmd = this.add.bitmapData(INPUT_DIAMETER, INPUT_DIAMETER, 'circle', true)
    let r = INPUT_DIAMETER/2
    bmd.circle(r, r, r, '#ffffff')

    // LIST VIEW
    let bounds = new Phaser.Rectangle(this.world.centerX - TILE_WIDTH/2, 100, TILE_WIDTH, 370)
    this.listView = new ListViewCore(this.game, this.world, bounds, {
      direction: 'y',
      autocull: true,
      padding: 10
    })
    this.listView.addMultiple(...this.makeManyItems())

    // WHEEL SCROLLER
    this.wheelScroller = this.addWheelScroller(this.world.centerX, OUTPUT_Y, {
      from: 0,
      to: 0,
      momentum: true,
      snapping: false,
      bouncing: true,
      overflow: 20, // degrees
    })

    this.wheelScroller.events.onUpdate.add((o)=> {
      this.listView.update(-o.total)
    })

    this.listView.events.onUpdate.add((limit)=>{
      this.wheelScroller.setFromTo(0, limit)
    })

    window.State = this
  }

  makeManyItems() {
    var arr = []
    for (var i = 0; i < 50; i++) {
      let color = Phaser.Color.getRandomColor()
      arr.push(this.makeRectangle(color, TILE_WIDTH, this.game.rnd.integerInRange(50, 200)))
    }
    return arr
  }

  addWheelScroller(x, y, config) {
    let clicker = this.game.add.graphics(0, 0, this.mainGrp)
    clicker.beginFill(0x333333)
           .drawCircle(0, 0, INPUT_DIAMETER)
    clicker.alpha = 1
    clicker.position.set(x, y)

    // we have to use a new mask instance for the click object or webgl ignores the mask
    let scroller = new WheelScroller(this.game, clicker, config)
    scroller.events.onUpdate.add((o)=>{
      // console.log('handleWheelInput', o)
      displayWheel.angle = o.total
      displayWheel.txt.angle = -displayWheel.angle
      displayWheel.txt.text = Phaser.Math.roundTo(displayWheel.angle, -2)

      // turn red if input has overflowed its limits
      if (o.percent >= 0 && o.percent <= 1) {
        displayWheel.dot.setColor(0x000000)
      } else {
        displayWheel.dot.setColor(0xff0000)
      }
    })

    var displayWheel = this.makeDefaultCircle(INPUT_DIAMETER)
    displayWheel.position.set(x, y)
    displayWheel.txt.text = scroller.options.from
    this.mainGrp.addChild(displayWheel)

    return scroller
  }

  makeDefaultCircle(diameter) {
    let group = this.game.add.group(this.mainGrp)
    let img = this.add.image(0, 0, this.load.cache.getBitmapData('circle'), null, group)
    img.anchor.set(.5)
    let g = this.add.graphics(0, 0, group)
    g.setColor = function(_color) {
      this.clear()
          .beginFill(_color)
          .drawCircle(diameter*.45, 0, 10)
    }
    g.setColor(0x000000)
    let style = { font: "bold 20px Arial", fill: "#333333", boundsAlignH: "center", boundsAlignV: "middle" }
    let txt = this.add.text(0, 0, '0', style, group)
    txt.setTextBounds(-diameter/2, -diameter/2, diameter, diameter);
    group.dot = g
    group.txt = txt
    return group
  }

  makeRectangle(color, w, h) {
    let g = this.add.graphics(0, 0)
    g.beginFill(color)
     .drawRect(0, 0, w, h)
    return g
  }

  addLabel(x, y, str) {
    let style = {font: '14px Arial', fill: '#000000', boundsAlignH: 'center'}
    let txt = this.add.text(x, y, str, style, this.mainGrp)
    txt.setTextBounds(-200, 0, 400, 100)
  }

}


export default IpodState;
