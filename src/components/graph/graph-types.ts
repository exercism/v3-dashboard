export type uuid = string
export type slug = string

export type nodeData = {
  slug: string
  uuid: uuid
  readonly concepts: Array<string>
  readonly prerequisites: Array<string>
}

export type edgeData = {
  from: number
  to: number
}

export type configData = {
  language: string
  blurb: string
  exercises: {
    readonly concept: Array<nodeData>
  }
}

export type adjacencyMatrix = Array<Array<number>>
