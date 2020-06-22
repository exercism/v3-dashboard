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

    if (exerciseGraph.nodes.length === 0)
      return displayNoExercises(graphContainer)

    const exerciseLayout = new ExerciseGraphLayout(exerciseGraph)

    const nodesByDepth = exerciseLayout.nodesOrderedByDepth
    const missingByDepth = exerciseLayout.missingOrderedByDepth

    const containerWidth = graphContainer?.clientWidth ?? 650
    const padding = 20
    const headerPadding = 70
    const layerHeight = 100

    const width = containerWidth
    const height =
      nodesByDepth.length * layerHeight +
      missingByDepth.length * (layerHeight / 2) +
      padding * 2 +
      headerPadding
    const circleRadius = 10
    const squareLength = 20
    const squareCornerRadius = 5

    /**
     * Compute amount to offset each exercise node from the left for each row
     * Also, if the rows have the same number of exercises, slightly offset each one
     * so that the dependency lines aren't completely straight/overlapping
     */
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

    /**
     * Compute amount to offset each node from the left
     */
    const missingXAdjust = -25
    const missingLayerXOffset = new Array(missingByDepth.length)
    missingByDepth.forEach((layer, i) => {
      if (layer.length === 0) return

      missingLayerXOffset[i] = Math.floor(
        (containerWidth - padding * 2) / (layer.length + 1)
      )
    })

    /**
     * Compute the positions of missing concept and exercise nodes before drawing them
     * So that the paths can be drawn first, then the nodes.  This is needed because of
     * SVG immediate mode rendering.
     */
    let countWithMissingLayers = 0
    const missingPositions = new Map<string, position>()
    const nodePositions = new Map<slug, position>()
    nodesByDepth.forEach((layer, i) => {
      // calculate missing concept position
      const missingLayer = missingByDepth[i]
      missingLayer.forEach((prereq, j) => {
        const position = {
          x:
            missingLayerXOffset[i] * (j + 1) +
            xAdjust +
            missingXAdjust +
            padding,
          y:
            layerHeight * i +
            layerHeight / 4 +
            (countWithMissingLayers * layerHeight) / 2 +
            padding +
            headerPadding,
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
            padding +
            headerPadding,
        }
        nodePositions.set(node.slug, position)
      })
    })

    /**
     * Create graph container
     */
    const graph = d3
      .select(graphContainer)
      .append('svg')
      .attr('id', 'concept-map')
      .attr('width', width)
      .attr('height', height)

    /**
     * Draw dependency paths from exercise to exercise
     */
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

    /**
     * Draw paths from missing concepts to exercises
     */
    const conceptPaths = graph.append('g').attr('class', 'concept-paths')

    conceptPaths
      .selectAll('g.concept-paths')
      .data(exerciseGraph.nodes)
      .enter()
      .append('g')
      .attr('class', 'concept-paths')
      .each(function (node) {
        const missing = exerciseGraph.lookupMissingConceptsForExercise.get(
          node.slug
        )
        console.log({ selection: d3.select(this), missing })
        if (!missing) return

        d3.select(this)
          .selectAll('path.concept-path')
          .data(missing)
          .enter()
          .append('path')
          .attr('data-source', (d) => d)
          .attr('data-target', node.slug)
          .attr('class', 'concept-path')
          .attr('d', (d, i) => {
            const source = get_position_from(missingPositions, d)
            const target = get_position_from(nodePositions, node.slug)

            const linkGenerator = d3.linkVertical()

            return linkGenerator({
              source: [source.x, source.y],
              target: [target.x, target.y],
            })
          })
          .attr('stroke', '#c3c3c3')
          .attr('fill', 'none')
      })

    /**
     * Draw nodes for the missing concepts
     */
    const squares = graph.append('g').attr('class', 'missing-concepts')

    const missingRows = squares
      .selectAll('g.concept-row')
      .data(missingByDepth)
      .enter()
      .append('g')
      .attr('class', 'concept-row')

    missingRows.each(function (row, rowIndex) {
      const conceptGroup = d3
        .select(this)
        .selectAll('g.missing-group')
        .data(row)
        .enter()
        .append('g')
        .attr('class', 'missing-group')

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

    /**
     * Draw nodes for the exercises
     */
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

    /**
     * Draw title
     */

    graph
      .append('text')
      .style('font-size', 48)
      .style('fill', '#000')
      .text(`${this.props.config.language} Concept Exercises`)
      .attr('x', '50%')
      .attr('y', 45)
      .attr('text-anchor', 'middle')

    /**
     * Draw show legend hover
     */

    const showLegend = graph.append('g').attr('class', 'show-legend')

    showLegend
      .append('rect')
      .attr('x', 15)
      .attr('y', 15)
      .attr('height', 20)
      .attr('width', 20)
      .style('fill', '#85C1E9')
      .style('stroke', 'black')
      .style('stroke-width', 1)

    showLegend
      .append('text')
      .style('font-size', 16)
      .style('fill', '#EAF2F8')
      .text('ℹ')
      .attr('x', 25)
      .attr('y', 31)
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')

    /**
     * Draw legend
     */
    const legend = graph
      .append('g')
      .attr('class', 'legend')
      .attr('visibility', 'hidden')

    legend
      .append('rect')
      .attr('x', 1)
      .attr('y', 1)
      .attr('height', 70)
      .attr('width', 225)
      .style('fill', 'white')
      .style('stroke', 'black')
      .style('stroke-width', 1)

    legend
      .append('circle')
      .attr('r', circleRadius)
      .attr('cx', 20)
      .attr('cy', 20)
      .style('fill', 'lightsteelblue')
      .style('stroke', 'black')
      .style('stroke-width', 1)

    legend
      .append('rect')
      .attr('width', squareLength)
      .attr('height', squareLength)
      .attr('rx', squareCornerRadius)
      .attr('ry', squareCornerRadius)
      .attr('x', 20 - squareLength / 2)
      .attr('y', 50 - squareLength / 2)
      .style('fill', 'lightpink')
      .style('stroke', 'black')
      .style('stroke-width', 1)

    legend
      .append('text')
      .style('font-size', 14)
      .style('fill', '#000')
      .text('implemented exercises')
      .attr('x', 35)
      .attr('y', 25)

    legend
      .append('text')
      .style('font-size', 14)
      .style('fill', '#000')
      .text('concepts missing an exercise')
      .attr('x', 35)
      .attr('y', 55)

    legend
      .append('rect')
      .attr('x', 1)
      .attr('y', 1)
      .attr('height', 70)
      .attr('width', 225)
      .attr('class', 'overlay')
      .style('fill', 'rgba(0,0,0,0)')

    showLegend.on('mouseover', () => {
      d3.select('g.legend').attr('visibility', 'visible')
    })

    d3.select('g.legend > rect.overlay').on('mouseout', () => {
      d3.select('g.legend').attr('visibility', 'hidden')
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

    d3.select('g.show-legend').on('mouseover', null)
    d3.select('g.legend > rect.overlay').on('mouseout', null)
  }

  public render(): JSX.Element {
    if (!this.props.config) {
      return <CheckOrCross value={false} />
    }

    return (
      <div className="text-center">
        <div id="graph-container" ref={this.graphRef} />
      </div>
    )
  }
}

/**
 * displayNoExercises
 */
function displayNoExercises(container: HTMLDivElement | null): void {
  d3.select(container).append('p').text('No exercises to display as tree.')
}

/**
 * Use function to retrieve map value so as to not have to handle potential undefined in graph block
 */
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
