import { nodeData, uuid, configData } from './graph-types'
import { ExerciseGraphEdge } from './ExerciseGraphEdge'
import { ExerciseGraphNode } from './ExerciseGraphNode'

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

  constructor({ blurb, language, exercises: { concept } }: configData) {
    this.warnings = []

    this.language = language
    this.blurb = blurb

    this.lookupByUuid = new Map()
    this.lookupByConcept = new Map()
    this.lookupByIndex = new Map()
    this.uuidOf = new Map()
    this.indexOf = new Map()

    this.nodes = concept.map((c, i) => this.addNode(i, c))

    this.computeEdges()
  }

  /**
   * addNode
   */
  public addNode(
    index: number,
    { slug, uuid, concepts, prerequisites }: nodeData
  ): ExerciseGraphNode {
    const node = new ExerciseGraphNode(
      index,
      slug,
      uuid,
      concepts,
      prerequisites
    )
    this.nodes.push(node)
    this.lookupByUuid.set(node.uuid, node)
    node.concepts.forEach((concept) => this.lookupByConcept.set(concept, node))
    this.uuidOf.set(node, node.uuid)
    return node
  }

  /**
   * computeEdges
   */
  public computeEdges(): void {
    this.nodes.forEach((node: ExerciseGraphNode) => {
      node.prerequisites.forEach((prereq) => {
        const from = this.lookupByConcept.get(prereq)?.uuid

        if (!from) {
          const warning = `ℹ️ the '${prereq}' concept doesn't have an exercise.`
          this.warnings.push(warning)
          return
        }

        const edge = new ExerciseGraphEdge(from, node.uuid)
        this.edges.push(edge)
      })
    })
  }
}
