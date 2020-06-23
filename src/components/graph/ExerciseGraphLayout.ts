import { ExerciseGraph } from './ExerciseGraph'
import { adjacencyMatrix } from './graph-types'
import { ExerciseGraphNode } from './ExerciseGraphNode'

export class ExerciseGraphLayout {
  public graph: ExerciseGraph
  private adjacency: adjacencyMatrix

  public exerciseLayers: Array<Array<ExerciseGraphNode>>
  public conceptLayers: Array<Array<string>>

  public layerCount: number

  constructor(graph: ExerciseGraph) {
    this.graph = graph
    this.adjacency = makeAdjacencyMatrix(graph)

    if (this.containsCycle()) {
      throw new Error('🔥 Cannot continue. See error log.')
    }

    this.exerciseLayers = []
    this.conceptLayers = []
    this.computeNodeDepths()
    this.layerCount = this.exerciseLayers.length

    console.log(this)
  }

  /**
   * This private method checks the current graph if it contains a cycle.  If a cycle exists:
   *   - This graph cannot be rendered
   *   - Points at a larger problem with the exercise concept pre-requisites
   */
  private containsCycle(): boolean {
    const visited: Array<boolean> = new Array(this.adjacency.length).fill(false)
    const isOnStack: Array<boolean> = new Array(this.adjacency.length).fill(
      false
    )
    const stack: Array<number> = []

    // Attempt to start from each node in the case the graph is disjunct
    for (let source = 0; source < this.adjacency.length; source += 1) {
      if (visited[source]) continue
      stack.push(source)

      // loop until the stack is empty (i.e. you have visited all of the nodes)
      while (stack.length > 0) {
        const n = stack[stack.length - 1]

        if (!visited[n]) {
          visited[n] = true
          isOnStack[n] = true
        } else {
          isOnStack[n] = false
          stack.pop()
        }

        for (const next of this.adjacency[n]) {
          if (!visited[next]) {
            stack.push(next)
          } else if (isOnStack[next]) {
            console.error(
              `Graph Cycle Detected '${
                this.graph.lookupByIndex.get(n)?.slug
              }' to '${this.graph.lookupByIndex.get(next)?.slug}'`
            )
            return true
          }
        }
      }
    }
    return false
  }

  /**
   * computeNodeDepths
   * This computes the depth of all nodes, first exercises then prerequisite concepts
   * that are not yet represented in an exercise.
   */
  private computeNodeDepths(): void {
    const inDegrees = this.findIndegreeOfExercises()
    const sourceExercises = this.findSourceExercises(inDegrees)
    const exerciseDepths = this.findExerciseDepths(sourceExercises)
    const maximumDepth = Math.max.apply(null, exerciseDepths)
    this.exerciseLayers = this.constructExerciseLayers(
      exerciseDepths,
      maximumDepth
    )
    this.conceptLayers = this.constructConceptLayers(this.exerciseLayers)
  }

  /**
   * Use the adjacency matrix to find the in-degree of each
   * node (the number of edges pointing to the node)
   *
   * Return an array of numbers, where each index (representing
   * an ExerciseGraphNode) holds the indegree value
   */
  private findIndegreeOfExercises(): Array<number> {
    const indegrees = new Array(this.adjacency.length).fill(0)
    for (const tos of this.adjacency) {
      for (const to of tos) {
        indegrees[to] += 1
      }
    }
    return indegrees
  }

  /**
   * Nodes with inDegree of 0 are source nodes (roots) of the graph
   */
  private findSourceExercises(inDegrees: Array<number>): Array<number> {
    const sources: Array<number> = []
    inDegrees.forEach((inDegree, i) => {
      if (inDegree === 0) sources.push(i)
    })
    return sources
  }

  /**
   * Perform a recursive search to find the length of longest path
   * to each exercise from any source.  This places an exercise
   * after all of its prerequisites.
   */
  private findExerciseDepths(sources: Array<number>): Array<number> {
    const maxDepths = new Array(this.adjacency.length).fill(0)
    for (const source of sources) {
      const traverse = (index: number, depth = 0): void => {
        if (depth > maxDepths[index]) {
          maxDepths[index] = depth
        }

        const children = this.adjacency[index]
        children.forEach((child) => traverse(child, depth + 1))
      }
      traverse(source)
    }
    return maxDepths
  }

  /**
   * order the exercises by depth then index into layers
   */
  private constructExerciseLayers(
    exerciseDepths: Array<number>,
    maxDepth: number
  ): Array<Array<ExerciseGraphNode>> {
    const exerciseLayers = new Array(maxDepth + 1)

    exerciseDepths.forEach((nodeDepth, nodeIndex) => {
      exerciseLayers[nodeDepth] = exerciseLayers[nodeDepth] ?? []
      exerciseLayers[nodeDepth].push(this.graph.lookupByIndex.get(nodeIndex))
    })

    return exerciseLayers
  }

  /**
   * order the concepts without exercises by the depth of their dependent exercise
   */
  private constructConceptLayers(
    exerciseLayers: Array<Array<ExerciseGraphNode>>
  ): Array<Array<string>> {
    // create map for layer position for a missing concept in case the concept is listed
    // by multiple exercises
    const conceptsVisited = new Map<string, boolean>()

    // compute missing concept layers
    const conceptLayers = new Array<Array<string>>()
    exerciseLayers.forEach((layer, i) => {
      conceptLayers.push([])
      layer.forEach((node) => {
        const missingPrereqs = this.graph.lookupMissingConceptsForExercise.get(
          node.slug
        )
        if (!missingPrereqs) return

        missingPrereqs.forEach((prereq) => {
          const visited = conceptsVisited.get(prereq)
          if (visited) return
          conceptLayers[i].push(prereq)
          conceptsVisited.set(prereq, true)
        })
      })
    })

    return conceptLayers
  }
}

/**
 * makeAdjacencyMatrix
 * creates an adjacency matrix to track which nodes touch each other node
 * this is used later to determine the layers of the DAG (directed acyclic graph)
 */
function makeAdjacencyMatrix(graph: ExerciseGraph): adjacencyMatrix {
  const adjacencyMatrix: adjacencyMatrix = new Array(graph.nodes.length)
  for (let index = 0; index < adjacencyMatrix.length; index++) {
    adjacencyMatrix[index] = []
  }

  graph.edges.forEach((edge) => {
    const from = edge.from.index
    const to = edge.to.index
    adjacencyMatrix[from].push(to)
  })

  return adjacencyMatrix
}
