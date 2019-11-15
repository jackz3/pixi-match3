export default class Input {
  keySet = new Set()
  keyPressedSet = new Set()
  keyPressed = (key:string) => {}
  constructor () {
    this.init()
  }
  init () {
    document.addEventListener('keydown', (e) => {
      this.keySet.add(e.key)
    })
    document.addEventListener('keyup', e => {
      this.keySet.delete(e.key)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.keyPressedSet.add(e.key)
        this.keyPressed(e.key)
      }
    })
    document.addEventListener('keypress', (e) => {
      this.keyPressedSet.add(e.key)
      this.keyPressed(e.key)
    })
  }
}
