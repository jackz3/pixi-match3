import * as PIXI from 'pixi.js'
import {BaseState, hCenter, rgbToNum} from '../utils'
import Board from '../Board'
import Tile from '../Tile'
import global from '../global'
import TWEEN, { Tween } from '@tweenjs/tween.js'
import { VirtualScreen } from '../constants'

export default class PlayState extends BaseState {
  transitionAlpha = 1
  // -- position in the grid which we're highlighting
  boardHighlightX = 0
  boardHighlightY = 0
  // -- timer used to switch the highlight rect's color
  rectHighlighted = false
  // -- flag to show whether we're able to process input (not swapping or clearing)
  canInput = true
  // -- tile we're currently highlighting (preparing to swap)
  highlightedTile?:Tile
  score = 0
  timer = 60
  level = 0
  board!:Board
  scoreGoal = 9999999
  hlTimer!:NodeJS.Timeout
  countDownTimer!:NodeJS.Timeout
  playG = new PIXI.Graphics()
  levelTxt = new PIXI.Text('', {fontSize: 14, fill: 'rgb(99, 155, 255)'})
  scoreTxt = new PIXI.Text('', {fontSize: 14, fill: 'rgb(99, 155, 255)'})
  goalTxt = new PIXI.Text('', {fontSize: 14, fill: 'rgb(99, 155, 255)'})
  timerTxt = new PIXI.Text('', {fontSize: 14, fill: 'rgb(99, 155, 255)'})
  constructor (public container:PIXI.Container) {
    super()
  }
  enter (params:any) {
    this.level = params.level
    // -- spawn a board and place it toward the right
    this.board = params.board// || new Board(VirtualScreen.width - 272, 16)
    // -- grab score from params if it was passed
    this.score = params.score || 0
    // -- score we have to reach to get to the next level
    this.scoreGoal = this.level * 1.25 * 100
    this.container.addChild(this.playG)
    this.container.addChild(this.levelTxt)
    this.container.addChild(this.scoreTxt)
    this.container.addChild(this.goalTxt)
    this.container.addChild(this.timerTxt)
    this.timer = 60
    this.boardHighlightX = 0
    this.boardHighlightY = 0
    this.hlTimer = setInterval(() => {
      this.rectHighlighted = !this.rectHighlighted
    }, 500)
    this.countDownTimer = setInterval(() => {
      this.timer--
      if (this.timer <= 5) {
          global.sounds['clock'].play()
      }
    }, 1000)
  }
  exit () {
    this.container.removeChild(this.playG)
    this.container.removeChild(this.levelTxt)
    this.container.removeChild(this.scoreTxt)
    this.container.removeChild(this.goalTxt)
    this.container.removeChild(this.timerTxt)
    this.board.clear()
  }
  update (delta:number) {
    // -- go back to start if time runs out
    if (this.timer <= 0) {
      clearInterval(this.hlTimer)
      clearInterval(this.countDownTimer)
      global.sounds['game-over'].play()

      global.stateMachine.change('game-over', {
        score: this.score
      })
    }
    // -- go to next level if we surpass score goal
    if (this.score >= this.scoreGoal) {
      clearInterval(this.hlTimer)
      clearInterval(this.countDownTimer)
      global.sounds['next-level'].play()
      global.stateMachine.change('begin-game', {
        level: this.level + 1,
        score: this.score,
        board: this.board
      })
    }
    if (this.canInput) {
      if (global.input.keyPressedSet.has('ArrowUp')) {
        this.boardHighlightY = Math.max(0, this.boardHighlightY - 1)
        global.sounds['select'].play()
      } else if (global.input.keyPressedSet.has('ArrowDown')) {
        this.boardHighlightY = Math.min(7, this.boardHighlightY + 1)
        global.sounds['select'].play()
      } else if (global.input.keyPressedSet.has('ArrowLeft')) {
        this.boardHighlightX = Math.max(0, this.boardHighlightX - 1)
        global.sounds['select'].play()
      } else if (global.input.keyPressedSet.has('ArrowRight')) {
        this.boardHighlightX = Math.min(7, this.boardHighlightX + 1)
        global.sounds['select'].play()
      }
        // -- if we've pressed enter, to select or deselect a tile...
      if (global.input.keyPressedSet.has('Enter')) {
        // -- if same tile as currently highlighted, deselect
        let x = this.boardHighlightX
        let y = this.boardHighlightY
        // -- if nothing is highlighted, highlight current tile
        if (!this.highlightedTile) {
          this.highlightedTile = this.board.tiles[y][x]
            // -- if we select the position already highlighted, remove highlight
        } else if (this.highlightedTile == this.board.tiles[y][x]) {
          this.highlightedTile = undefined
            // -- if the difference between X and Y combined of this highlighted tile
            // -- vs the previous is not equal to 1, also remove highlight
        } else if (Math.abs(this.highlightedTile.gridX - x) + Math.abs(this.highlightedTile.gridY - y) > 1) {
          global.sounds['error'].play()
          this.highlightedTile = undefined
        } else {
                // -- swap grid positions of tiles
          let tempX = this.highlightedTile.gridX
          let tempY = this.highlightedTile.gridY

          let newTile = this.board.tiles[y][x] as Tile
          this.highlightedTile.gridX = newTile.gridX
          this.highlightedTile.gridY = newTile.gridY
          newTile.gridX = tempX
          newTile.gridY = tempY
                // -- swap tiles in the tiles table
          this.board.tiles[this.highlightedTile.gridY][this.highlightedTile.gridX] = this.highlightedTile

          this.board.tiles[newTile.gridY][newTile.gridX] = newTile
                // -- tween coordinates between the two so they swap
            new TWEEN.Tween(this.highlightedTile).to({x: newTile.x, y: newTile.y}, 100).start()
              .onComplete(() => {
                // this.highlightedTile = undefined
                this.calculateMatches()
              })
            new TWEEN.Tween(newTile).to({x: this.highlightedTile.x, y: this.highlightedTile.y}, 100).start()
                // Timer.tween(0.1, {
                //     [self.highlightedTile] = {x = newTile.x, y = newTile.y},
                //     [newTile] = {x = self.highlightedTile.x, y = self.highlightedTile.y}
                // })
        }
      }
    }
  }
  render() {
    // -- render board of tiles
    this.board.render()
    this.playG.clear()
    // -- render highlighted tile if it exists
    if (this.highlightedTile) {
        // -- multiply so drawing white rect makes it brighter
        // love.graphics.setBlendMode('add')
        // love.graphics.setColor(255, 255, 255, 96)
        // love.graphics.rectangle('fill', (self.highlightedTile.gridX - 1) * 32 + (VIRTUAL_WIDTH - 272),  (self.highlightedTile.gridY - 1) * 32 + 16, 32, 32, 4)
      this.playG.beginFill(0xFFFFFF, 96 / 255)
      this.playG.drawRoundedRect((this.highlightedTile.gridX) * 32 + (VirtualScreen.width - 272), (this.highlightedTile.gridY) * 32 + 16, 32, 32, 4)
      this.playG.endFill()
        // -- back to alpha
        // love.graphics.setBlendMode('alpha')
    }
    // -- render highlight rect color based on timer
    let color
    if (this.rectHighlighted) {
      color = rgbToNum(217, 87, 99)
        // love.graphics.setColor(217, 87, 99, 255)
    } else {
      color = rgbToNum(172, 50, 50)
        // love.graphics.setColor(172, 50, 50, 255)
    }
    this.playG.lineStyle(4, color)
    this.playG.drawRoundedRect(this.boardHighlightX * 32 + (VirtualScreen.width - 272), this.boardHighlightY * 32 + 16, 32, 32, 4)
    // -- draw actual cursor rect
    // love.graphics.setLineWidth(4)
    // love.graphics.rectangle('line', self.boardHighlightX * 32 + (VIRTUAL_WIDTH - 272), self.boardHighlightY * 32 + 16, 32, 32, 4)
    // -- GUI text
    // love.graphics.setColor(56, 56, 56, 234)
    // love.graphics.rectangle('fill', 16, 16, 186, 116, 4)
    this.playG.lineStyle(0)
    this.playG.beginFill(rgbToNum(56, 56, 56), 234 / 255)
    this.playG.drawRoundedRect(16, 16, 186, 116, 4)
    this.playG.endFill()

    this.levelTxt.text = `Level: ${this.level}`
    this.levelTxt.y = 24
    hCenter(this.levelTxt, 182, 20)
    this.scoreTxt.text = `Score: ${this.score}`
    this.scoreTxt.y = 52
    hCenter(this.scoreTxt, 182, 20)
    this.goalTxt.text = `Goal : ${this.scoreGoal}`
    this.goalTxt.y = 80
    hCenter(this.goalTxt, 182, 20)
    this.timerTxt.text = `Timer: ${this.timer}`
    this.timerTxt.y = 108
    hCenter(this.timerTxt, 182, 20)
    // love.graphics.setColor(99, 155, 255, 255)
    // love.graphics.setFont(gFonts['medium'])
    // love.graphics.printf('Level: ' .. tostring(self.level), 20, 24, 182, 'center')
    // love.graphics.printf('Score: ' .. tostring(self.score), 20, 52, 182, 'center')
    // love.graphics.printf('Goal : ' .. tostring(self.scoreGoal), 20, 80, 182, 'center')
    // love.graphics.printf('Timer: ' .. tostring(self.timer), 20, 108, 182, 'center')
  }
  calculateMatches () {
    this.highlightedTile = undefined
    // -- if we have any matches, remove them and tween the falling blocks that result
    let matches = this.board.calculateMatches()
    
    if (matches) {
        global.sounds['match'].stop()
        global.sounds['match'].play()
        // -- add score for each match
      matches.forEach(tiles => {
        this.score += tiles.length * 50
      })
      // for k, match in pairs(matches) do
      //       self.score = self.score + #match * 50
      //   end
        // -- remove any tiles that matched from the board, making empty spaces
      this.board.removeMatches()

        // -- gets a table with tween values for tiles that should now fall
      let tilesToFall = this.board.getFallingTiles()
      const len = tilesToFall.length;
      if (len > 0) {
        new TWEEN.Tween(tilesToFall[0].obj).to(tilesToFall[0].to, 250).start()
          .onComplete(() => {
            this.calculateMatches()
          })
      }
      for (let i = 1; i < len; i++) {
        new TWEEN.Tween(tilesToFall[i].obj).to(tilesToFall[i].to, 250).start()
      }
        // -- tween new tiles that spawn from the ceiling over 0.25s to fill in
        // -- the new upper gaps that exist
        // Timer.tween(0.25, tilesToFall):finish(function()
            
        //     -- recursively call function in case new matches have been created
        //     -- as a result of falling blocks once new blocks have finished falling
        //     self:calculateMatches()
        // end)
    // -- if no matches, we can continue playing
    } else {
      this.canInput = true
    }
  }
}
