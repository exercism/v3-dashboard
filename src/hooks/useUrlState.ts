import { useCallback } from 'react'
import { useLocation } from './useLocation'

import TRACKS from '../data/tracks.json'

const DEFAULT_VIEW: View = 'launch'
const DEFAULT_PAGE: Page = 'maintaining'

type UnsetTrackIdentifier = null
type UnsetStatePartial = undefined

interface SupportedState {
  trackId: TrackIdentifier | UnsetTrackIdentifier
  page: Page | UnsetStatePartial
  view: View | UnsetStatePartial
  exercise: ExerciseIdentifier | UnsetStatePartial
}

type sanitizeUrlState<K extends keyof SupportedState> = (
  input: string | undefined
) => SupportedState[K]
type UseUrlState<K extends keyof SupportedState> = [
  SupportedState[K],
  (value: SupportedState[K]) => void
]

/**
 * Returns a state and updater that fetches and pushes state from and to the URL
 *
 * - It returns the current (initial) value from the url
 * - It changes the url via setOptionsInUrl
 * - It refreshes with a previous (popped) value, when the back/forward button is pressed
 *
 * @param key the state key
 * @param sanitize how to sanititze values
 */
export function useUrlState<K extends keyof SupportedState>(
  key: K,
  sanitize: sanitizeUrlState<K>
): UseUrlState<K> {
  const location = useLocation()

  const value = getOptionFromLocation(location, key, sanitize)
  const doUpdateValue = useCallback(
    (value: SupportedState[K]) => {
      setOptionsInUrl({ [key]: value })
    },
    [key]
  )

  return [value, doUpdateValue]
}

/**
 * Convenience method to get the track id from the url
 */
export function useTrack(): [
  TrackIdentifier | null,
  (next: TrackIdentifier | null) => void
] {
  return useUrlState('trackId', sanitizeTrack)
}

/**
 * Convenience method to get the current page from the url
 */
export function usePage(): [
  Page | undefined,
  (next: Page | undefined) => void
] {
  return useUrlState('page', sanitizePage)
}

/**
 * Convenience method to get the current view from the url
 */
export function useView(): [
  View | undefined,
  (next: View | undefined) => void
] {
  return useUrlState('view', sanitizeView)
}

/**
 * Convenience method to get the current exercise from the url
 */
export function useExercise(): [
  ExerciseIdentifier | undefined,
  (next: ExerciseIdentifier | undefined) => void
] {
  return useUrlState('exercise', sanitizeExercise)
}

function sanitizeTrack(
  anyTrack: string | undefined
): TrackIdentifier | UnsetTrackIdentifier {
  const track = TRACKS.find((track) => track['slug'] === anyTrack)
  return track ? (anyTrack as TrackIdentifier) : null
}

function sanitizePage(anyPage: string | undefined): Page {
  // Keep up to date with declarations.d.ts
  const pages: Page[] = ['contributing', 'maintaining', 'new-exercise']
  return pages.find((views) => views === anyPage) || DEFAULT_PAGE
}

function sanitizeView(anyView: string | undefined): View {
  // Keep up to date with declarations.d.ts
  const views: View[] = ['concept', 'details', 'launch', 'practice', 'tree']
  return views.find((views) => views === anyView) || DEFAULT_VIEW
}

function sanitizeExercise(
  anyExercise: string | undefined
): ExerciseIdentifier | UnsetStatePartial {
  return anyExercise ? anyExercise.trim().replace(/( |_)/g, '-') : undefined
}

function getOptionFromLocation<K extends keyof SupportedState>(
  location: Location | undefined,
  key: K,
  sanitize: sanitizeUrlState<K>
): SupportedState[K] {
  const {
    trackId: urlTrackId,
    page: urlPage,
    view: urlView,
    exercise: urlExercise,
  } = getOptionsFromLocation(location)

  switch (key) {
    case 'trackId': {
      return sanitize(urlTrackId)
    }
    case 'page': {
      return sanitize(urlPage)
    }
    case 'view': {
      return sanitize(urlView)
    }
    case 'exercise': {
      return sanitize(urlExercise)
    }
    default: {
      throw new Error(`${key} not handled in option parsing`)
    }
  }
}

interface Options {
  trackId: string | undefined
  page: string | undefined
  view: string | undefined
  exercise: string | undefined
}

function getOptionsFromLocation(location: Location | undefined): Options {
  const [, urlTrackId, urlPage, urlView, urlExercise] = location
    ? decodeURIComponent(location.pathname || '').split('/')
    : []

  return {
    trackId: urlTrackId,
    page: urlPage,
    view: urlView,
    exercise: urlExercise,
  }
}

export function setOptionsInUrl(nextState: Partial<SupportedState>): void {
  return setOptionsWithLocation({ ...nextState, location: window.location })
}

export function getNextUrl(
  nextState: Partial<SupportedState>
): ReturnType<typeof getNextUrlWithLocation> {
  return getNextUrlWithLocation({ ...nextState, location: window.location })
}

export function useUrl(
  nextState: Partial<SupportedState>
): ReturnType<typeof getNextUrlWithLocation> {
  const location = useLocation()
  return getNextUrlWithLocation({
    ...nextState,
    location: location || window.location,
  })
}

interface NextUrl {
  state: {
    trackId: TrackIdentifier | null
    page: Page
    view: View
    exercise: ExerciseIdentifier | undefined
    previous?: Options
  }
  title: string
  href: string
}

function getNextUrlWithLocation({
  location,
  trackId: nextTrackId,
  page: nextPage,
  view: nextView,
  exercise: nextExercise,
}: Partial<SupportedState> & { location: Location }): NextUrl {
  // unset track
  if (nextTrackId === null) {
    return {
      state: {
        trackId: null,
        page: DEFAULT_PAGE,
        view: DEFAULT_VIEW,
        exercise: undefined,
      },
      title: 'Exercism: Track maintenance tool - Select your track',
      href: '/',
    }
  }

  const current = getOptionsFromLocation(location)
  const trackId = sanitizeTrack(nextTrackId || current.trackId)
  const page = sanitizePage(nextPage || current.page)

  const exercise = nextExercise === undefined ? current.exercise : nextExercise
  const view = sanitizeView(
    nextView === undefined
      ? nextExercise
        ? 'details'
        : current.view
      : nextView
  )

  return {
    state: { trackId, page, view, exercise, previous: { ...current } },
    title: `Exercism: Track ${trackId} maintenance tool (${page} - ${view ||
      'Dashboard'}`,
    href:
      '/' + [trackId, page, view, view && exercise].filter(Boolean).join('/'),
  }
}

function setOptionsWithLocation(
  options: Partial<SupportedState> & { location: Location }
): void {
  const { state, title, href } = getNextUrlWithLocation(options)

  return window.history.pushState(state, title, href)
}
