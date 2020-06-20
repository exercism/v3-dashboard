import { uuid } from './graph-types'

export class ExerciseGraphNode {
  public index: number
  public slug: string
  public uuid: uuid
  public concepts: Array<string>
  public prerequisites: Array<string>

  constructor(
    index: number,
    slug: string,
    uuid: uuid,
    concepts: Array<string>,
    prerequisites: Array<string>
  ) {
    this.index = index
    this.slug = slug
    this.uuid = uuid
    this.concepts = [...concepts]
    this.prerequisites = [...prerequisites]
  }
}
