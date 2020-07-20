import React from 'react'
import { select } from 'd3-selection'
import { linkVertical } from 'd3-shape'

import { ExerciseGraph } from './ExerciseGraph'
import { ExerciseGraphNode } from './ExerciseGraphNode'
import { ExerciseGraphLayout } from './ExerciseGraphLayout'

import { CheckOrCross } from '../CheckOrCross'

import { Slug, Position } from './graph-types'

type SVGGraphSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>
type SVGGroupSelection = d3.Selection<SVGGElement, unknown, null, undefined>
type SVGTextSelection = d3.Selection<SVGTextElement, unknown, null, undefined>

export interface ExerciseTreeGraphProps {
  config?: TrackConfiguration
}

export interface ShapeOptions {
  circle: {
    radius: number
  }
  square: {
    length: number
    radius: number
  }
}

export class ExerciseTreeGraph extends React.Component<ExerciseTreeGraphProps> {
  private graphRef = React.createRef<HTMLDivElement>()

  public shouldComponentUpdate(): boolean {
    return false
  }

  public componentDidMount(): void {
    if (!this.props.config) {
      return
    }

    const graphContainer = this.graphRef.current
    const containerWidth = graphContainer?.clientWidth ?? 650

    const trackGraph = new ExerciseGraph(this.props.config)

    if (trackGraph.exercises.length === 0) {
      return displayNoExercises(graphContainer)
    }

    const layoutOptions = {
      width: containerWidth,
      padding: 20,
      headerPadding: 70,
      exerciseLayerHeight: 100,
      conceptLayerHeight: 50,
    }

    const layout = new ExerciseGraphLayout(trackGraph, layoutOptions)
    const exerciseLayers = layout.exerciseLayers
    const conceptLayers = layout.conceptLayers

    const shapeOptions: ShapeOptions = {
      circle: {
        radius: 10,
      },
      square: {
        length: 20,
        radius: 5,
      },
    }

    /**
     * Create graph container
     */
    const graph = select(graphContainer)
      .append('svg')
      .attr('id', 'concept-map')
      .attr('width', layout.width)
      .attr('height', layout.height)

    /**
     * Draw dependency paths from exercise to exercise
     */
    const paths = graph.append('g').attr('class', 'paths')

    paths
      .selectAll('g.paths')
      .data(layout.graph.edges)
      .enter()
      .append('path')
      .attr('data-source', (edge) => edge.from.slug)
      .attr('data-target', (edge) => edge.to.slug)
      .attr('d', (edge, i) => {
        const source = getPositionFrom(layout.exercisePositions, edge.from.slug)
        const target = getPositionFrom(layout.exercisePositions, edge.to.slug)

        const linkGenerator = linkVertical()

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
      .data(trackGraph.exercises)
      .enter()
      .append('g')
      .attr('class', 'concept-paths')
      .each(function (node) {
        const missing = trackGraph.lookupMissingConceptsForExercise.get(
          node.slug
        )
        if (!missing) {
          return
        }

        select(this)
          .selectAll('path.concept-path')
          .data(missing)
          .enter()
          .append('path')
          .attr('data-source', (d) => d)
          .attr('data-target', node.slug)
          .attr('class', 'concept-path')
          .attr('d', (d, i) => {
            const source = getPositionFrom(layout.conceptPositions, d)
            const target = getPositionFrom(layout.exercisePositions, node.slug)

            const linkGenerator = linkVertical()

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
      .data(conceptLayers)
      .enter()
      .append('g')
      .attr('class', 'concept-row')

    missingRows.each(function (row, rowIndex) {
      const conceptGroup = select(this)
        .selectAll('g.missing-group')
        .data(row)
        .enter()
        .append('g')
        .attr('class', 'missing-group')

      // Square (rect)
      conceptGroup
        .append('rect')
        .attr('id', (d) => `concept--${d}`)
        .attr('width', shapeOptions.square.length)
        .attr('height', shapeOptions.square.length)
        .attr('rx', shapeOptions.square.radius)
        .attr('ry', shapeOptions.square.radius)
        .attr('x', (d) => {
          const { x } = getPositionFrom(layout.conceptPositions, d)
          return x - shapeOptions.square.length / 2
        })
        .attr('y', (d) => {
          const { y } = getPositionFrom(layout.conceptPositions, d)
          return y - shapeOptions.square.length / 2
        })
        .style('fill', 'lightpink')
        .style('stroke', 'black')
        .style('stroke-width', 1)

      // text
      conceptGroup
        .append('text')
        .style('font-size', '16px')
        .style('fill', '#000')
        .text((d) => d)
        .attr('x', 0)
        .attr('y', 0)
        .attr('transform', (d, i) => {
          const { x, y } = getPositionFrom(layout.conceptPositions, d)
          return `translate(${x + 14}, ${y}), rotate(-12)`
        })
    })

    /**
     * Draw nodes for the exercises
     */
    const circles = graph.append('g').attr('class', 'nodes')

    const rows = circles
      .selectAll('g.row')
      .data(exerciseLayers)
      .enter()
      .append('g')
      .attr('class', 'row')

    rows.each(function (row, rowIndex) {
      const nodeGroup = select(this)
        .selectAll('circle')
        .data(row)
        .enter()
        .append('g')

      // Draw Shape for Node
      nodeGroup.call(drawNode, layout, shapeOptions)

      // text
      nodeGroup
        .append('text')
        .style('font-size', '16px')
        .style('fill', '#000')
        .text((d) => d.slug)
        .attr('x', 0)
        .attr('y', 0)
        .attr('transform', (d, i) => {
          const { x, y } = getPositionFrom(layout.exercisePositions, d.slug)
          return `translate(${x + 14}, ${y}), rotate(-12)`
        })
    })

    trackGraph.exercises
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

    drawTitle(graph, this.props.config.language)
    const showLegend = drawShowLegendIcon(graph, { x: 15, y: 15 })
    const legend = drawLegend(graph, {
      x: 1,
      y: 1,
      circleRadius: shapeOptions.circle.radius,
      squareLength: shapeOptions.square.length,
      squareCornerRadius: shapeOptions.square.radius,
    })

    showLegend.on('mouseover', () => {
      select('g.legend').attr('visibility', 'visible')
      select('g.show-legend').attr('visibility', 'hidden')
    })

    legend.select('.overlay').on('mouseout', () => {
      select('g.legend').attr('visibility', 'hidden')
      select('g.show-legend').attr('visibility', 'visible')
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

    select('g.show-legend').on('mouseover', null)
    select('g.legend > rect.overlay').on('mouseout', null)
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

function drawNode(
  nodeSelection: d3.Selection<
    SVGGElement,
    ExerciseGraphNode,
    SVGGElement,
    unknown
  >,
  layout: ExerciseGraphLayout,
  shapeOptions: ShapeOptions
): void {
  // Draw circle
  nodeSelection
    .filter(onlyDone)
    .append('circle')
    .attr('id', (d) => d.slug)
    .attr('r', shapeOptions.circle.radius)
    .attr('cx', (d) => {
      const { x } = getPositionFrom(layout.exercisePositions, d.slug)
      return x
    })
    .attr('cy', (d) => {
      const { y } = getPositionFrom(layout.exercisePositions, d.slug)
      return y
    })
    .style('fill', 'lightsteelblue')
    .style('stroke', 'black')
    .style('stroke-width', 1)

  //Draw square
  nodeSelection
    .filter(onlyNotDone)
    .append('rect')
    .attr('id', (d) => `concept--${d}`)
    .attr('width', shapeOptions.square.length)
    .attr('height', shapeOptions.square.length)
    .attr('rx', shapeOptions.square.radius)
    .attr('ry', shapeOptions.square.radius)
    .attr('x', (d) => {
      const { x } = getPositionFrom(layout.exercisePositions, d.slug)
      return x - shapeOptions.square.length / 2
    })
    .attr('y', (d) => {
      const { y } = getPositionFrom(layout.exercisePositions, d.slug)
      return y - shapeOptions.square.length / 2
    })
    .style('fill', 'lemonchiffon')
    .style('stroke', 'black')
    .style('stroke-width', 1)
}

function onlyNotDone(d: ExerciseGraphNode): boolean {
  return !d.uuid
}

function onlyDone(d: ExerciseGraphNode): boolean {
  return !onlyNotDone(d)
}

/**
 * Draw graph title
 */
function drawTitle(
  graph: SVGGraphSelection,
  textContent: string
): SVGTextSelection {
  return graph
    .append('text')
    .style('font-size', '48px')
    .style('fill', '#000')
    .text(`${textContent} Concept Exercises`)
    .attr('x', '50%')
    .attr('y', 45)
    .attr('text-anchor', 'middle')
}

/**
 * Draw show legend hover
 */
function drawShowLegendIcon(
  graph: SVGGraphSelection,
  { x, y }: Position
): SVGGroupSelection {
  const showLegend = graph.append('g').attr('class', 'show-legend')
  const icon = showLegend.append('g').attr('class', 'show-legend-icon')
  const caption = showLegend.append('g').attr('class', 'show-legend-caption')

  icon
    .append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('height', 120)
    .attr('width', 20)
    .style('fill', '#EEEEEE')
    .style('stroke', 'black')
    .style('stroke-width', 1)

  icon
    .append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('height', 20)
    .attr('width', 20)
    .style('fill', '#85C1E9')
    .style('stroke', 'black')
    .style('stroke-width', 1)

  caption
    .append('text')
    .style('font-size', '16px')
    .style('fill', '#EAF2F8')
    .text('ℹ')
    .attr('x', x + 10)
    .attr('y', y + 16)
    .attr('text-anchor', 'middle')
    .attr('pointer-events', 'none')

  caption
    .append('text')
    .style('font-size', '16px')
    .style('fill', '#000')
    .text('show legend')
    .attr('pointer-events', 'none')
    .attr('transform', `translate(${x + 5}, ${y + 25}), rotate(90)`)

  return showLegend
}

type DrawLegendOptions = {
  x: number
  y: number
  circleRadius: number
  squareLength: number
  squareCornerRadius: number
}

/**
 * Draw legend
 */
function drawLegend(
  graph: SVGGraphSelection,
  { x, y, circleRadius, squareLength, squareCornerRadius }: DrawLegendOptions
): SVGGroupSelection {
  const legend = graph
    .append('g')
    .attr('class', 'legend')
    .attr('visibility', 'hidden')

  legend
    .append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('height', 100)
    .attr('width', 245)
    .style('fill', 'white')
    .style('stroke', 'black')
    .style('stroke-width', 1)

  legend
    .append('circle')
    .attr('r', circleRadius)
    .attr('cx', x + 20)
    .attr('cy', y + 20)
    .style('fill', 'lightsteelblue')
    .style('stroke', 'black')
    .style('stroke-width', 1)

  legend
    .append('rect')
    .attr('width', squareLength)
    .attr('height', squareLength)
    .attr('rx', squareCornerRadius)
    .attr('ry', squareCornerRadius)
    .attr('x', x + 20 - squareLength / 2)
    .attr('y', y + 50 - squareLength / 2)
    .style('fill', 'lemonchiffon')
    .style('stroke', 'black')
    .style('stroke-width', 1)

  legend
    .append('rect')
    .attr('width', squareLength)
    .attr('height', squareLength)
    .attr('rx', squareCornerRadius)
    .attr('ry', squareCornerRadius)
    .attr('x', x + 20 - squareLength / 2)
    .attr('y', y + 80 - squareLength / 2)
    .style('fill', 'lightpink')
    .style('stroke', 'black')
    .style('stroke-width', 1)

  legend
    .append('text')
    .style('font-size', '14px')
    .style('fill', '#000')
    .text('implemented exercises')
    .attr('x', x + 35)
    .attr('y', y + 25)

  legend
    .append('text')
    .style('font-size', '14px')
    .style('fill', '#000')
    .text('concepts not fully implemented')
    .attr('x', x + 35)
    .attr('y', y + 55)

  legend
    .append('text')
    .style('font-size', '14px')
    .style('fill', '#000')
    .text('concepts missing an exercise')
    .attr('x', x + 35)
    .attr('y', y + 85)

  legend
    .append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('height', 70)
    .attr('width', 225)
    .attr('class', 'overlay')
    .style('fill', 'rgba(0,0,0,0)')

  return legend
}

/**
 * displayNoExercises
 */
function displayNoExercises(container: HTMLDivElement | null): void {
  select(container).append('p').text('No exercises to display as tree.')
}

/**
 * Use function to retrieve map value so as to not have to handle potential undefined in graph block
 */
function getPositionFrom(
  map: Map<Slug | string, Position>,
  key: Slug | string
): Position {
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
