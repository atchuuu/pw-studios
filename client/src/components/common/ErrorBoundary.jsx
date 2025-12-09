import React from 'react';
import OfflinePage from '../../pages/OfflinePage';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <OfflinePage type="error" error={this.state.error} />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
