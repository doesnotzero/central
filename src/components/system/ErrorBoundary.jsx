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

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    // Modo compacto: contém o erro em uma única tab, sem recarregar o app.
    if (this.props.compact) {
      return (
        <div className="page-stack">
          <div className="section-band" style={{ textAlign: "center", padding: 40 }}>
            <div className="elite-kicker" style={{ color: "var(--accent,#ff2400)" }}>ESTA TELA TRAVOU</div>
            <h2 style={{ fontSize: 26, lineHeight: 1.05, color: "#fff", fontFamily: "var(--font-display)", margin: "10px 0 10px" }}>
              Não foi possível abrir esta área.
            </h2>
            <p style={{ fontSize: 14, color: "#cfcfcf", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 18px" }}>
              Seus dados continuam salvos. Tente abrir de novo — se persistir, recarregue o workspace.
            </p>
            <button type="button" onClick={this.handleRetry} className="elite-primary">Tentar de novo</button>
          </div>
        </div>
      );
    }

    return (
      <div className="access-wall">
        <div className="access-wall-card">
          <div className="elite-kicker">RECUPERACAO SEGURA</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,46px)", lineHeight: 1, color: "#fff", fontFamily: "var(--font-display)", margin: "10px 0 12px" }}>
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
