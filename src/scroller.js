import _ from 'lodash';
import {nearestMultiple, percentageBetween2} from './utils/math_utils'
import 'gsap'

// Pure logic scroller
// Originally adapted from http://yusyuslabs.com/tutorial-momentum-scrolling-inside-scrollable-area-with-phaser-js/
//
class Scroller {

  constructor(game, clickObject, options = {}) {

    this.game        = game
    this.clickObject = clickObject

    let defaultOptions = {
      from : 0,
      to : 200,
      direction: 'y',
      momentum : false,
      snapping : false,
      bouncing : false,
      deceleration: .5, // value between 0 and 1
      overflow : 20,
      snapStep : 10,
      emitMoving : false,
      duration : 1.5, // (s) duration of the inertial scrolling simulation.
      speedLimit : 3, // set maximum speed. Higher values will allow faster scroll (which comes down to a bigger offset for the duration of the momentum scroll) note: touch motion determines actual speed, this is just a limit.
      moveThreshold : 100, // (ms) determines if a swipe occurred: time between last updated movement @ touchmove and time @ touchend, if smaller than this value, trigger inertial scrolling
      offsetThreshold : 30, // (pixels) determines if calculated offset is above this threshold
      acceleration : 0.5, // increase the multiplier by this value, each time the user swipes again when still scrolling. The multiplier is used to multiply the offset. Set to 0 to disable.
      accelerationT : 250, // (ms) time between successive swipes that determines if the multiplier is increased (if lower than this value)
      maxAcceleration : 4,
      time : {}, // contains timestamps of the most recent down, up, and move events
      multiplier : 1 //acceleration multiplier, don't edit here
    }

    this.o = this.options = _.extend(defaultOptions, options)

    this.updateMinMax()

    this.debug          = false

    this.dispatchValues = {step: 0, total: 0, percent: 0}

    this.addListeners()

    this.scrollObject = {}
    this.scrollObject[this.o.direction] = 0

    this.maskLimits = {x: this.clickObject.width, y: this.clickObject.height}

    // set tween that will be re-used for moving scrolling sprite
    this.tweenScroll = TweenMax.to(this.scrollObject, 0, {
      ease: Quart.easeOut,
      onUpdate: this.handleUpdate,
      onUpdateScope: this,
      onComplete: this.handleComplete,
      onCompleteScope: this
    })

    window.Scroller = this
  }

  setFromTo(_from, _to) {
    this.o.from = _from
    this.o.to = _to
    this.updateMinMax()
  }

  updateMinMax() {
    this.min = Math.min(this.o.from, this.o.to)
    this.max = Math.max(this.o.from, this.o.to)
    this.length = Math.abs(this.max - this.min)
  }

  addListeners() {

    this.events = {
      onUpdate: new Phaser.Signal(),
      onInputUp: new Phaser.Signal(),
      onInputDown: new Phaser.Signal(),
      onInputMove: new Phaser.Signal(),
      onComplete: new Phaser.Signal()
    }

    this.clickObject.inputEnabled = true
    this.clickObject.events.onInputDown.add(this.handleDown, this)
    this.clickObject.events.onInputUp.add(this.handleUp, this)
  }

  removeListeners() {
    this.clickObject.events.onInputDown.remove(this.handleDown, this)
    this.clickObject.events.onInputUp.remove(this.handleUp, this)

    _.forIn(this.events, (signal, key)=> {
      signal.removeAll()
    })
  }

  // TODO
  destroy() {
  }

  handleDown(target, pointer) {
    // console.log('input down', pointer.y)
    this.old = this.downY = pointer[this.o.direction]
    this.target = this.requested = this.scrollObject[this.o.direction]
    this.o.time.down = pointer.timeDown;

    this.game.input.addMoveCallback(this.handleMove, this)

    //check if block is currently scrolling and set multiplier
    if (TweenMax.isTweening(this.scrollObject) && (this.o.time.down - this.o.time.up) < this.o.accelerationT) {
        //swipe while animation was happening, increase multiplier
        this.o.multiplier += this.o.acceleration;
        // console.log('swipe while animation is happening', this.o.multiplier)
    } else {
        //reset
        this.o.multiplier = 1;
    }

    //stop tween for touch-to-stop
    this.tweenScroll.pause()

    this.events.onInputDown.dispatch({target, pointer})
  }

  handleMove(pointer, x, y) {
    let o = {x, y}
    this.diff = this.old - o[this.o.direction]

    this.requested -= this.diff

    this.target = this.requestTarget(this.requested, this.min, this.max, this.o.overflow)

    this.old = o[this.o.direction]

    //store timestamp for event
    this.o.time.move = this.game.time.time

    let _distance = this.downY - o[this.o.direction]

    // this.acc = Math.abs(_distance / (this.o.time.move - this.o.time.down))
    this.acc = Math.min(Math.abs(this.diff/30), this.o.maxAcceleration)
    // console.log('distance', this.diff, this.acc)

    //go ahead and move the block
    this.scrollObject[this.o.direction] = this.target
    this.handleUpdate()

    // if (this.o.emitMoving) this.events.onInputMove.dispatch({pointer, x, y})
  }

  requestTarget(target, min, max, overflow) {
    var diff = 0
    var calculatedTarget = target
    if (target > max) {
      diff = target - max
      calculatedTarget = max + diff*this.o.deceleration
      calculatedTarget = Math.min(calculatedTarget, max + overflow)
    } else if (target < min) {
      diff = min - target
      calculatedTarget = min - diff*this.o.deceleration
      calculatedTarget = Math.max(calculatedTarget, min - overflow)
    }
    // console.log('requestTargetAngle in:', angle, ' out: ', calculatedAngle)
    return calculatedTarget
  }

  handleUp(target, pointer) {
    // console.log('end')
    this.game.input.deleteMoveCallback(this.handleMove, this)

    //store timestamp for event
    this.o.time.up = pointer.timeUp;

    if (this.o.time.up - this.o.time.down > this.o.accelerationT) {
      this.o.multiplier = 1 // reset
    }

    // *** END LIMITS
    var maxOffset = this.maskLimits[this.o.direction] * this.o.speedLimit
    let _distance = this.downY - pointer[this.o.direction]
    let duration = 1

    // *** BOUNCING
    if (!this.o.bouncing) duration = .1

    if (this.scrollObject[this.o.direction] > this.max) {
      this.target = this.max
      this.doTween(duration, this.target)

    } else if (this.scrollObject[this.o.direction] < this.min) {
      this.target = this.min
      this.doTween(duration, this.target)

    } else {

      //calc for moving
      var touchTime = this.o.time.up - this.o.time.move;
      // var maxOffset = this.length * this.o.speedLimit;

      //distance to move after release
      var offset = Math.pow(this.acc, 2) * this.maskLimits[this.o.direction];
      offset = Math.min(maxOffset, offset)
      offset = (this.diff > 0) ? -this.o.multiplier * offset : this.o.multiplier * offset;

      // // *** MOMENTUM
      let [_duration, _target] = this.addMomentum(this.target, touchTime, offset, maxOffset)

      // // *** SNAPPING
      this.target = this.snap(_target)

      this.doTween(_duration, this.target)
    }

    this.events.onInputUp.dispatch({target, pointer})

  }

  snap(target) {
    target = Math.max(target, this.min)
    target = Math.min(target, this.max)
    return target
  }

  addMomentum(target, touchTime, offset, maxOffset) {
    let duration = 1

    if (!this.o.momentum) return [.1, target]

    if ((touchTime < this.o.moveThreshold) && offset !== 0 && Math.abs(offset) > (this.o.offsetThreshold)) {
      target += offset
      duration = this.o.duration * Math.min((Math.abs(offset) / maxOffset), 1)
      console.log("<<< momentum!!!!!!!!!", offset, target, duration)
    } else {
      console.log("<<< NO momentum :(")
      duration = 1
    }

    return [duration, target]
  }

  doTween(duration, target) {
    // console.log('doTween', duration, target)
    //stop a tween if it is currently happening
    let o = {}
    o[this.o.direction] = target

    this.tweenScroll.pause()
    this.tweenScroll.duration(duration)
    this.tweenScroll.updateTo(o, true)
    this.tweenScroll.restart()
  }

  handleUpdate() {
    this.dispatchValues.step = this.diff
    this.dispatchValues.total = this.scrollObject[this.o.direction]
    this.dispatchValues.percent = percentageBetween2(this.scrollObject[this.o.direction], this.o.from, this.o.to)
    this.events.onUpdate.dispatch(this.dispatchValues)
  }

  handleComplete() {
    // reset multiplier when finished
    console.log('<<<<<<<< complete')
    this.o.multiplier = 1;
    this.events.onComplete.dispatch()
  }

}

export default Scroller;
