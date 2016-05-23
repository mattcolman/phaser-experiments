import GameState from './game_state';
import _ from 'lodash';
import {scaleBetween} from '../utils/math_utils'
import {ListViewCore, WheelScroller} from 'phaser-list-view'
import {Client, TrackHandler, PlaylistHandler} from 'spotify-sdk';

const OUTPUT_Y = 516
const INPUT_DIAMETER = 250
const TILE_WIDTH = 250
const TILE_HEIGHT = 30
const LIGHT_BLUE = '#aabbd2'
const DARK_BLUE = '#262a4a'

class IpodState extends GameState {

  preload() {
    this.game.load.image('ipod', '/images/ipod.jpg')
  }

  create() {
    super.create()

    this.initSpotify()

    this.game.add.image(0, 0, 'ipod')

    this.mainGrp = this.game.add.group()

    let bmd = this.add.bitmapData(INPUT_DIAMETER, INPUT_DIAMETER, 'circle', true)
    let r = INPUT_DIAMETER/2
    bmd.circle(r, r, r, '#ffffff')

    // LIST VIEW
    this.bounds = new Phaser.Rectangle(this.world.centerX - TILE_WIDTH/2, 100, TILE_WIDTH, 170)

    this.highlight = this.addHighlight(this.world, this.bounds.x, this.bounds.y)

    this.listView = new ListViewCore(this.game, this.world, this.bounds, {
      direction: 'y',
      autocull: true,
      padding: 2
    })
    this.listView.events.onAdded.add((limit)=>{
      this.wheelScroller.setFromTo(0, limit)
    })

    // WHEEL SCROLLER
    this.wheelScroller = this.addWheelScroller(this.world.centerX, OUTPUT_Y, {
      from: 0,
      to: 0,
      momentum: true,
      snapping: false,
      bouncing: true,
      overflow: 20, // degrees
    })

    this.previousIndex = 0
    this.wheelScroller.events.onUpdate.add((o)=> {
      let index = Math.round(this.listView.items.length * o.percent)
      index = Math.max(index, 0)
      index = Math.min(index, this.listView.items.length-1)
      console.log('index is', index)

      if (index > this.previousIndex) {
        if (this.highlight.y + TILE_HEIGHT + 2 > this.bounds.y + this.bounds.height - TILE_HEIGHT) {
          this.listView.grp.y -= (TILE_HEIGHT + 2)
          this.listView.cull()
        } else {
          this.highlight.y += TILE_HEIGHT + 2
        }
      } else if (index < this.previousIndex) {
        if (this.highlight.y - (TILE_HEIGHT + 2) < this.bounds.y) {
          this.listView.grp.y += (TILE_HEIGHT + 2)
          this.listView.cull()
        } else {
          this.highlight.y -= TILE_HEIGHT + 2
        }
      }

      if (index != this.previousIndex) {
        this.listView.items[index].getChildAt(1).fill = LIGHT_BLUE
        this.listView.items[this.previousIndex].getChildAt(1).fill = DARK_BLUE
      }

      this.previousIndex = index
    })

    this.listView.addMultiple(...this.makeItems())
    this.listView.items[0].getChildAt(1).fill = LIGHT_BLUE

    window.State = this
  }

  initSpotify() {
    this.client = Client.instance
    this.client.settings = {
      clientId: '8a9c53bde39b4d1e945194d3b0399b3f',
      secretId: '94f0590f701945bbb32ecb718647e2c7',
      scopes: ['user-follow-modify user-follow-read user-library-read user-top-read'],
      redirect_uri: 'http://localhost:3000/callback'
    }

    this.session()
    document.querySelector('#login').onclick = ()=> { this.login() }
  }

  /*
   * Login user
   * This is a way, you can do it however you want
   */
  session() {
      if (sessionStorage.token) {
          this.client.token = sessionStorage.token;
      } else if (window.location.hash.split('&')[0].split('=')[1]) {
          sessionStorage.token = window.location.hash.split('&')[0].split('=')[1];
          this.client.token = sessionStorage.token;
      }
  }


  login() {
    this.client.login().then((url) => {
        window.location.href = url;
    });
  }


  addHighlight(parent, x, y) {
    const w = TILE_WIDTH
    const h = TILE_HEIGHT
    let g = this.game.add.graphics(x, y, parent)
    g.beginFill(0x262a4a)
     .drawRect(0, 0, w, h)
    return g
  }

  makeItems() {
    var arr = []
    for (var i = 0; i < 30; i++) {
      arr.push( this.makeSlot( `song ${i+1}` ) )
    }
    return arr
  }

  addWheelScroller(x, y, config) {
    let clicker = this.game.add.graphics(0, 0, this.mainGrp)
    clicker.beginFill(0x333333)
           .drawCircle(0, 0, INPUT_DIAMETER)
    clicker.alpha = 0
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
    displayWheel.alpha = .2
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

  makeSlot(str) {
    let grp = this.game.make.group(null)
    let rect = this.makeRectangle(0xaabbd2, TILE_WIDTH, TILE_HEIGHT)
    rect.alpha = 0
    grp.addChild(rect)
    let txt = this.game.add.text(10, TILE_HEIGHT/2, str, {font: '14px Arial', fill: "#000"}, grp)
    txt.anchor.set(0, .5)
    return grp
  }

  makeRectangle(color, w, h) {
    let g = this.make.graphics(0, 0)
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
