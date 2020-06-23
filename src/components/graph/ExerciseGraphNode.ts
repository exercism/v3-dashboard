import { UUID } from './graph-types'

export class ExerciseGraphNode {
  public index: number
  public slug: string
  public uuid: UUID
  public concepts: string[]
  public prerequisites: string[]

  constructor(
    index: number,
    slug: string,
    uuid: UUID,
    concepts: string[],
    prerequisites: string[]
  ) {
    this.index = index
    this.slug = slug
    this.uuid = uuid
    this.concepts = [...concepts]
    this.prerequisites = [...prerequisites]
  }
}
