import { uuid } from './graph-types'

export class ExerciseGraphEdge {
  public from: uuid
  public to: uuid

  constructor(from: uuid, to: uuid) {
    this.from = from
    this.to = to
  }
}
