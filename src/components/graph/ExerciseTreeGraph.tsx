import React from 'react'
import { select } from 'd3-selection'
import { linkVertical } from 'd3-shape'

import { ExerciseGraph } from './ExerciseGraph'
import { ExerciseGraphLayout } from './ExerciseGraphLayout'

import { CheckOrCross } from '../CheckOrCross'

import { Slug, Position } from './graph-types'

export interface ExerciseTreeGraphProps {
  config?: TrackConfiguration
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

    const circleRadius = 10
    const squareLength = 20
    const squareCornerRadius = 5

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
        .attr('width', squareLength)
        .attr('height', squareLength)
        .attr('rx', squareCornerRadius)
        .attr('ry', squareCornerRadius)
        .attr('x', (d) => {
          const { x } = getPositionFrom(layout.conceptPositions, d)
          return x - squareLength / 2
        })
        .attr('y', (d) => {
          const { y } = getPositionFrom(layout.conceptPositions, d)
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

      // Circle
      nodeGroup
        .append('circle')
        .attr('id', (d) => d.slug)
        .attr('r', circleRadius)
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

      // text
      nodeGroup
        .append('text')
        .style('font-size', 16)
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
      select('g.legend').attr('visibility', 'visible')
    })

    select('g.legend > rect.overlay').on('mouseout', () => {
      select('g.legend').attr('visibility', 'hidden')
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
