import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('AgriTrader UI Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh',
          background: '#060d1a', color: '#f0f6ff', fontFamily: 'DM Sans, sans-serif',
          padding: 32, textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, fontFamily: 'Syne, sans-serif' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 14, color: '#7da0c4', marginBottom: 24, maxWidth: 480 }}>
            {this.state.error?.message || 'An unexpected error occurred in the application.'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#f59e0b', color: '#000', border: 'none',
              borderRadius: 8, padding: '12px 24px', fontWeight: 700,
              fontSize: 14, cursor: 'pointer', marginRight: 12
            }}
          >
            🔄 Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#1a3352', color: '#f0f6ff', border: '1px solid #234162',
              borderRadius: 8, padding: '12px 24px', fontWeight: 600,
              fontSize: 14, cursor: 'pointer', marginTop: 10
            }}
          >
            ↺ Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
