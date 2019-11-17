import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import {Screen, VirtualScreen, BACKGROUND_SCROLL_SPEED} from './constants'
// import Input from './input'
import {IPixiSpriteSheet, generateQuads} from './utils'
import global from './global'
import StartState from './states/StartState'
import BeginGameState from './states/BeginGameState'
import PlayState from './states/PlayState'
import GameOverState from './states/GameOverState'

const app = new PIXI.Application({
  ...Screen
})
document.body.appendChild(app.view)
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
app.stage.scale.set(Screen.width / VirtualScreen.width, Screen.height / VirtualScreen.height)

const bgTexture = PIXI.Texture.from('../assets/background.png')
const bgSprite = PIXI.Sprite.from(bgTexture)
app.stage.addChild(bgSprite)
const boardContainer = new PIXI.Container()
app.stage.addChild(boardContainer)

let backgroundX = 0

const spriteSheetData:IPixiSpriteSheet = {
  frames: {},
  meta: {
    // "image": ".png",
    // "format": "RGBA8888",
    // "size": {"w":192,"h":256},
    // "scale": "1"
  }
}

function generateTileQuads (frames:{[tile:string]:PIXI.Texture}) {
  const tiles:PIXI.Texture[][] = []
  let counter = 1
  let idx = 0
  for (let row = 0; row < 9; row++) {
    for (let i = 0; i < 2; i++) {
      tiles[idx] = []
      for (let col = 0; col < 6; col++) {
        tiles[idx].push(frames[`quads${counter}`])
        counter++
      }
      idx++
    }
  }
  return tiles
}
const baseTexture = PIXI.BaseTexture.from('../assets/match3.png')
generateQuads(spriteSheetData, 384, 288, 32, 32, 'quads')
const spriteSheet = new PIXI.Spritesheet(baseTexture, spriteSheetData)
spriteSheet.parse(frames => {
  global.frames.tiles = generateTileQuads(frames)
  global.stateMachine.states = {
    'start': new StartState(app.stage),
    'begin-game': new BeginGameState(boardContainer),
    'play': new PlayState(app.stage),
    'game-over': new GameOverState(app.stage)
  }
  global.stateMachine.change('start')
  // board = generateBoard()
  // app.stage.addChild(highLightG)
  // selectedTile = board[0][0]

  app.ticker.add((delta) => {
    // drawBoard(offsetX, offsetY, board)
    backgroundX = backgroundX - BACKGROUND_SCROLL_SPEED * delta / 60
    if (backgroundX <= -1024 + VirtualScreen.width - 4 + 51) {
      backgroundX = 0
    }
    bgSprite.x = backgroundX
    global.stateMachine.update(delta)
    global.stateMachine.render()
    TWEEN.update()
    global.input.keyPressedSet.clear()
  })
})


const highLightG = new PIXI.Graphics()
let highlightedTile = false
let [highlightedX, highlightedY] = [0, 0]
const offsetX = 128
const offsetY = 16
let selectedTile:Tile
let board:Tile[][]
interface Tile {x:number, y:number, gridX:number, gridY:number, tile:number, sprite:PIXI.Sprite}
function generateBoard () {
  const tiles:Tile[][] = []

  for (let y = 0; y < 8; y++) {
    tiles.push([])
    for (let x = 0; x < 8; x++) {
      const tileId = Math.ceil(Math.random() * Object.keys(global.frames).length)
    }
  }
  return tiles
}
function drawBoard (offsetX:number, offsetY:number, board:Tile[][]) {
  highLightG.clear()
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const tile = board[y][x]
      tile.sprite.x = tile.x + offsetX
      tile.sprite.y = tile.y + offsetY
            // -- draw highlight on tile if selected
      if (highlightedTile) {
        if (tile.gridX === highlightedX && tile.gridY === highlightedY) {
          highLightG.beginFill(0xFFFFFF, 0.5)
          highLightG.drawRoundedRect(tile.x + offsetX, tile.y + offsetY, 32, 32, 4)
          highLightG.endFill()
                    // -- reset color back to default
                    // love.graphics.setColor(255, 255, 255, 255)
        }
      }
    }
  }
  highLightG.lineStyle(4, 0xF00000, 234 / 255)
  highLightG.drawRoundedRect(selectedTile.x + offsetX, selectedTile.y + offsetY, 32, 32, 4)
}
const keyPressed = function (key:string) {
  let [x, y] = [selectedTile.gridX, selectedTile.gridY]

  // -- input handling, staying constrained within the bounds of the grid
  if (key === 'ArrowUp') {
    if (y > 0) {
        selectedTile = board[y - 1][x]
    }
  } else if (key === 'ArrowDown') {
    if (y < 7) {
        selectedTile = board[y + 1][x]
    }
  } else if (key === 'ArrowLeft') {
    if (x > 0) {
        selectedTile = board[y][x - 1]
    }
  } else if (key === 'ArrowRight') {
    if (x < 7) {
        selectedTile = board[y][x + 1]
    }
  }

  // -- pressing enter highlights a tile if none is highlighted and swaps two tiles
  // -- if one is already
  if (key === 'Enter') {
    if (!highlightedTile) {
      highlightedTile = true
      ;[highlightedX, highlightedY] = [selectedTile.gridX, selectedTile.gridY]
    } else {
            // -- swap tiles
      let tile1 = selectedTile
      let tile2 = board[highlightedY][highlightedX]

          // -- swap tile information
      let [tempX, tempY] = [tile2.x, tile2.y]
      let [tempgridX, tempgridY] = [tile2.gridX, tile2.gridY]

        // -- swap places in the board
      let tempTile = tile1
      board[tile1.gridY][tile1.gridX] = tile2
      board[tile2.gridY][tile2.gridX] = tempTile

        // -- swap coordinates and tile grid positions
      const twnTile2 = new TWEEN.Tween(tile2).to({x: tile1.x, y: tile1.y}, 200).start()
      const twnTile1 = new TWEEN.Tween(tile1).to({x: tempX, y: tempY}, 200).start()

      ;[tile2.gridX, tile2.gridY] = [tile1.gridX, tile1.gridY]
      ;[tile1.gridX, tile1.gridY] = [tempgridX, tempgridY]

        // -- unhighlight
      highlightedTile = false
        // -- reset selection because of the swap
      selectedTile = tile2
    }
  }
  drawBoard(offsetX, offsetY, board)
}
