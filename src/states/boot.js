import _ from 'lodash'

class Boot extends Phaser.State {

  preload() {
    this.game.load.crossOrigin = 'anonymous'
  }

	create() {
    console.log('boot me up')

    this.game.setupStage()
    this.game.addStates()
    this.game.startGame()
  }

}

export default Boot;
