import { UUID, Slug } from './graph-types'
import { ExerciseGraphEdge } from './ExerciseGraphEdge'
import { ExerciseGraphNode } from './ExerciseGraphNode'

export class ExerciseGraph {
  public language: string
  public blurb: string

  public edges: ExerciseGraphEdge[]
  public exercises: ExerciseGraphNode[]

  public lookupByUuid: Map<UUID, ExerciseGraphNode>
  public lookupByConcept: Map<string, ExerciseGraphNode>
  public lookupByIndex: Map<number, ExerciseGraphNode>

  public missingConcepts: Set<string>
  public lookupMissingConceptsForExercise: Map<Slug, string[]>

  constructor({ blurb, language, exercises: { concept } }: TrackConfiguration) {
    this.language = language
    this.blurb = blurb

    this.lookupByUuid = new Map()
    this.lookupByConcept = new Map()
    this.lookupByIndex = new Map()

    this.missingConcepts = new Set()
    this.lookupMissingConceptsForExercise = new Map()

    this.exercises = concept.map(({ slug, uuid, concepts, prerequisites }, i) =>
      this.addExercise(i, slug, uuid, [...concepts], [...prerequisites])
    )
    this.edges = this.computeEdges()
  }

  /**
   * addExercise
   * adds a node to the graph on construction of the graph
   * builds indexes for fast look up of data.
   *
   * @param index the index in the original configuration file
   * @param slug the exercise unique slug
   * @param uuid the exercise unique identifier as uuid
   * @param concepts the list of unlockable concept-keys for the exercise
   * @param prerequisites the list of prerequisite concept-keys for the exercise
   *
   * @returns the exercise graph node
   */
  private addExercise(
    index: number,
    slug: string,
    uuid: string,
    concepts: string[],
    prerequisites: string[]
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
    return node
  }

  /**
   * computeEdges
   * This computes all edges from the nodes. Each edge is defined as exercise -> exercise.
   */
  private computeEdges(): ExerciseGraphEdge[] {
    const edges: ExerciseGraphEdge[] = []

    this.exercises.forEach((exercise) => {
      exercise.prerequisites.forEach((prerequisite) => {
        const prerequisiteExercise = this.lookupByConcept.get(prerequisite)

        if (!prerequisiteExercise) {
          this.addMissingConcept(exercise.slug, prerequisite)
          return
        }

        edges.push(new ExerciseGraphEdge(prerequisiteExercise, exercise))
      })
    })

    return edges
  }

  private addMissingConcept(slug: Slug, concept: string): void {
    this.missingConcepts.add(concept)
    const knownMissing = this.lookupMissingConceptsForExercise.get(slug) ?? []
    this.lookupMissingConceptsForExercise.set(slug, knownMissing)
    knownMissing.push(concept)
    this.missingConcepts.add(concept)
  }
}
