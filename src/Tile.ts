import * as PIXI from 'pixi.js'
import global from './global'

export default class Tile {
  gridX:number
  gridY:number
  x:number
  y:number
  sprite:PIXI.Sprite
  toBeDel = false
  shiny:boolean
  constructor (x:number, y:number, public color:number, public variety:number) {
    this.shiny = Math.random() > 0.95
    this.gridX = x
    this.gridY = y 
    this.x = this.gridX * 32
    this.y = this.gridY * 32
    this.sprite = PIXI.Sprite.from(global.frames.tiles[this.color][this.variety])
    if (this.shiny) {
      this.sprite.alpha = 0.7
    }
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
