import _ from 'lodash';

class SpriteSheetBuilder {

  /**
   * @param  {Phaser.Game} game
   * @param  {Object} options
   * @option {Int} padding : padding between each sprite
   * @option {Int} width : width of the spritesheet
   * @option {Int} height : height of the spritesheet
   * }
   */
  constructor(game, options = {}) {
    this.game = game

    this.padding = options.padding || 3
    this.width  = options.width || 2048
    this.height = options.height || 2048

    this.bmd = this.game.make.bitmapData(this.width, this.height)

    this.frames = []
    this.data = {frames: []}
  }

  /**
   * @param {String} key to reference as a frame
   * @param {PIXI.Texture} texture to draw to the spritesheet
   * @note This just stores a frame in memory. You must call buildToCache() to use it.
   */
  addFrame(key, texture) {
    this.frames.push([key, texture])
  }

  /**
   * @param {Array} [key, texture]
   */
  addFrames(textures) {
    textures.forEach((arr)=> {
      this.addFrame(arr)
    })
  }

  /**
   * Build all frames into the Phaser cache.
   * You can now use these frames like a normal texture atlas.
   * @example this.game.add.image(0, 0, 'buildToCache-key', 'frame-key')
   * @param  {String} atlas key
   */
  buildToCache(key) {
    this._sortFrames()
    this._buildFrames()
    this.game.load.cache.addTextureAtlas(key, null, this.bmd.canvas, this.data, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY)
    this.destroy()
  }

  destroy() {
    this.frames = null
    this.data = null
  }

  /* -------------------------------------------------------
    -- PRIVATE
    ------------------------------------------------------- */

  _sortFrames() {
    // TODO - maxRects algorithm anyone??
    // maybe just sort by height for now?
  }

  _buildFrames() {
    var _HelperX = 0
    var _HelperY = 0
    var _nextY = 0

    this.frames.forEach((arr)=> {
      let [key, texture] = arr
      if (_HelperX + texture.width > this.width) {
        _HelperX = 0
        _HelperY = _nextY
      }

      if (_HelperY + texture.height > this.height) {
        console.error('oh dear, no enough from for this sprite')
      }

      this._addTexture(texture, _HelperX, _HelperY)
      this._addData(key, texture, _HelperX, _HelperY)

      _HelperX += texture.width + this.padding
      _nextY = Math.max(_HelperY + texture.height + this.padding)
    })
  }

  _addTexture(texture, x, y) {
    let image = texture.baseTexture.source
    this.bmd.ctx.drawImage(image, x, y, texture.width, texture.height)
  }

  _addData(key, texture, x, y) {
    let frame = this._newFrame(key, x, y, texture.width, texture.height, this.bmd.width, this.bmd.height)
    this.data.frames.push(frame)
  }

  _newFrame(name, x, y, w, h, sourceW, sourceH) {
    return {
      "filename": name,
      "frame": {"x":x,"y":y,"w":w,"h":h},
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": {"x":0,"y":0,"w":sourceW,"h":sourceH},
      "sourceSize": {"w":w,"h":h}
    }
  }

}

export default SpriteSheetBuilder;
