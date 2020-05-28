# V3 Progress Dashboard

A dashboard to help maintainers and contributors understand the state of Tracks for v3.

## Track versioning

Add a `versioning` key to `/src/data/tracks.json`. The value is _not_ a
regular expression or glob pattern, but allows for very specific template
replacements:

- `{exercise-slug}` is replaced by the exercise slug, using `dash-case`
- `{ExerciseSlug}` is replaced by the exercise slug, using `CamelCase`
- `{exercise_slug}` is replaced by the exercise slug, using `snake_case`
- `{slug}` is the same as `{exercise-slug}`

## Stub tracking

Add a `stub_file` key to `/src/data/tracks.json`. The value is _not_ a
regular expression or glob pattern, but allows for very specific template
replacements. Same as Track Versioning.

## Exercise "unactionable"

In order to remove an exercise from the version table (marked as not in sync),
add it to the `unactionable -> versioning` list in `src/data/tracks.json`.
