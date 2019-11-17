export function center (displable:PIXI.Sprite, width:number, height:number, startX:number = 0, startY:number = 0) {
  hCenter(displable, width, startX)
  displable.y = (height - displable.height) / 2 + startY
}
export function hCenter (displable:PIXI.Sprite, width:number, startX:number = 0) {
  displable.x = (width - displable.width) / 2 + startX
}

export interface IPixiSpriteSheet {
  frames:{[key:string]: {frame:any, rotated: boolean, trimmed: boolean, spriteSourceSize: any, sourceSize: any}},
  meta:any
}

export function generateQuads (sheetData:IPixiSpriteSheet, baseWidth:number, baseHeight:number, tilewidth:number, tileheight:number, name:string = '') {
  const sheetWidth = baseWidth / tilewidth
  const sheetHeight = baseHeight / tileheight

  let sheetCounter = 1
  for (let y = 0; y < sheetHeight; y++) {
    for (let x = 0; x < sheetWidth; x++) {
      sheetData.frames[`${name}${sheetCounter}`] = {
        "frame": {"x": x * tilewidth,"y": y * tileheight,"w": tilewidth,"h": tileheight},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w": tilewidth,"h": tileheight},
        "sourceSize": {"w": tilewidth,"h": tileheight}
      }
      sheetCounter++
    }
  }
}

export class StateMachine {
  empty: BaseState
  current: BaseState
  constructor (public states:{[state: string]: BaseState} = {}) {
    this.empty = new BaseState()
    this.current = this.empty
  }
  change (stateName:string, params?:any) {
    if (this.states[stateName]) {
      this.current.exit()
      this.current = this.states[stateName]
      this.current.enter(params)
    }
  }
  update (delta:number) {
    this.current.update(delta)
  }
  render () {
    this.current.render()
  }
}

export class BaseState {
  enter (params?:any) {}
  exit() {}
  update (delta:number) {}
  render() {}
}

export function aabbCollision (x1:number, y1:number, w1:number, h1:number, x2:number, y2:number,w2:number, h2:number): boolean {
  return x1 < x2+w2 &&
         x2 < x1+w1 &&
         y1 < y2+h2 &&
         y2 < y1+h1
}

export function rand(to:number, from:number = 0) {
  return Math.floor(Math.random() * to) + from
}

export function rgbToNum (r:number, g:number, b:number) {
  return (r << 16) + (g << 8) + b
}
