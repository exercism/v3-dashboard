import { ExerciseGraphNode } from './ExerciseGraphNode'

export class ExerciseGraphEdge {
  public from: ExerciseGraphNode
  public to: ExerciseGraphNode

  constructor(from: ExerciseGraphNode, to: ExerciseGraphNode) {
    this.from = from
    this.to = to
  }
}
