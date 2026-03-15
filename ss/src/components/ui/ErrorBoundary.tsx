import { Component } from 'react'
import type { ErrorInfo, PropsWithChildren } from 'react'
import { Button } from './Button'
import { Card } from './Card'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    void error
    void info
  }

  private retry = () => {
    this.setState({ hasError: false })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-10 max-w-lg px-4">
          <Card className="space-y-3 text-center">
            <h2 className="font-heading text-2xl uppercase tracking-[0.15em] text-accent-hot">System Error</h2>
            <p className="text-sm text-text-muted">A data request failed. Retry to continue.</p>
            <Button onClick={this.retry}>Retry</Button>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
