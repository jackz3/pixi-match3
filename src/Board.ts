import * as PIXI from 'pixi.js'
import {rand} from './utils'
import Tile from './Tile'
import {Screen} from './constants'

export default class Board {
  matches:Tile[][] = []
  tiles:Tile[][] = []
  level = 1
  renderTexture = PIXI.RenderTexture.create({width: Screen.width, height: Screen.height})
  constructor (public x:number, public y:number, public container:PIXI.Container, public renderer:PIXI.Renderer) {
    this.initializeTiles(x, y)
  }
  initializeTiles (x:number, y:number, level:number = 6) {
    this.x = x
    this.y = y
    this.level = level
    this.tiles = []
    for (let tileY = 0; tileY < 8; tileY++) {
      this.tiles.push([])
      for (let tileX = 0; tileX < 8; tileX++) {
          // -- create a new tile at X,Y with a random color and variety
        const tile = new Tile(tileX, tileY, rand((this.level + 9) % 17, 2), rand(this.level % 7))
        this.tiles[tileY].push(tile)
        this.container.addChild(tile.sprite)
      }
    }

    while (this.calculateMatches().length) {
      console.log('m')
      this.clear()
        // -- recursively initialize if matches were returned so we always have
        // -- a matchless board on start
      this.initializeTiles(x, y, this.level)
    }

    const opts = {
      alpha: 0.7,
      blur: 2,
      color: 0x000000,
      distance: 2,
      quality: 4
    }
    const blurFilter = new PIXI.filters.BlurFilter(opts.blur, opts.quality)
    // const bounds = this.boardContainer.getBounds()
    // const renderTexture = PIXI.RenderTexture.create({width: bounds.right, height: bounds.bottom})
    const dropShadow = new PIXI.Sprite(this.renderTexture)
    dropShadow.x = opts.distance
    dropShadow.y = opts.distance
    dropShadow.alpha = opts.alpha
    dropShadow.filters = [blurFilter]
    dropShadow.tint = opts.color
    this.container.addChildAt(dropShadow, 0)
  }
  clear () {
    this.container.removeChildren()
  }
  calculateMatches () {
    const shinies:number[] = []
    const matches = []
    // -- how many of the same color blocks in a row we've found
    let matchNum = 1
    // -- horizontal matches first
    for (let y = 0; y < 8; y++) {
      let colorToMatch = this.tiles[y][0].color
      matchNum = 1
        // -- every horizontal tile
      for (let x = 1; x < 8; x++) {
        // -- if this is the same color as the one we're trying to match...

        if (this.tiles[y][x].color === colorToMatch) {
          matchNum++
        } else {
                // -- set this as the new color we want to watch for
          colorToMatch = this.tiles[y][x].color
          // -- if we have a match of 3 or more up to now, add it to our matches table
          if (matchNum >= 3) {
            let match = []
                    // -- go backwards from here by matchNum
            for (let x2 = x - 1; x2 >= (x - matchNum); x2--) {
              // -- add each tile to the match that's in that match
              const tile = this.tiles[y][x2]
              if (tile.shiny && !shinies.includes(tile.gridY)) {
                match = Array(8).fill(1).map((x, i) => this.tiles[y][i])
                shinies.push(tile.gridY)
                break
              }
              match.push(tile)
            }
            matches.push(match)
          }
          matchNum = 1
                // -- don't need to check last two if they won't be in a match
          if (x > 5) {
            break
          }
        }
      }
      if (matchNum >= 3) {
        let match = []
            // -- go backwards from end of last row by matchNum
        for (let x = 7; x >= 8 - matchNum; x--) {
          match.push(this.tiles[y][x])
        }
        matches.push(match)
      }
    }
    for (let x = 0; x < 8; x++) {
      let colorToMatch = this.tiles[0][x].color
      matchNum = 1
        // -- every vertical tile
      for (let y = 1; y < 8; y++) {
        if (this.tiles[y][x].color === colorToMatch) {
          matchNum++
        } else {
          colorToMatch = this.tiles[y][x].color
          if (matchNum >= 3) {
            let match = []
            for (let y2 = y - 1; y2 >= (y - matchNum); y2--) {
              const tile = this.tiles[y2][x]
              if (tile.shiny && !shinies.includes(tile.gridY)) {
                match.push(...Array(8).fill(1).map((x, i) => this.tiles[y2][i]))
                shinies.push(tile.gridY)
              } else {
                match.push(tile)
              }
            }
            matches.push(match)
                    // table.insert(matches, match)
          }
          matchNum = 1
                // -- don't need to check last two if they won't be in a match
          if (y > 5) {
            break
          }
        }
      }
        // -- account for the last column ending with a match
      if (matchNum >= 3) {
        let match = []
            // -- go backwards from end of last row by matchNum
        for (let y = 7; y >= 8 - matchNum; y--) {
          match.push(this.tiles[y][x])
        }
        matches.push(match)
      }
    }
    matches.forEach(tiles => {
      tiles.forEach(tile => {
        if (tile.shiny) {

        }
      })
    })
    this.matches = matches
    // -- return matches table if > 0, else just return false
    return this.matches
  }
  removeMatches () {
    this.matches.forEach(match => {
      match.forEach(tile => {
        this.tiles[tile.gridY][tile.gridX].toBeDel = true
        this.container.removeChild(tile.sprite)
      })
    })
    this.matches = []
  }
  getFallingTiles () {
    // -- tween table, with tiles as keys and their x and y as the to values
    let tweens = []
    // -- for each column, go up tile by tile till we hit a space
    for (let x = 0; x < 8; x++) {
      let space = false
      let spaceY = 0

      let y = 7
      while (y >= 0) {
            // -- if our last tile was a space...
        let tile = this.tiles[y][x]
        if (space) {
                // -- if the current tile is *not* a space, bring this down to the lowest space
          if (!tile.toBeDel) {
                    // -- put the tile in the correct spot in the board and fix its grid positions
            const tmpTile = this.tiles[spaceY][x]
            this.tiles[spaceY][x] = tile
            tile.gridY = spaceY
            // -- set its prior position to nil
            this.tiles[y][x] = tmpTile// = undefined
            tweens.push({
              obj: tile,
              to: {y: (tile.gridY) * 32}
            })
            // -- tween the Y position to 32 x its grid position
            // tweens[tile] = {
            //             y = (tile.gridY - 1) * 32
            //         }
                    // -- set Y to spaceY so we start back from here again
            space = false
            y = spaceY
                    // -- set this back to 0 so we know we don't have an active space
            spaceY = 0
          }
        } else if (tile.toBeDel) {
          space = true
          // -- if we haven't assigned a space yet, set this to it
          if (spaceY === 0) {
            spaceY = y
          }
        }
        y--
      }
    }
        // -- create replacement tiles at the top of the screen
    for (let x = 0; x < 8; x++) {
      for (let y = 7; y >= 0; y--) {
        let tile = this.tiles[y][x]
            // -- if the tile is nil, we need to add a new one
        if (tile.toBeDel) {
          tile = new Tile(x, y, rand((this.level + 9) % 17, 2), rand(this.level % 7))
          tile.y = -32
          this.container.addChild(tile.sprite)
          this.tiles[y][x] = tile
          tweens.push({
            obj: tile,
            to: {y: (tile.gridY) * 32}
          })
                // -- create a new tween to return for this tile to fall down
                // tweens[tile] = {
                //     y = (tile.gridY - 1) * 32
                // }
        }
      }
    }
    return tweens
  }
  render () {
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[1].length; x++) {
        this.tiles[y][x].render(this.x, this.y)
      }
    }
    this.renderer.render(this.container, this.renderTexture)
  }
}
