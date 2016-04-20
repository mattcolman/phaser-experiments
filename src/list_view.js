import _ from 'lodash';
import Scroller from './scroller'

class ListView {

  constructor(game, parent, bounds, options = {}) {
    this.game = game
    this.parent = parent
    this.bounds = bounds

    let defaultOptions = {
      autocull: true,
      momentum: true,
      bouncing: true,
      snapping: false,
      overflow: 100,
      padding: 10
    }

    this.o = this.options = _.extend(defaultOptions, options)

    this.grp = this.game.add.group(parent)
    this.grp.position.set(bounds.x, bounds.y)

    // [MC] - is masking the fastest option here? Cropping the texture may be faster?
    this.grp.mask = this._addMask(bounds)

    // we have to use a new mask instance for the click object or webgl ignores the mask
    this.scroller = new Scroller(this.game, this._addMask(bounds), {
      from: 0,
      to: 0,
      momentum: this.o.momentum,
      bouncing: this.o.bouncing,
      snapping: this.o.snapping,
      overflow: this.o.overflow
    })
    this.scroller.events.onUpdate.add(this.update, this)
  }

  add(child) {
    let y = 0
    if (this.grp.children.length > 0) {
      let lastChild = this.grp.getChildAt(this.grp.children.length-1)
      y = lastChild.y + lastChild.height + this.o.padding
    }
    child.y = y
    this.grp.addChild(child)

    this.scroller.setFromTo(0, -this.grp.height + this.bounds.height)
    if (this.o.autocull) this.cull()
  }

  remove() {
    // TODO
  }

  destroy() {
    // TODO
  }

  update(o) {
    this.grp.y = this.bounds.y + o.total
    if (this.o.autocull) this.cull()
  }

  cull() {
    for (var i = 0; i < this.grp.children.length; i++) {
      let child = this.grp.children[i]
      child.revive()
      if (child.y + child.height + this.grp.y < this.bounds.y) {
        child.kill()
      } else if (child.y + this.grp.y > this.bounds.y + this.bounds.height) {
        child.kill()
      }
    }
  }

  _addMask(bounds) {
    let mask = this.game.add.graphics()
    mask.beginFill(0xff0000)
        .drawRect(bounds.x, bounds.y, bounds.width, bounds.height)
    mask.alpha = 0
    return mask
  }

}

export default ListView;
