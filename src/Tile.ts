import * as PIXI from 'pixi.js'
import global from './global'

export default class Tile {
  gridX:number
  gridY:number
  x:number
  y:number
  sprite:PIXI.Sprite
  constructor (x:number, y:number, public color:number, public variety:number) {
    this.gridX = x
    this.gridY = y 
    this.x = this.gridX * 32
    this.y = this.gridY * 32
    this.sprite = PIXI.Sprite.from(global.frames.tiles[this.color][this.variety])
    // container.addChild(this.sprite)
  }
  render (x:number, y:number) {

    // -- draw shadow
    // love.graphics.setColor(34, 32, 52, 255)
    // love.graphics.draw(gTextures['main'], gFrames['tiles'][this.color][this.variety],
    //     this.x + x + 2, this.y + y + 2)

    // -- draw tile itthis
    // love.graphics.setColor(255, 255, 255, 255)
    // love.graphics.draw(gTextures['main'], gFrames['tiles'][this.color][this.variety],
    //     this.x + x, this.y + y)
    this.sprite.x = this.x + x
    this.sprite.y = this.y + y
  }
}
