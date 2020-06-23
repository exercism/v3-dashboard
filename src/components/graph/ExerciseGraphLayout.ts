import { ExerciseGraph } from './ExerciseGraph'
import { adjacencyMatrix, position, slug } from './graph-types'
import { ExerciseGraphNode } from './ExerciseGraphNode'

type options = {
  width: number
  padding: number
  headerPadding: number
  exerciseLayerHeight: number
  conceptLayerHeight: number
}

export class ExerciseGraphLayout {
  public graph: ExerciseGraph

  // layout options
  public width: number
  public padding: number
  public headerPadding: number
  public exerciseLayerHeight: number
  public conceptLayerHeight: number

  public height: number

  private adjacency: adjacencyMatrix

  public exerciseLayers: Array<Array<ExerciseGraphNode>>
  public conceptLayers: Array<Array<string>>

  public exerciseLayerCount: number
  public conceptLayerCount: number

  public exercisePositions: Map<slug, position>
  public conceptPositions: Map<string, position>

  constructor(graph: ExerciseGraph, options: options) {
    this.graph = graph

    this.padding = options.padding
    this.headerPadding = options.headerPadding
    this.exerciseLayerHeight = options.exerciseLayerHeight
    this.conceptLayerHeight = options.conceptLayerHeight
    this.width = options.width

    this.adjacency = makeAdjacencyMatrix(graph)

    if (this.containsCycle()) {
      throw new Error('🔥 Cannot continue. See error log.')
    }

    this.exerciseLayers = []
    this.conceptLayers = []
    this.computeNodeDepths()

    this.exerciseLayerCount = this.exerciseLayers.length
    this.conceptLayerCount = this.conceptLayers.filter(
      (l) => l.length > 0
    ).length

    this.height =
      this.exerciseLayerCount * this.exerciseLayerHeight +
      this.conceptLayerCount * this.conceptLayerHeight +
      this.padding * 2 +
      this.headerPadding

    this.exercisePositions = new Map()
    this.conceptPositions = new Map()
    this.computePositions()

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

  private computePositions(): void {
    /**
     * Compute amount to offset each exercise node from the left for each row
     * Also, if the rows have the same number of exercises, slightly offset each one
     * so that the dependency lines aren't completely straight/overlapping
     */
    const xAdjust = -40
    const exerciseXOffset = new Array(this.exerciseLayerCount)
    const exerciseXAdjust = new Array(this.exerciseLayerCount).fill(0)
    this.exerciseLayers.forEach((layer, i) => {
      exerciseXOffset[i] = Math.floor(
        (this.width - this.padding * 2) / (layer.length + 1)
      )

      const prevLayer = this.exerciseLayers[i - 1]
      if (prevLayer && prevLayer.length === layer.length) {
        exerciseXAdjust[i] = exerciseXAdjust[i - 1] + 5
      }
    })

    /**
     * Compute amount to offset each node from the left
     */
    const conceptXAdjust = -25
    const conceptXOffset = new Array(this.conceptLayers.length)
    this.conceptLayers.forEach((layer, i) => {
      if (layer.length === 0) return

      conceptXOffset[i] = Math.floor(
        (this.width - this.padding * 2) / (layer.length + 1)
      )
    })

    /**
     * Compute the positions of missing concept and exercise nodes before drawing them
     * So that the paths can be drawn first, then the nodes.  This is needed because of
     * SVG immediate mode rendering.
     */
    let countMissingConceptLayers = 0
    this.exerciseLayers.forEach((layer, i) => {
      // calculate missing concept position
      const missingLayer = this.conceptLayers[i]
      missingLayer.forEach((prereq, j) => {
        const position = {
          x:
            conceptXOffset[i] * (j + 1) +
            xAdjust +
            conceptXAdjust +
            this.padding,
          y:
            this.exerciseLayerHeight * i +
            this.exerciseLayerHeight / 4 +
            countMissingConceptLayers * this.conceptLayerHeight +
            this.padding +
            this.headerPadding,
        }
        this.conceptPositions.set(prereq, position)
      })

      const layerHasMissing = missingLayer.length > 0
      if (layerHasMissing) {
        countMissingConceptLayers += 1
      }

      //calculate exercise node positions
      layer.forEach((node, j) => {
        const position = {
          x:
            exerciseXOffset[i] * (j + 1) +
            exerciseXAdjust[i] +
            xAdjust +
            this.padding,
          y:
            this.exerciseLayerHeight * i +
            this.exerciseLayerHeight / 2 +
            countMissingConceptLayers * this.conceptLayerHeight +
            this.padding +
            this.headerPadding,
        }
        this.exercisePositions.set(node.slug, position)
      })
    })
  }
}

/**
 * makeAdjacencyMatrix
 * creates an adjacency matrix to track which nodes touch each other node
 * this is used later to determine the layers of the DAG (directed acyclic graph)
 */
function makeAdjacencyMatrix(graph: ExerciseGraph): adjacencyMatrix {
  const adjacencyMatrix: adjacencyMatrix = new Array(graph.exercises.length)
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
