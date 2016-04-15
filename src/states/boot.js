import WebFont from 'webfontloader';
import Style from '../style'
import _ from 'lodash'

class Boot extends Phaser.State {

  preload() {
    this.game.load.crossOrigin = 'anonymous'
  }

	create() {
    console.log('boot me up')

    this.game.setupStage()
    this.game.addStates()

    var fontFamilies = _.values(Style.Font.Panton)
    console.log('load fontFamilies', fontFamilies)

    // converted from FontSquirrel.com
    WebFont.load({
      // google: {
      //   families: ['Droid Sans', 'Droid Serif']
      // },
      custom: {
        families: fontFamilies,
        urls: ['./fonts/panton/stylesheet.css']
      },
      active: ()=> {
        // this.game.time.events.add(Phaser.Timer.SECOND, this.fontLoadComplete, this)
        this.fontLoadComplete()
      }

    });
  }

  fontLoadComplete() {
    console.log('fonts loaded!')
    this.game.startGame()
  }

}

export default Boot;
