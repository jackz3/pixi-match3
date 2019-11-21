import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import {BaseState, rgbToNum, hCenter} from '../utils'
import global from '../global'
import { VirtualScreen } from '../constants'
import Board from '../Board'

export default class BeginGameState extends BaseState {
  transitionAlpha = 1
  levelLabelY = -64
  level = 0
  board!:Board
  beginG = new PIXI.Graphics()
  levelTxt = new PIXI.Text('', {fill: '#FFFFFF', fontSize: 28})
  constructor (public container:PIXI.Container) {
    super()
    // this.board = new Board(VirtualScreen.width - 272, 16, container)
  }
  enter (params:any) {
    this.board = params.board
    this.board.initializeTiles(VirtualScreen.width - 272, 16)
    this.container.addChild(this.beginG)
    this.container.addChild(this.levelTxt)
    this.container.visible = true
    this.level = params.level
    this.levelLabelY = -64
    // -- animate our white screen fade-in, then animate a drop-down with
    // -- the level text
    new TWEEN.Tween(this).to({transitionAlpha: 0}, 1000).start()
      .onComplete(() => {
        new TWEEN.Tween(this).to({levelLabelY: VirtualScreen.height / 2 - 8}, 250).start()
          .onComplete(() => {
            new TWEEN.Tween(this).to({levelLabelY: VirtualScreen.height + 30}, 250).delay(1000).start()
              .onComplete(() => {
                global.stateMachine.change('play', {level: this.level, board: this.board})
              })
          })
      })
  }
  render () {
    this.board.render()

    this.beginG.clear()
    this.beginG.beginFill(rgbToNum(95, 205, 228) , 200 / 255)
    this.beginG.drawRect(0, this.levelLabelY - 8, VirtualScreen.width, 48)
    this.beginG.endFill()
    this.levelTxt.text = `Level ${this.level}`
    this.levelTxt.y = this.levelLabelY
    hCenter(this.levelTxt, VirtualScreen.width)
    this.beginG.beginFill(0xFFFFFF, this.transitionAlpha)
    this.beginG.drawRect(0, 0, VirtualScreen.width, VirtualScreen.height)
  }
}

