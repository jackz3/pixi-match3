import * as PIXI from 'pixi.js'
import {BaseState, rand, hCenter, rgbToNum} from '../utils'
import global from '../global'
import { VirtualScreen } from '../constants'

export default class GameOverState extends BaseState {
  score = 0
  gameoverG = new PIXI.Graphics()
  goTxt = new PIXI.Text('GAME\nOVER', {fontSize: 28, fill: 'rgb(99,155,255)', align: 'center'})
  scoreTxt = new PIXI.Text('', {fontSize: 14, fill: 'rgb(99,155,255)'})
  msgTxt = new PIXI.Text('Press Enter', {fontSize: 14})
  constructor (public container:PIXI.Container) {
    super()
    this.goTxt.x = VirtualScreen.width / 2 - 64
    this.goTxt.y = 64
    this.scoreTxt.x = VirtualScreen.width / 2 - 64
    this.scoreTxt.y = 140
    this.msgTxt.x = VirtualScreen.width / 2 - 64
    this.msgTxt.y = 180
  }
  enter (params:any) {
    this.score = params.score
    this.container.addChild(this.gameoverG)
    this.container.addChild(this.goTxt)
    this.container.addChild(this.scoreTxt)
    this.container.addChild(this.msgTxt)
  }
  exit () {
    this.container.removeChild(this.gameoverG)
    this.container.removeChild(this.goTxt)
    this.container.removeChild(this.scoreTxt)
    this.container.removeChild(this.msgTxt)
  }
  update(delta:number) {
    if (global.input.keyPressedSet.has('Enter')) {
      global.stateMachine.change('start')
    }
  }
  render () {
    this.gameoverG.clear()
    this.gameoverG.beginFill(rgbToNum(56,56,56), 234 / 255)
    this.gameoverG.drawRoundedRect(VirtualScreen.width / 2 - 64, 64, 128, 136, 4)
    this.scoreTxt.text = `Your Score: ${this.score}`
  }
    // love.graphics.setFont(gFonts['large'])
    // love.graphics.setColor(56, 56, 56, 234)
    // love.graphics.rectangle('fill', VIRTUAL_WIDTH / 2 - 64, 64, 128, 136, 4)
    // love.graphics.setColor(99, 155, 255, 255)
    // love.graphics.printf('GAME OVER', VIRTUAL_WIDTH / 2 - 64, 64, 128, 'center')
    // love.graphics.setFont(gFonts['medium'])
    // love.graphics.printf('Your Score: ' .. tostring(self.score), VIRTUAL_WIDTH / 2 - 64, 140, 128, 'center')
    // love.graphics.printf('Press Enter', VIRTUAL_WIDTH / 2 - 64, 180, 128, 'center')
}
