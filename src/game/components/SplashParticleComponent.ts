import { Component } from '../lib/Component'

export class SplashParticleComponent extends Component {
  v: [number, number] = [0, 0]
  lifetime = 0

  override onReset () {
    this.v = [0, 0]
    this.lifetime = 0
  }
}