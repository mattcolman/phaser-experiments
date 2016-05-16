import Game from './game';

var init = function() {
  var config = {
    "width": 400,
    "height": 702,
    "renderer": Phaser.AUTO,
    "parent": 'content',
    "resolution": 1,//window.devicePixelRatio,
    "state": Game.prototype.states[0][1]
  };
  let game = new Game(config)
}

init();

