import React from 'react'
import * as d3 from 'd3'

import { ExerciseGraph } from './ExerciseGraph'
import { ExerciseGraphLayout } from './ExerciseGraphLayout'

import { CheckOrCross } from '../CheckOrCross'

import { slug, position } from './graph-types'

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
    const missingByDepth = exerciseLayout.missingOrderedByDepth

    const containerWidth = graphContainer?.clientWidth ?? 650
    const padding = 20
    const layerHeight = 100

    const width = containerWidth
    const height =
      nodesByDepth.length * layerHeight +
      missingByDepth.length * (layerHeight / 2) +
      padding * 2
    const circleRadius = 10
    const squareLength = 20
    const squareCornerRadius = 5

    // compute node layer columns
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

    //compute missing layer columns
    const missingLayerXOffset = new Array(missingByDepth.length)
    missingByDepth.forEach((layer, i) => {
      if (layer.length === 0) return

      missingLayerXOffset[i] = Math.floor(
        (containerWidth - padding * 2) / (layer.length + 1)
      )
    })

    // compute positions
    let countWithMissingLayers = 0
    const missingPositions = new Map<string, position>()
    const nodePositions = new Map<slug, position>()
    nodesByDepth.forEach((layer, i) => {
      // calculate missing concept position
      const missingLayer = missingByDepth[i]
      missingLayer.forEach((prereq, j) => {
        const position = {
          x: missingLayerXOffset[i] * (j + 1) + xAdjust + padding,
          y:
            layerHeight * i +
            layerHeight / 4 +
            (countWithMissingLayers * layerHeight) / 2 +
            padding,
        }
        missingPositions.set(prereq, position)
      })

      const layerHasMissing = missingLayer.length > 0
      if (layerHasMissing) {
        countWithMissingLayers += 1
      }

      //calculate exercise node positions
      layer.forEach((node, j) => {
        const position = {
          x: layerXOffset[i] * (j + 1) + layerXAdjust[i] + xAdjust + padding,
          y:
            layerHeight * i +
            layerHeight / 2 +
            (countWithMissingLayers * layerHeight) / 2 +
            padding,
        }
        nodePositions.set(node.slug, position)
      })
    })

    console.log({
      missingLayerXOffset,
      layerXOffset,
      missingPositions,
      nodePositions,
      exerciseGraph,
    })

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

    // Draw missing concept nodes
    const squares = graph.append('g').attr('class', 'missing-concepts')

    const missingRows = squares
      .selectAll('g.concept-row')
      .data(missingByDepth)
      .enter()
      .append('g')
      .attr('class', 'row')

    missingRows.each(function (row, rowIndex) {
      const conceptGroup = d3
        .select(this)
        .selectAll('rect')
        .data(row)
        .enter()
        .append('g')

      // Square (rect)
      conceptGroup
        .append('rect')
        .attr('id', (d) => `concept--${d}`)
        .attr('width', squareLength)
        .attr('height', squareLength)
        .attr('rx', squareCornerRadius)
        .attr('ry', squareCornerRadius)
        .attr('x', (d) => {
          const { x } = get_position_from(missingPositions, d)
          return x - squareLength / 2
        })
        .attr('y', (d) => {
          const { y } = get_position_from(missingPositions, d)
          return y - squareLength / 2
        })
        .style('fill', 'lightpink')
        .style('stroke', 'black')
        .style('stroke-width', 1)

      // text
      conceptGroup
        .append('text')
        .style('font-size', 16)
        .style('fill', '#000')
        .text((d) => d)
        .attr('x', 0)
        .attr('y', 0)
        .attr('transform', (d, i) => {
          const { x, y } = get_position_from(missingPositions, d)
          return `translate(${x + 14}, ${y}), rotate(-12)`
        })
    })

    // Draw exercise nodes
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
        .style('font-size', 16)
        .style('fill', '#000')
        .text((d) => d.slug)
        .attr('x', 0)
        .attr('y', 0)
        .attr('transform', (d, i) => {
          const { x, y } = get_position_from(nodePositions, d.slug)
          return `translate(${x + 14}, ${y}), rotate(-12)`
        })
    })

    exerciseGraph.nodes
      .map((node): string => node.slug)
      .forEach((node) => {
        const elem = document.getElementById(node)
        if (!elem) return
        elem.addEventListener('mouseover', handleCircleMouseover)
        elem.addEventListener('mouseout', handleCircleMouseout)
      })
  }

  public componentWillUnmount(): void {
    const circles = Array.from(
      document.querySelectorAll<SVGCircleElement>('svg#concept-map circle')
    )
    for (const circle of circles) {
      circle.removeEventListener('mouseover', handleCircleMouseover)
      circle.removeEventListener('mouseout', handleCircleMouseout)
    }
  }

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

// Use function to retrieve map value so as to not have to handle potential undefined in graph block
function get_position_from(
  map: Map<slug | string, position>,
  key: slug | string
): position {
  const value = map.get(key)
  if (value) return value
  throw new Error("key doesn't exist")
}

/**
 * handleCircleMouseover
 * This event handler highlights the current circle, paths leading from (source) and into (target)
 * and dims all of the rest.
 */
function handleCircleMouseover(event: MouseEvent): void {
  // highlight circle on mouseover
  const targetCircle = event.target as SVGCircleElement
  targetCircle.classList.add('highlight-circle')
  // highlight source lines on mouseover
  const sourceLines = Array.from(
    document.querySelectorAll<SVGPathElement>(
      `[data-source="${targetCircle.id}"]`
    )
  )
  for (const line of sourceLines) {
    line.classList.add('highlight-source')
  }
  //highlight target lines on mouseover
  const targetLines = Array.from(
    document.querySelectorAll<SVGPathElement>(
      `[data-target="${targetCircle.id}"]`
    )
  )
  for (const line of targetLines) {
    line.classList.add('highlight-target')
  }
  //dim all other circles on mouseover
  const otherCircles = Array.from(
    document.querySelectorAll<SVGCircleElement>(
      `circle:not([id="${targetCircle.id}"])`
    )
  )
  for (const circle of otherCircles) {
    circle.classList.add('dim')
    ;(circle.nextSibling as SVGTextElement).classList.add('dim')
  }
  // dim all other lines on mouseover
  const query = `path:not([data-source="${targetCircle.id}"]):not([data-target="${targetCircle.id}"])`
  const otherLines = Array.from(
    document.querySelectorAll<SVGPathElement>(query)
  )
  for (const line of otherLines) {
    line.classList.add('dim')
  }
}

/**
 * handleCircleMouseout
 * This event handler removes highlights the current circle, paths leading from (source) and into (target)
 * and removes dimming from all of the rest.
 */
function handleCircleMouseout(event: MouseEvent): void {
  // highlight circle on mouseover
  const targetCircle = event.target as SVGCircleElement
  targetCircle.classList.remove('highlight-circle')
  // highlight source lines on mouseover
  const sourceLines = Array.from(
    document.querySelectorAll<SVGPathElement>(
      `[data-source="${targetCircle.id}"]`
    )
  )
  for (const line of sourceLines) {
    line.classList.remove('highlight-source')
  }
  //highlight target lines on mouseover
  const targetLines = Array.from(
    document.querySelectorAll<SVGPathElement>(
      `[data-target="${targetCircle.id}"]`
    )
  )
  for (const line of targetLines) {
    line.classList.remove('highlight-target')
  }
  //dim all other circles on mouseover
  const otherCircles = Array.from(
    document.querySelectorAll<SVGCircleElement>(
      `circle:not([id="${targetCircle.id}"])`
    )
  )
  for (const circle of otherCircles) {
    circle.classList.remove('dim')
    ;(circle.nextSibling as SVGTextElement).classList.remove('dim')
  }
  // dim all other lines on mouseover
  const query = `path:not([data-source="${targetCircle.id}"]):not([data-target="${targetCircle.id}"])`
  const otherLines = Array.from(
    document.querySelectorAll<SVGPathElement>(query)
  )
  for (const line of otherLines) {
    line.classList.remove('dim')
  }
}
