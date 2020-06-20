import { ExerciseGraph } from './ExerciseGraph'
import { adjacencyMatrix } from './graph-types'
import { ExerciseGraphNode } from './ExerciseGraphNode'

const makeAdjacencyMatrix = (graph: ExerciseGraph): adjacencyMatrix => {
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

const containsCycle = (graph: ExerciseGraph, adj: adjacencyMatrix): boolean => {
  const visited: Array<boolean> = new Array(adj.length).fill(false)
  const isOnStack: Array<boolean> = new Array(adj.length).fill(false)
  const stack: Array<number> = []

  // Attempt to start from each node in the case the graph is disjunct
  for (let source = 0; source < adj.length; source += 1) {
    if (visited[source]) continue
    stack.push(source)

    while (stack.length > 0) {
      const n = stack[stack.length - 1]

      if (!visited[n]) {
        visited[n] = true
        isOnStack[n] = true
      } else {
        isOnStack[n] = false
        stack.pop()
      }

      for (const next of adj[n]) {
        if (!visited[next]) {
          stack.push(next)
        } else if (isOnStack[next]) {
          console.error(
            `Graph Cycle Detected '${graph.lookupByIndex.get(n)?.slug}' to '${
              graph.lookupByIndex.get(next)?.slug
            }'`
          )
          return true
        }
      }
    }
  }

  return false
}

const nodesByDepth = (
  graph: ExerciseGraph,
  adj: adjacencyMatrix
): Array<Array<ExerciseGraphNode>> => {
  // Use the adjacency matrix to find the in-degree of each node (the number of edges pointing to the node)
  const inDegrees = new Array(adj.length).fill(0)
  for (const tos of adj) {
    for (const to of tos) {
      inDegrees[to] += 1
    }
  }

  // Nodes with inDegree of 0 are source nodes (roots) of the graph
  const sourceNodes: Array<number> = []
  inDegrees.forEach((inDegree, i) => {
    if (inDegree === 0) sourceNodes.push(i)
  })

  // Perform a recursive search to find the length of longest path to each node from any source
  let maxDepth = 0
  const maxNodeDepths = new Array(adj.length).fill(0)
  for (const sourceNode of sourceNodes) {
    const traverse = (node: number, depth = 0): void => {
      if (depth > maxNodeDepths[node]) {
        maxNodeDepths[node] = depth

        if (depth > maxDepth) {
          maxDepth = depth
        }
      }

      const children = adj[node]
      children.forEach((child) => {
        traverse(child, depth + 1)
      })
    }
    traverse(sourceNode)
  }

  // order the nodes by depth then index
  const nodesByDepth = new Array(maxDepth + 1) // add one since depth is 0-indexed
  maxNodeDepths.forEach((nodeDepth, nodeIndex) => {
    nodesByDepth[nodeDepth] = nodesByDepth[nodeDepth] ?? []
    nodesByDepth[nodeDepth].push(graph.lookupByIndex.get(nodeIndex))
  })

  return nodesByDepth
}

export class ExerciseGraphLayout {
  public graph: ExerciseGraph
  private adjacency: adjacencyMatrix
  public nodesOrderedByDepth: Array<Array<ExerciseGraphNode>>

  public depth: number
  public width: number

  constructor(graph: ExerciseGraph) {
    this.graph = graph
    this.adjacency = makeAdjacencyMatrix(graph)

    if (containsCycle(this.graph, this.adjacency)) {
      throw new Error('🔥 Cannot continue. See error log.')
    }

    this.nodesOrderedByDepth = nodesByDepth(this.graph, this.adjacency)
    this.depth = this.nodesOrderedByDepth.length
    this.width = this.nodesOrderedByDepth.reduce(
      (maxWidth, row) => (row.length > maxWidth ? row.length : maxWidth),
      0
    )
  }
}
