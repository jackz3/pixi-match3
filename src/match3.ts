import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import {Screen, VirtualScreen} from './constants'
import Input from './input'
import {IPixiSpriteSheet, generateQuads} from './utils'

const app = new PIXI.Application({
  ...Screen
})
document.body.appendChild(app.view)
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
app.stage.scale.set(Screen.width / VirtualScreen.width, Screen.height / VirtualScreen.height)

const inp = new Input()
const highLightG = new PIXI.Graphics()
const global:any = {}
let highlightedTile = false
let [highlightedX, highlightedY] = [0, 0]
const offsetX = 128
const offsetY = 16
let selectedTile:Tile
let board:Tile[][]

const spriteSheetData:IPixiSpriteSheet = {
  frames: {},
  meta: {
    // "image": ".png",
    // "format": "RGBA8888",
    // "size": {"w":192,"h":256},
    // "scale": "1"
  }
}
const baseTexture = PIXI.BaseTexture.from('../assets/match3.png')
generateQuads(spriteSheetData, 384, 288, 32, 32, 'quads')
const spriteSheet = new PIXI.Spritesheet(baseTexture, spriteSheetData)
spriteSheet.parse(frames => {
  global.frames = {...global.frames, ...frames}

  board = generateBoard()
  app.stage.addChild(highLightG)
  selectedTile = board[0][0]

  app.ticker.add((delta) => {
    drawBoard(offsetX, offsetY, board)
    TWEEN.update()
    // global.stateMachine.update(delta)
    // global.stateMachine.render()
    // inp.keyPressedSet.clear()
  })
})

interface Tile {x:number, y:number, gridX:number, gridY:number, tile:number, sprite:PIXI.Sprite}
function generateBoard () {
  const tiles:Tile[][] = []

  for (let y = 0; y < 8; y++) {
    tiles.push([])
    for (let x = 0; x < 8; x++) {
      const tileId = Math.ceil(Math.random() * Object.keys(global.frames).length)
      const sprite = PIXI.Sprite.from(global.frames[`quads${tileId}`])
      const tile = {
            x: x * 32,
            y: y * 32,
            // -- now we need to know what tile X and Y this tile is
            gridX: x,
            gridY: y,
            // -- assign a random ID to tile to make it a random tile
            tile: tileId,
            sprite: sprite
      }
      tiles[y].push(tile)
      sprite.x = tile.x + offsetX
      sprite.y = tile.y + offsetY
      app.stage.addChild(sprite)
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

inp.keyPressed = function (key) {
    // if key == 'escape' then
    //     love.event.quit()
    // end

    // -- double assignment; Lua shortcut
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
      // ;[tile2.x, tile2.y] = [tile1.x, tile1.y]
      // ;[tile1.x, tile1.y] = [tempX, tempY]
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
