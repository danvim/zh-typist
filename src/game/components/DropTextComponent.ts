import { Component } from '../lib/Component'

export class DropTextComponent extends Component {
  text: string = ''
  elapsedTime: number = 0
  hasPassedBoundary: boolean = false

  onReset () {
    this.text = ''
    this.elapsedTime = 0
    this.hasPassedBoundary = false
  }
}