import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import {BaseState, hCenter} from '../utils'
import global from '../global'
import { VirtualScreen } from '../constants'
import Board from '../Board'

export default class StartState extends BaseState{
  currentMenuItem = 1
  colors = [
    [217, 87, 99, 255],
    [95, 205, 228, 255],
    [251, 242, 54, 255],
    [118, 66, 138, 255],
    [153, 229, 80, 255],
    [223, 113, 38, 255]
  ]
  letterTable:[string, number][] = [
    ['M', -108],
    ['A', -64],
    ['T', -28],
    ['C', 2],
    ['H', 40],
    ['3', 112]
  ]
    // used to animate our full-screen transition rect
  transitionAlpha = 0
  pauseInput = false
  colorTimer!:NodeJS.Timeout
  bgGrahpics = new PIXI.Graphics()
  topG = new PIXI.Graphics()
  lettersTxt:PIXI.Text[] = []
  match3Txt:PIXI.Text = new PIXI.Text('MATCH 3')
  startTxt:PIXI.Text = new PIXI.Text('')
  quitTxt:PIXI.Text = new PIXI.Text('')
  // tiles:Tile[][] = []
  board!:Board
  constructor (public container:PIXI.Container, public boardContainer:PIXI.Container) {
    super()
    // -- generate full table of tiles just for display
    // for (let i = 0; i < 64; i++) {
    //   const tile = global.frames.tiles[rand(18)][rand(6)]
    //   const sprite = PIXI.Sprite.from(tile)
    //   this.tiles.push(sprite)
    //   this.container.addChild(sprite)
    // }
  }
  enter () {
    this.board = new Board(128, 16, this.boardContainer)
    this.colorTimer = setInterval(() => {
        let i = this.colors.length - 1
        const c6 = this.colors[i]
        for (; i > 0; i--) {
            this.colors[i] = this.colors[i - 1]
        }
        this.colors[0] = c6
    }, 75)
    this.container.addChild(this.bgGrahpics)
    this.container.addChild(this.startTxt)
    this.container.addChild(this.quitTxt)
    for (let i = 0; i < 6; i++) {
      const txt = new PIXI.Text(this.letterTable[i][0].toString())
      this.lettersTxt.push(txt)
      this.container.addChild(txt)
    }
    this.container.addChild(this.topG)
    this.transitionAlpha = 0
    this.pauseInput = false
  }
  exit () {
    this.container.removeChild(this.topG)
    this.container.removeChild(this.bgGrahpics)
    this.container.removeChild(this.startTxt)
    this.container.removeChild(this.quitTxt)
    this.container.removeChild(...this.lettersTxt)
    this.lettersTxt = []
    this.board.clear()
    // this.container.removeChild(...this.tiles)
    // for (let i = 0; i < 64; i++) {
    //   this.tiles.
    // }
  }
  update (delta:number) {
    // if love.keyboard.wasPressed('escape') then
    //     love.event.quit()
    // end
    // -- as long as can still input, i.e., we're not in a transition...
    if (!this.pauseInput) {
      if (global.input.keyPressedSet.has('ArrowUp') || global.input.keyPressedSet.has('ArrowDown')) {
        this.currentMenuItem = this.currentMenuItem === 1 ? 2 : 1
        global.sounds['select'].play()
      }
      if (global.input.keyPressedSet.has('Enter')) {
        if (this.currentMenuItem === 1) {
            new TWEEN.Tween(this).to({transitionAlpha: 1}, 1000)
                .start()
                .onComplete(() => {
                  global.stateMachine.change('begin-game', {level: 1, board: this.board})
                  clearInterval(this.colorTimer)
                })
        } else {
                // love.event.quit()
        }
        this.pauseInput = true
      }
    }
  }
  render () {
    this.board.render()
    // for (let y = 0; y < 8; y++) {
    //   for (let x = 0; x < 8; x++) {
    //       // -- render shadow first
    //       // love.graphics.setColor(0, 0, 0, 255)
    //       // love.graphics.draw(gTextures['main'], positions[(y - 1) * x + x], (x - 1) * 32 + 128 + 3, (y - 1) * 32 + 16 + 3)
    //       // -- render tile
    //       // love.graphics.setColor(255, 255, 255, 255)
    //       // love.graphics.draw(gTextures['main'], positions[(y - 1) * x + x], 
    //       //     (x - 1) * 32 + 128, (y - 1) * 32 + 16)
    //     this.tiles[y * 8 + x].x = x * 32 + 128
    //     this.tiles[y * 8 + x].y = y * 32 + 16
    //   }
    // }
    // -- keep the background and tiles a little darker than normal
    this.bgGrahpics.clear()
    this.bgGrahpics.beginFill(0, 0.5)
    this.bgGrahpics.drawRect(0, 0, VirtualScreen.width, VirtualScreen.height)
    this.bgGrahpics.endFill()
    this.drawMatch3Text(-60)
    this.drawOptions(12)
    // -- draw our transition rect; is normally fully transparent, unless we're moving to a new state
    this.topG.clear()
    this.topG.beginFill(0xFFFFFF, this.transitionAlpha)
    this.topG.drawRect(0, 0, VirtualScreen.width, VirtualScreen.height)
    this.topG.endFill()
  }
  drawMatch3Text (y:number) {
    // -- draw semi-transparent rect behind MATCH 3
    this.bgGrahpics.beginFill(0xFFFFFF, 0.5)
    this.bgGrahpics.drawRoundedRect(VirtualScreen.width / 2 - 76, VirtualScreen.height /2 + y - 11, 150, 58, 6)
    this.bgGrahpics.endFill()
    // -- draw MATCH 3 text shadows
    // love.graphics.setFont(gFonts['large'])
    // this.drawTextShadow(this.match3Txt, 'MATCH 3', VirtualScreen.height / 2 + y, VirtualScreen.width, 32, 'rgb(34,32,52)')
    for (let i = 0; i < 6; i++) {
        const curColor = this.colors[i]
        const color = `rgb(${curColor[0]}, ${curColor[1]}, ${curColor[2]})`
        this.drawTextShadow(this.lettersTxt[i], this.letterTable[i][0], VirtualScreen.height / 2 + y, VirtualScreen.width + this.letterTable[i][1], 28, color)
    }
  }
  drawTextShadow (txt:PIXI.Text, text:string, y:number, width:number, fontSize:number, color:string) {
    txt.text = text
    txt.style = {
        fontSize,
        fontWeight: 'bold',
        fill: color,
        dropShadow: true,
        dropShadowDistance: 2,
        dropShadowColor: '#000000',
        dropShadowAngle: Math.PI / 4
    }
    txt.y = y
    hCenter(txt, width, 0)
    // love.graphics.printf(text, 2, y + 1, VIRTUAL_WIDTH, 'center')
    // love.graphics.printf(text, 1, y + 1, VIRTUAL_WIDTH, 'center')
    // love.graphics.printf(text, 0, y + 1, VIRTUAL_WIDTH, 'center')
    // love.graphics.printf(text, 1, y + 2, VIRTUAL_WIDTH, 'center')
  }
  drawOptions (y:number) {
    this.bgGrahpics.beginFill(0xFFFFFF, 0.5)
    this.bgGrahpics.drawRoundedRect(VirtualScreen.width / 2 - 76, VirtualScreen.height /2 + y, 150, 58, 6)

    let color:string 
    if (this.currentMenuItem === 1) {
        color = 'rgb(99,155,255)'
    } else {
        color = 'rgb(48,96,130)'
    }
    this.drawTextShadow(this.startTxt, 'Start', VirtualScreen.height / 2 + y + 8, VirtualScreen.width, 16, color)

    if (this.currentMenuItem === 2) {
        color = 'rgb(99,155,255)'
    } else {
        color = 'rgb(48,96,130)'
    }
    this.drawTextShadow(this.quitTxt, 'Quit Game', VirtualScreen.height / 2 + y + 33, VirtualScreen.width, 16, color)
  }
}

