import React from 'react'
import * as d3 from 'd3'

import { ExerciseGraph } from './ExerciseGraph'
import { ExerciseGraphLayout } from './ExerciseGraphLayout'

import { CheckOrCross } from '../CheckOrCross'

import { slug } from './graph-types'

type ExerciseTreeGraphProps = {
  config?: TrackConfiguration
}

export class ExerciseTreeGraph extends React.Component<ExerciseTreeGraphProps> {
  private graphRef = React.createRef<HTMLDivElement>()

  public shouldComponentUpdate(): boolean {
    return false
  }

  public componentDidMount(): void {
    if (!this.props.config) return

    const graphContainer = this.graphRef.current
    const exerciseGraph = new ExerciseGraph(this.props.config)
    const exerciseLayout = new ExerciseGraphLayout(exerciseGraph)

    // const maxDepthWidth = exerciseLayout.width
    const nodesByDepth = exerciseLayout.nodesOrderedByDepth

    const containerWidth = graphContainer?.clientWidth ?? 650
    const padding = 20
    const layerHeight = 100

    const width = containerWidth
    const height = nodesByDepth.length * layerHeight + padding * 2
    const circleRadius = 10

    // computer layer columns
    const xAdjust = -40
    const layerXOffset = new Array(nodesByDepth.length)
    const layerXAdjust = new Array(nodesByDepth.length).fill(0)
    nodesByDepth.forEach((layer, i) => {
      layerXOffset[i] = Math.floor(
        (containerWidth - padding * 2) / (layer.length + 1)
      )

      const prevLayer = nodesByDepth[i - 1]
      if (prevLayer && prevLayer.length === layer.length) {
        layerXAdjust[i] = layerXAdjust[i - 1] + 5
      }
    })

    console.log({
      containerWidth,
      padding,
      layerHeight,
      width,
      height,
      circleRadius,
      xAdjust,
      layerXOffset,
      layerXAdjust,
      nodesByDepth,
    })

    // compute node positions
    const nodePositions = new Map<slug, { x: number; y: number }>()
    nodesByDepth.forEach((layer, i) => {
      layer.forEach((node, j) => {
        const position = {
          x: layerXOffset[i] * (j + 1) + layerXAdjust[i] + xAdjust + padding,
          y: layerHeight * i + layerHeight / 2 + padding,
        }
        nodePositions.set(node.slug, position)
      })
    })

    console.log(nodePositions)

    const graph = d3
      .select(graphContainer)
      .append('svg')
      .attr('id', 'concept-map')
      .attr('width', width)
      .attr('height', height)

    // Draw edges as paths
    const paths = graph.append('g').attr('class', 'paths')

    paths
      .selectAll('g.paths')
      .data(exerciseLayout.graph.edges)
      .enter()
      .append('path')
      .attr('data-source', (edge) => edge.from.slug)
      .attr('data-target', (edge) => edge.to.slug)
      .attr('d', (edge, i) => {
        const source = get_position_from(nodePositions, edge.from.slug)
        const target = get_position_from(nodePositions, edge.to.slug)

        const linkGenerator = d3.linkVertical()

        return linkGenerator({
          source: [source.x, source.y],
          target: [target.x, target.y],
        })
      })
      .attr('stroke', '#c3c3c3')
      .attr('fill', 'none')

    // Draw nodes
    const circles = graph.append('g').attr('class', 'nodes')

    const rows = circles
      .selectAll('g.row')
      .data(nodesByDepth)
      .enter()
      .append('g')
      .attr('class', 'row')

    rows.each(function (row, rowIndex) {
      const nodeGroup = d3
        .select(this)
        .selectAll('circle')
        .data(row)
        .enter()
        .append('g')

      // Circle
      nodeGroup
        .append('circle')
        .attr('id', (d) => d.slug)
        .attr('r', circleRadius)
        .attr('cx', (d) => {
          const { x } = get_position_from(nodePositions, d.slug)
          return x
        })
        .attr('cy', (d) => {
          const { y } = get_position_from(nodePositions, d.slug)
          return y
        })
        .style('fill', 'lightsteelblue')
        .style('stroke', 'black')
        .style('stroke-width', 1)

      // text
      nodeGroup
        .append('text')
        // If rotating, comment below
        // .attr('x', (d, i) => (xDelta + xDelta * i + 15))
        // .attr('y', y + 4)
        // If rotating, comment above
        .style('font-size', 16)
        .style('fill', '#000')
        .text((d) => d.slug)
        .attr('x', 0)
        .attr('y', 0)
        //if not rotating, comment below
        .attr('transform', (d, i) => {
          const { x, y } = get_position_from(nodePositions, d.slug)
          return `translate(${x + 14}, ${y}), rotate(-12)`
        })
      //if not rotating, comment above
    })

    // TODO: Need to attach event listeners for path
    // TODO: Add teardown for listeners in 'componentWillUnmount()'
  }

  // public componentWillUnmount(): void {
  //   undefined
  // }

  public render(): JSX.Element {
    if (!this.props.config) {
      return <CheckOrCross value={false} />
    }

    return (
      <div className="text-center">
        <h1>{this.props.config.language} Concept Exercises</h1>
        <div id="graph-container" ref={this.graphRef} />
      </div>
    )
  }
}

type position = {
  x: number
  y: number
}

function get_position_from(map: Map<slug, position>, key: slug): position {
  const value = map.get(key)
  if (value) return value
  throw new Error("key doesn't exist")
}
