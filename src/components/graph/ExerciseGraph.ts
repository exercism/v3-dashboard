import { uuid } from './graph-types'
import { ExerciseGraphEdge } from './ExerciseGraphEdge'
import { ExerciseGraphNode } from './ExerciseGraphNode'

const computeEdges = (
  nodes: Array<ExerciseGraphNode>,
  lookupByConcept: Map<string, ExerciseGraphNode>,
  warnings: Array<string>
): Array<ExerciseGraphEdge> => {
  const edges: Array<ExerciseGraphEdge> = []

  nodes.forEach((node: ExerciseGraphNode) => {
    node.prerequisites.forEach((prereq) => {
      const from = lookupByConcept.get(prereq)

      if (!from) {
        const warning = `ℹ️ the '${prereq}' concept doesn't have an exercise.`
        warnings.push(warning)
        return
      }

      const edge = new ExerciseGraphEdge(from, node)
      edges.push(edge)
    })
  })

  return edges
}

export class ExerciseGraph {
  public language: string
  public blurb: string

  public edges: Array<ExerciseGraphEdge>
  public nodes: Array<ExerciseGraphNode>

  public lookupByUuid: Map<uuid, ExerciseGraphNode>
  public lookupByConcept: Map<string, ExerciseGraphNode>
  public lookupByIndex: Map<number, ExerciseGraphNode>
  public uuidOf: Map<ExerciseGraphNode, uuid>
  public indexOf: Map<ExerciseGraphNode, number>

  public warnings: Array<string>

  constructor({ blurb, language, exercises: { concept } }: TrackConfiguration) {
    this.warnings = []

    this.language = language
    this.blurb = blurb

    this.lookupByUuid = new Map()
    this.lookupByConcept = new Map()
    this.lookupByIndex = new Map()
    this.uuidOf = new Map()
    this.indexOf = new Map()

    this.nodes = concept.map(({ slug, uuid, concepts, prerequisites }, i) =>
      this.addNode(i, slug, uuid, [...concepts], [...prerequisites])
    )
    this.edges = computeEdges(this.nodes, this.lookupByConcept, this.warnings)
  }

  /**
   * addNode
   */
  public addNode(
    index: number,
    slug: string,
    uuid: string,
    concepts: Array<string>,
    prerequisites: Array<string>
  ): ExerciseGraphNode {
    const node = new ExerciseGraphNode(
      index,
      slug,
      uuid,
      concepts,
      prerequisites
    )
    this.lookupByUuid.set(node.uuid, node)
    this.lookupByIndex.set(node.index, node)
    node.concepts.forEach((concept) => this.lookupByConcept.set(concept, node))
    this.uuidOf.set(node, node.uuid)
    return node
  }
}
