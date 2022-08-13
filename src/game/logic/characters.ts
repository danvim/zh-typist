import moeCharFreqPlain from '../../dataset/moeCharFreqPlain.json'
import sourceCharByCJLength from '../../dataset/charByCJLength.json'
import { initialDropDuration, initialV } from './contants'
import * as PIXI from 'pixi.js'

const charByCJLength = Object.fromEntries(
  Object.entries(sourceCharByCJLength)
    .map(([key, chars]) => [parseInt(key), new Set(chars.split(''))])
) as Record<1|2|3|4|5, Set<string>>

const properChars: Set<string> = new Set(moeCharFreqPlain.split(''))
const top2KSet: Set<string> = new Set(moeCharFreqPlain.substring(0, 2000).split(''))

export const commonEasyChars = [
  ...charByCJLength['1'],
  ...charByCJLength['2'],
  ...charByCJLength['3'],
].filter(char => top2KSet.has(char))

export const whatAreTheseChars = [
  ...charByCJLength['1'],
  ...charByCJLength['2'],
  ...charByCJLength['3'],
  ...charByCJLength['4'],
  ...charByCJLength['5'],
].filter(char => !properChars.has(char))

export const getRandomItemFrom = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)]

export interface DropText {
  elapsedTime: number
  text: PIXI.Text
  hasPassedBoundary: boolean
}

export const dropChar = (characterHeight: number, dropHeight: number, { elapsedTime, text }: DropText): void => {
  const minV = 1;
  const deceleration = 0.5 * (minV - initialV ** 2) / characterHeight
  const revealDuration = (minV - initialV) / deceleration
  const constantV = dropHeight / initialDropDuration

  if (elapsedTime < revealDuration) {
    // Reveal process
    text.y = initialV * elapsedTime + 0.5 * deceleration * elapsedTime * elapsedTime - characterHeight
  } else {
    // Drop process
    text.y += constantV
  }
}