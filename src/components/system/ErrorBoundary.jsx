import React from "react";
import { APP_NAME } from "../../theme.config.js";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(`${APP_NAME} UI error`, error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="access-wall">
        <div className="access-wall-card">
          <div className="elite-kicker">RECUPERACAO SEGURA</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,46px)", lineHeight: 1, color: "#fff", fontFamily: "'Syne',sans-serif", margin: "10px 0 12px" }}>
            Algo travou nesta tela.
          </h1>
          <p style={{ fontSize: 14, color: "#cfcfcf", lineHeight: 1.6, maxWidth: 620, margin: "0 0 18px" }}>
            Seus dados locais continuam preservados. Recarregue a interface para voltar ao workspace.
          </p>
          <button type="button" onClick={() => location.reload()} className="elite-primary">
            Recarregar {APP_NAME}
          </button>
        </div>
      </div>
    );
  }
}
