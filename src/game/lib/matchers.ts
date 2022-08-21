import { Component, ComponentConstructor } from './Component'

export type MatcherFunction<T> = (value: unknown) => value is T

export type Matcher<T> = T extends Component
  ? ComponentConstructor<T>
  : MatcherFunction<T>

export type InferMatched<M extends Matcher<any>> = M extends Matcher<infer T> ? T : never

export type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export const isComponentConstructor = (value: Function): value is ComponentConstructor<any> => value.prototype instanceof Component

const matcherFunction = <T extends Matcher<any>>(matcher: Matcher<T>, value: unknown): value is InferMatched<T> => {
  if (isComponentConstructor(matcher)) {
    return value instanceof matcher
  } else {
    return matcher(value)
  }
}

export const isAnyOf = <Matchers extends [Matcher<any>, ...Matcher<any>[]]> (...matchers: Matchers) => (value: unknown): value is InferMatched<Matchers[number]> =>
  matchers.some(matcher => matcherFunction(matcher, value))

export const isAllOf = <Matchers extends [Matcher<any>, ...Matcher<any>[]]> (...matchers: Matchers) => (value: unknown): value is UnionToIntersection<InferMatched<Matchers[number]>> =>
  matchers.every(matcher => matcherFunction(matcher, value))
