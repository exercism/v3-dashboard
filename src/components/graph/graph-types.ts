export type uuid = string

export type nodeData = {
  slug: string
  uuid: uuid
  concepts: [string]
  prerequisites: [string]
}

export type edgeData = {
  from: number
  to: number
}

export type configData = {
  language: string
  blurb: string
  exercises: {
    concept: [nodeData]
  }
}

export type adjacencyMatrix = Array<Array<number>>
