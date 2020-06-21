import React from 'react'
import * as d3 from 'd3'

import { ExerciseGraph } from './ExerciseGraph'
import { ExerciseGraphLayout } from './ExerciseGraphLayout'

import { CheckOrCross } from '../CheckOrCross'

import { adjustment } from './graph-util'

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

    const maxDepthWidth = exerciseLayout.width
    const nodesByDepth = exerciseLayout.nodesOrderedByDepth

    const widthPerMaxColumn = 150
    const heightPerNodeRow = 100
    const padding = 40
    const width = maxDepthWidth * widthPerMaxColumn + 2 * padding
    const height = nodesByDepth.length * heightPerNodeRow
    const circleRadius = 10

    const graph = d3
      .select(graphContainer)
      .append('svg')
      .attr('id', 'concept-map')
      .attr('width', width)
      .attr('height', height)

    const circles = graph.append('g').attr('class', 'nodes')

    const rows = circles
      .selectAll('g.row')
      .data(nodesByDepth)
      .enter()
      .append('g')
      .attr('class', 'row')

    rows.each(function (row, rowIndex) {
      const xDelta = width / (row.length + 1)
      const y = heightPerNodeRow / 2 + heightPerNodeRow * rowIndex

      const nodeGroup = d3
        .select(this)
        .selectAll('circle')
        .data(row)
        .enter()
        .append('g')

      nodeGroup
        .append('circle')
        .attr('id', (d) => d.slug)
        .attr('r', circleRadius)
        .attr(
          'cx',
          (d, i) => xDelta + xDelta * i - padding + adjustment(rowIndex, 50)
        )
        .attr('cy', y)
        .style('fill', 'lightsteelblue')
        .style('stroke', 'black')
        .style('stroke-width', 1)

      nodeGroup
        .append('text')
        // If rotating, comment below
        // .attr('x', (d, i) => (xDelta + xDelta * i + 15))
        // .attr('y', y + 4)
        // If rotating, comment above
        .style('font-size', 16)
        .style('fill', '#fff')
        .text((d) => d.slug)
        .attr('x', 0)
        .attr('y', 0)
        //if not rotating, comment below
        .attr('transform', (d, i) => {
          const x =
            xDelta + xDelta * i + 14 - padding + adjustment(rowIndex, 50)
          return `translate(${x}, ${y + 1}), rotate(-10)`
        })
      //if not rotating, comment above
    })

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
        const source = d3.select(`#${edge.from.slug}`)
        const target = d3.select(`#${edge.to.slug}`)

        const linkGenerator = d3.linkVertical()

        return linkGenerator({
          source: [
            (source.attr('cx') as unknown) as number,
            (source.attr('cy') as unknown) as number,
          ],
          target: [
            (target.attr('cx') as unknown) as number,
            (target.attr('cy') as unknown) as number,
          ],
        })
      })
      .attr('stroke', '#2a2a2a')
      .attr('fill', 'none')

    // TODO: Need to attach event listeners for path
    // TODO: Need to rearrange order for nodes
    //       - either like before, patching it
    //       - or pre-compute the positions of each node, then draw them in the correct order
    // TODO: Add teardown for listeners in 'componentWillUnmount()'

    // FIXME: scale, sizing colors
  }

  // public componentWillUnmount(): void {
  //   undefined
  // }

  public render(): JSX.Element {
    if (!this.props.config) {
      return <CheckOrCross value={false} />
    }

    return <div ref={this.graphRef} />
  }
}
