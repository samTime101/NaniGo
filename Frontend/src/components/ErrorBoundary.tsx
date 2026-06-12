import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State {
  hasError: boolean
}

/** Keeps a component crash from blanking the whole app. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[NaniGO] component error:', error)
  }

  reset = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-cream px-8 text-center">
            <div className="text-2xl font-extrabold text-teal">
              Oops! The panda tripped
            </div>
            <p className="font-semibold text-orange">केहि बिग्रियो — Try again</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded-2xl bg-teal px-6 py-3 font-bold text-white"
            >
              Reload
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
