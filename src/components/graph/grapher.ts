import d3 from 'd3'

import { configData, uuid } from './graph-types'

import { ExerciseGraph } from './ExerciseGraph'
import { ExerciseGraphLayout } from './ExerciseGraphLayout'

import { adjustment } from './graph-util'
import { ExerciseGraphEdge } from './ExerciseGraphEdge'
import { ExerciseGraphNode } from './ExerciseGraphNode'

const makeGraph = (data: configData): ExerciseGraph => new ExerciseGraph(data)
const makeGraphLayout = (graph: ExerciseGraph): ExerciseGraphLayout =>
  new ExerciseGraphLayout(graph)

const drawGraph = (data: ExerciseGraphLayout): ExerciseGraphLayout => {
  const maxDepthWidth = data.width
  const nodesByDepth = data.nodesOrderedByDepth

  const widthPerMaxColumn = 150
  const heightPerNodeRow = 100
  const padding = 40
  const width = maxDepthWidth * widthPerMaxColumn + 2 * padding
  const height = nodesByDepth.length * heightPerNodeRow
  const circleRadius = 10

  const graph = d3
    .select('#tree-graph-container')
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

  rows.each(function (row, iRow) {
    const xDelta = width / (row.length + 1)
    const y = heightPerNodeRow / 2 + heightPerNodeRow * iRow

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
        (d, i) => xDelta + xDelta * i - padding + adjustment(iRow, 50)
      )
      .attr('cy', y)
      .style('fill', 'lightsteelblue')
      .style('stroke', 'black')
      .style('stroke-width', 1)

    nodeGroup
      .append('text')
      // If rotating, comment
      // .attr('x', (d, i) => (xDelta + xDelta * i + 15))
      // .attr('y', y + 4)
      .style('font-size', 16)
      .style('fill', '#fff')
      .text((d) => d.slug)
      .attr('x', 0)
      .attr('y', 0)
      //if not rotating, comment below
      .attr('transform', (d, i) => {
        const x = xDelta + xDelta * i + 14 - padding + adjustment(iRow, 50)
        return `translate(${x}, ${y + 1}), rotate(-10)`
      })
  })

  // Draw lines
  const paths = graph.append('g').attr('class', 'paths')

  paths
    .selectAll('g.paths')
    .data(data.graph.edges)
    .enter()
    .append('path')
    .attr('data-source', (edge: ExerciseGraphEdge): uuid => edge.from)
    .attr('data-target', (edge: ExerciseGraphEdge): uuid => edge.to)
    .attr('d', (edge: ExerciseGraphEdge, i: number) => {
      const source = d3.select(`#${edge.from}`)
      const target = d3.select(`#${edge.to}`)

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

  return data
}

const addHighlightingEvents = (
  data: ExerciseGraphLayout
): ExerciseGraphLayout => {
  data.graph.nodes
    .map((node: ExerciseGraphNode): string => node.slug)
    .forEach((node) => {
      const e = document.getElementById(node)
      e.addEventListener('mouseover', (e) => {
        const targetCircle = <SVGCircleElement>e.target
        targetCircle.classList.add('highlight-circle')
        for (const line of document.querySelectorAll(
          `[data-source="${node}"]`
        )) {
          line.classList.add('highlight-source')
        }
        for (const line of document.querySelectorAll(
          `[data-target="${node}"]`
        )) {
          line.classList.add('highlight-target')
        }
        for (const circle of document.querySelectorAll(
          `circle:not([id="${targetCircle.id}"])`
        )) {
          circle.classList.add('dim')
          ;(circle.nextSibling as SVGTextElement).classList.add('dim')
        }
        const query = `path:not([data-source="${node}"]):not([data-target="${node}"])`
        for (const line of document.querySelectorAll(query)) {
          line.classList.add('dim')
        }
      })

      e.addEventListener('mouseout', (e) => {
        const targetCircle = <SVGCircleElement>e.target
        targetCircle.classList.remove('highlight-circle')
        for (const line of document.querySelectorAll(
          `[data-source="${node}"]`
        )) {
          line.classList.remove('highlight-source')
        }
        for (const line of document.querySelectorAll(
          `[data-target="${node}"]`
        )) {
          line.classList.remove('highlight-target')
        }
        for (const circle of document.querySelectorAll(
          `circle:not([id="${targetCircle.id}"])`
        )) {
          circle.classList.remove('dim')
          ;(circle.nextSibling as SVGTextElement).classList.remove('dim')
        }
        const query = `path:not([data-source="${node}"]):not([data-target="${node}"])`
        for (const line of document.querySelectorAll(query)) {
          line.classList.remove('dim')
        }
      })
    })

  return data
}

const rearrange = (data: ExerciseGraphLayout): ExerciseGraphLayout => {
  const svg = document.getElementById('concept-map')
  const gs = svg.children
  const elements = document.createDocumentFragment()

  for (let i = 0; i < gs.length; i += 1) {
    elements.appendChild(gs[gs.length - 1 - i].cloneNode(true))
  }

  svg.innerHTML = null
  svg.appendChild(elements)

  return data
}

export function loadAndDrawGraph(): void {
  const config = `https://raw.githubusercontent.com/exercism/v3/master/languages/elixir/config.json`

  d3.json(config)
    .then(makeGraph)
    .then(makeGraphLayout)
    .then(drawGraph)
    .then(rearrange)
    .then(addHighlightingEvents)
    .catch((err) => {
      console.error(`GRAPH ABORTED 💥 ${err}`)

      document.getElementById('tree-graph-container').innerHTML = null
      d3.select('#tree-graph-container')
        .append('h1')
        .text('💥')
        .attr('class', 'explosion')

      d3.select('#tree-graph-container').append('h2').text(err)
    })
}
