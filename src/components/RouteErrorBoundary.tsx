import { Component, type ReactNode } from "react";
export default class RouteErrorBoundary extends Component<
  { children: ReactNode; route: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(previous: { route: string }) {
    if (previous.route !== this.props.route && this.state.failed)
      this.setState({ failed: false });
  }
  render() {
    return this.state.failed ? (
      <main className="utility-page page-gutter">
        <h1>页面暂时没能打开</h1>
        <p>资源可能尚未加载完整。可以重新载入，再继续学习。</p>
        <button
          className="practice-button"
          onClick={() => window.location.reload()}
        >
          重新载入
        </button>
        <p>
          <a href="#/">回到首页 →</a>
        </p>
      </main>
    ) : (
      this.props.children
    );
  }
}
