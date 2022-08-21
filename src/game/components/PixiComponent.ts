import type Pixi from 'pixi.js'
import { Component } from '../lib/Component'

export class PixiComponent extends Component {
  parent?: Pixi.Container
  obj?: Pixi.Container

  override onReset() {
    this.parent = undefined
    this.obj = undefined
  }

  override onRemove () {
    if (this.obj !== undefined) {
      this.parent?.removeChild(this.obj)
    }
  }

  override onCreate () {
    if (this.obj !== undefined && this.parent !== undefined) {
      this.obj.setParent(this.parent)
    }
  }
}