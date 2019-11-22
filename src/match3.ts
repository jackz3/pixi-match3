import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import {Screen, VirtualScreen, BACKGROUND_SCROLL_SPEED} from './constants'
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
    'start': new StartState(app.stage, boardContainer, app.renderer),
    'begin-game': new BeginGameState(boardContainer),
    'play': new PlayState(app.stage),
    'game-over': new GameOverState(app.stage)
  }
  global.stateMachine.change('start')
  // global.sounds['music'].play()

  app.ticker.add((delta) => {
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
