import { ExerciseGraphNode } from './ExerciseGraphNode'
export class ExerciseGraphEdge {
  constructor(
    public readonly from: ExerciseGraphNode,
    public readonly to: ExerciseGraphNode
  ) {}
}
