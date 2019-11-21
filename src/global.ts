import * as PIXI from 'pixi.js'
import {Howl} from 'howler'
import Input from './input'
import {StateMachine} from './utils'

interface Global {
  stateMachine: StateMachine,
  input:Input,
  sounds: {
    [key:string]:Howl
  },
  frames: {
    tiles: PIXI.Texture[][]
  },
  [key: string]: any,
}
const global:Global = {
  stateMachine: new StateMachine(),
  input: new Input(),
  sounds: {
    'music': new Howl({src: ['../assets/music.mp3'], loop: true}),
    'select': new Howl({src: ['../assets/select.wav']}),
    'error': new Howl({src: ['../assets/error.wav']}),
    'match': new Howl({src: ['../assets/match.wav']}),
    'clock': new Howl({src: ['../assets/clock.wav']}),
    'game-over': new Howl({src: ['../assets/game-over.wav']}),
    'next-level': new Howl({src: ['../assets/next-level.wav']})
  },
  frames: {
    tiles: []
  }
}
export default global
// const global = {
//   stateMachine: new StateMachine(),
//   frames: {
//     tiles: []
//   }
// }