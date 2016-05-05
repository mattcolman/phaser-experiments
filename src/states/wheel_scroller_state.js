import GameState from './game_state';
import _ from 'lodash';
import {scaleBetween} from '../utils/math_utils'
import {WheelScroller} from 'phaser-list-view'

const OUTPUT_Y = 600
const INPUT_DIAMETER = 250

class WheelScrollerState extends GameState {

  create() {
    super.create()

    this.mainGrp = this.game.add.group()

    let bmd = this.add.bitmapData(INPUT_DIAMETER, INPUT_DIAMETER, 'circle', true)
    let r = INPUT_DIAMETER/2
    bmd.circle(r, r, r, '#ffffff')

    this.addWheel1()
    this.addWheel2()
    this.addWheel3()
    this.addInputOutputLabels()

    window.State = this
  }

  addInputOutputLabels() {
    let g = this.game.add.graphics(0, this.world.centerY, this.mainGrp)
    g.beginFill(0xff0000)
     .drawRect(0, 0, this.world.width, 2)
    g.alpha = .5

    let txt = this.game.add.text(100, this.world.centerY, 'output\ninput', {
      font: '30px Arial',
      fill: '#ff0000',
      align: 'center',
      boundsAlignH: "center",
      boundsAlignV: "middle"
    }, this.mainGrp)
    txt.setTextBounds(-200, -200, 400, 400);
  }

  addWheel1() {
    let x = this.world.centerX - 300

    let str = ""
    str += "input from 0 to 360"
    str += '\noutput rotates twice the input'
    str += '\nno momentum, snapping or bouncing'
    this.addLabel(x, OUTPUT_Y - 200, str)

    let wheelInput = this.addWheelInput(x, OUTPUT_Y, {
      from: 0,
      to: 360,
      momentum: false,
      snapping: false,
      bouncing: false,
      overflow: 20, // degrees
    })

    // display wheel
    let diameter = 200
    var group = this.game.add.group(this.mainGrp)

    let g = this.add.graphics(0, 0, group)
    g.beginFill(0x0000ff)
     .drawCircle(0, 0, diameter)
     .beginFill(0xffffff)
     .drawCircle(diameter*.45, 0, 10)
    let style = { font: "bold 20px Arial", fill: "#ffffff", boundsAlignH: "center", boundsAlignV: "middle" }
    let txt = this.add.text(0, 0, '0', style, group)
    txt.setTextBounds(-diameter/2, -diameter/2, diameter, diameter);
    group.txt = txt
    group.position.set(x, 200)

    wheelInput.events.onUpdate.add((o)=> {
      // console.log('update!!!', o)
      group.angle = o.total*2
      group.txt.angle = -group.angle
      group.txt.text = Phaser.Math.roundTo(group.angle, -2)
    })
  }

  addWheel2() {
    let x = this.world.centerX
    let y = 100

    let str = ""
    str += "input from 0 to 720"
    str += '\noutput positions y based on wheel percentage'
    this.addLabel(x, OUTPUT_Y - 200, str)

    let wheelInput = this.addWheelInput(x, OUTPUT_Y, {
      from: 0,
      to: 720,
      momentum: true,
      snapping: true,
      bouncing: true,
      snapStep: 45,
      overflow: 20, // degrees
    })

    let rect = this.addRectangle(this.mainGrp, '#ff0000')
    rect.position.set(x, y)

    wheelInput.events.onUpdate.add((o)=> {
      rect.y = scaleBetween(y, 300, o.percent)
    })
  }

  addWheel3() {
    let x = this.world.centerX + 300
    let y = 200

    let str = ""
    str += "input from -360 to 360 with infinte flag"
    str += "\noutput moves a GSAP timeline's playhead"
    str += "\nbased on wheel percentage"
    this.addLabel(x, OUTPUT_Y - 200, str)

    let wheelInput = this.addWheelInput(x, OUTPUT_Y, {
      from: -360,
      to: 360,
      momentum: true,
      snapping: true,
      bouncing: true,
      overflow: 20, // degrees
      snapStep: 10,
      infinite: true
    })

    let grp = this.game.add.group(this.mainGrp)
    let rect = this.addRectangle(grp, '#00ff00')
    let rect2 = this.addRectangle(grp, '#ffff00')
    rect2.scale.set(.5)
    rect2.position.set(50, 50)
    rect2.pivot.x = 75
    rect2.alpha = .8
    grp.position.set(x, y)
    grp.pivot.x = 100

    var tl = new TimelineMax()
    tl.insert(TweenMax.to(grp, 1, {angle: 360, ease: Linear.easeNone}))
      .insert(TweenMax.to(rect, 1,  {angle: -720, ease: Sine.easeInOut}))
      .insert(TweenMax.to(rect2, 1,  {angle: 360, ease: Sine.easeInOut}))
    tl.pause()

    wheelInput.events.onUpdate.add((o)=> {
      let time = o.percent
      time = Math.min(time, 1)
      time = Math.max(time, 0)
      tl.time(time)
    })
  }

  addWheelInput(x, y, config) {
    let clicker = this.game.add.graphics(0, 0, this.mainGrp)
    clicker.beginFill(0x333333)
           .drawCircle(0, 0, INPUT_DIAMETER)
    clicker.alpha = 1
    clicker.position.set(x, y)

    // we have to use a new mask instance for the click object or webgl ignores the mask
    let wheelInput = new WheelScroller(this.game, clicker, config)
    wheelInput.events.onUpdate.add((o)=>{
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
    displayWheel.txt.text = wheelInput.options.from
    this.mainGrp.addChild(displayWheel)

    return wheelInput
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

  addRectangle(parent, color) {
    let [w, h] = [100, 100]
    let bmd = this.add.bitmapData(w, h)
    bmd.ctx.beginPath()
    bmd.ctx.rect(0, 0, w, h)
    bmd.ctx.fillStyle = color
    bmd.ctx.fill()
    var rect = this.add.sprite(0, 0, bmd, null, parent)
    rect.anchor.set(0.5)
    return rect
  }

  addLabel(x, y, str) {
    let style = {font: '14px Arial', fill: '#000000', boundsAlignH: 'center'}
    let txt = this.add.text(x, y, str, style, this.mainGrp)
    txt.setTextBounds(-200, 0, 400, 100)
  }

}


export default WheelScrollerState;
