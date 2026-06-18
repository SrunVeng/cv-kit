import { Component } from 'react';

class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="app-error-screen">
        <div>
          <p className="eyebrow">Khmer-CV</p>
          <h1>Something did not load correctly.</h1>
          <p>Reload the page to try again. Your in-progress CV should reopen in this tab.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload Khmer-CV
          </button>
        </div>
      </main>
    );
  }
}

export default AppErrorBoundary;
