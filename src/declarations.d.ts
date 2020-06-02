type TrackIdentifier =
  | 'bash'
  | 'c'
  | 'clojure'
  | 'coffeescript'
  | 'common-lisp'
  | 'cpp'
  | 'csharp'
  | 'dart'
  | 'delphi'
  | 'elixir'
  | 'elm'
  | 'emacs-lisp'
  | 'erlang'
  | 'factor'
  | 'fsharp'
  | 'go'
  | 'haskell'
  | 'j'
  | 'java'
  | 'javascript'
  | 'julia'
  | 'kotlin'
  | 'nim'
  | 'ocaml'
  | 'perl5'
  | 'purescript'
  | 'python'
  | 'r'
  | 'racket'
  | 'raku'
  | 'reasonml'
  | 'ruby'
  | 'rust'
  | 'scala'
  | 'scheme'
  | 'swift'
  | 'typescript'
  | 'x86-64-assembly'

type ExerciseIdentifier = string

interface GenericTrackConfiguration
  extends Readonly<GenericTrackConfiguration> {
  language: string
  active: boolean
  blurb: string
}

type Page = 'contributing' | 'maintaining' | 'new-exercise'
type View = 'tree' | 'concept' | 'practice' | 'details' | 'launch'

interface TrackConfiguration extends GenericTrackConfiguration {
  test_pattern: string
  version: 3
  online_editor: Readonly<{
    indent_style: 'space' | 'tab'
    indent_size: number
  }>
  exercises: Readonly<{
    concept: ReadonlyArray<ExerciseConfiguration>
    practice: ReadonlyArray<ExerciseConfiguration>
  }>
}

interface ExerciseConfiguration extends Readonly<ExerciseConfiguration> {
  slug: string
  uuid: string
  concepts: ReadonlyArray<string>
  prerequisites: ReadonlyArray<string>
}

type SelectedTrackIdentifier = TrackIdentifier | null
type SelectedPage = Page | null
type SelectedView = View | null
type SelectedExercise = ExerciseIdentifier | null

interface TrackData extends Readonly<TrackData> {
  slug: TrackIdentifier
  name: string
  example_filename: string
}

declare module 'js-levenshtein' {
  export default function levenshtein(a: string, b: string): number
}
