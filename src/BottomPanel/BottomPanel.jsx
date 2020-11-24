import React from "react";
import "./BottomPanel.css";

class BottomPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div
				className="bottom-panel"
				style={{ height: this.props.bottomPanel.height + "px" }}
			>
				<div
					className="bottom-panel__drag"
					onMouseDown={(e) => {
						this.props.methods.startBottomPanelDrag(e);
					}}
				></div>
				<div className="bottom-panel__tabs-header">
					<button
						onClick={() =>
							this.props.methods.setBottomPanelActiveTab("REQUEST_TRACER")
						}
					>
						Request Tracer
					</button>
					<button
						onClick={() => this.props.methods.setBottomPanelActiveTab("SCRIPTS")}
					>
						Scripts
					</button>
					<button
						onClick={() =>
							this.props.methods.setBottomPanelActiveTab("DATA_BAGS")
						}
					>
						Data Bags
					</button>
				</div>
				{(() => {
					if (this.props.bottomPanel.activeTab === "REQUEST_TRACER") {
						return <div>Request Tracer</div>;
					} else if (this.props.bottomPanel.activeTab === "SCRIPTS") {
						return <div>Scripts</div>;
					} else if (
						this.props.bottomPanel.activeTab === "DATA_BAGS"
					) {
						return <div>Data Bags</div>;
					}
				})()}
			</div>
		);
	}
}

export default BottomPanel;
