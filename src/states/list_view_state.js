import GameState from './game_state';
import _ from 'lodash';
import {scaleBetween} from '../utils/math_utils'
import ListView from '../list_view'

class ListViewState extends GameState {

  preload() {
    this.game.load.crossOrigin = 'anonymous'
  }

  create() {

    var maskW = 600
    var maskH = 200
    var boxW = 100
    var boxH = 200

    this.listView = this.addListView(this.world.centerX - maskW/2, 120, maskW, 400)

    for (var i = 0; i < 500; i++) {
      let color = Phaser.Color.getRandomColor()
      let group = this.game.make.group(null)
      let g = this.game.add.graphics(0, 0, group)
      let w = boxW + Math.floor(Math.random()*100)
      g.beginFill(color)
       .drawRect(0, 0, w, boxH)

      let txt = this.game.add.text(w/2, boxH/2, i, {font: "40px Arial", fill: "#000"}, group)
      txt.anchor.set(.5)
      let img = this.game.add.image(0, 0, group.generateTexture())
      this.listView.add(img)
    }

    window.State = this
    super.create()

  }

  addListView(x, y, w, h) {
    return new ListView(this.game, this.world, new Phaser.Rectangle(x, y, w, h), {
      overflow: 100,
      direction: 'x'
    })
  }

}


export default ListViewState;
