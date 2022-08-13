import * as PIXI from 'pixi.js'
import { characterHeight } from '../logic/contants'

export const hudTextStyle = new PIXI.TextStyle({
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Noto Sans TC', 'Noto Sans CJK TC', 'Heiti TC', 'Microsoft JhengHei', 'Microsoft Yahei', sans-serif",
  fontSize: characterHeight / 2,
  fontStyle: 'normal',
  fontWeight: 'normal',
  fill: ['#ffffff', '#b7b7b7'],
  dropShadow: true,
  dropShadowColor: '#7102fa',
  dropShadowBlur: 4,
  dropShadowDistance: 0,
  dropShadowAlpha: 0.8,
  lineJoin: 'round',
});

export const dropTextStyle = new PIXI.TextStyle({
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Noto Sans TC', 'Noto Sans CJK TC', 'Heiti TC', 'Microsoft JhengHei', 'Microsoft Yahei', sans-serif",
  fontSize: characterHeight,
  fontStyle: 'normal',
  fontWeight: 'normal',
  fill: ['#F8AAF0', '#F452E4'], // gradient
  dropShadow: true,
  dropShadowColor: '#7102fa',
  dropShadowBlur: 4,
  dropShadowDistance: 0,
  dropShadowAlpha: 0.8,
  lineJoin: 'round',
});

export const dropTextStyle2 = dropTextStyle.clone()
dropTextStyle2.fill = ['#ffffff', '#b7b7b7']