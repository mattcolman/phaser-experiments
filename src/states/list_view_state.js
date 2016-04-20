import GameState from './game_state';
import _ from 'lodash';
import {scaleBetween} from '../utils/math_utils'
import ListView from '../list_view'

class ListViewState extends GameState {

  preload() {
    this.game.load.crossOrigin = 'anonymous'
  }

  create() {

    var w = 600
    var h = 100

    this.listView = this.addListView(this.world.centerX - w/2, 120, w, 400)

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

    window.State = this
    super.create()

  }

  addListView(x, y, w, h) {
    return new ListView(this.game, this.world, new Phaser.Rectangle(x, y, w, h), {
      overflow: 100
    })
  }

}


export default ListViewState;
