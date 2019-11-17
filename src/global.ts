import * as PIXI from 'pixi.js'
import Input from './input'
import {StateMachine} from './utils'

interface Global {
  stateMachine: StateMachine,
  input:Input,
  frames: {
    tiles: PIXI.Texture[][]
  },
  [key: string]: any,
}
const global:Global = {
  stateMachine: new StateMachine(),
  input: new Input(),
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