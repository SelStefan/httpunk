import React from "react";
import "./MainPanel.css";

class MainPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <div
			className="patch-space"
			style={{
				width: `calc(100% - ${this.props.sidebarPanel.width}px)`,
				height: `calc(100% - ${this.props.bottomPanel.height}px)`,
			}}
			onMouseDown={() => this.props.methods.handlePatchSpaceClick()}
			onContextMenu={(e) => this.props.methods.addNode(e)}
		>
			{/* {JSON.stringify(this.state)} */}
			{this.props.cableDrag.isDragging ? (
				<svg
					height={Math.abs(
						this.props.cableDrag.endPos.y -
							this.props.cableDrag.initialPos.y
					)}
					width={Math.abs(
						this.props.cableDrag.endPos.x -
							this.props.cableDrag.initialPos.x
					)}
					style={{
						position: "absolute",
						...this.props.methods.calcCableContainerPos(
							this.props.cableDrag.initialPos,
							this.props.cableDrag.endPos
						),
						backgroundColor: "rgb(0, 255, 0, 0.1)",
					}}
				>
					<line
						x1={this.props.methods.calcCableLine(
							"x1",
							this.props.cableDrag.initialPos,
							this.props.cableDrag.endPos
						)}
						y1={this.props.methods.calcCableLine(
							"y1",
							this.props.cableDrag.initialPos,
							this.props.cableDrag.endPos
						)}
						x2={this.props.methods.calcCableLine(
							"x2",
							this.props.cableDrag.initialPos,
							this.props.cableDrag.endPos
						)}
						y2={this.props.methods.calcCableLine(
							"y2",
							this.props.cableDrag.initialPos,
							this.props.cableDrag.endPos
						)}
						style={{
							stroke: "rgb(255,0,0)",
							strokeWidth: "2",
						}}
					/>
					Sorry, your browser does not support inline SVG.
				</svg>
			) : null}
			{this.props.cableConnections.map((cC) => {
				// the initial/end positions might be reversed,
				//   but it seems that theres a slight improvement in performance this way
				const initialPosition = this.props.methods.getPinPosition(cC[1]);
				const endPosition = this.props.methods.getPinPosition(cC[0]);
				return (
					<svg
						height={Math.abs(endPosition.y - initialPosition.y)}
						width={Math.abs(endPosition.x - initialPosition.x)}
						style={{
							position: "absolute",
							...this.props.methods.calcCableContainerPos(
								endPosition,
								initialPosition
							),
							backgroundColor: "rgb(0, 255, 0, 0.1)",
						}}
					>
						<line
							x1={this.props.methods.calcCableLine(
								"x1",
								initialPosition,
								endPosition
							)}
							y1={this.props.methods.calcCableLine(
								"y1",
								initialPosition,
								endPosition
							)}
							x2={this.props.methods.calcCableLine(
								"x2",
								initialPosition,
								endPosition
							)}
							y2={this.props.methods.calcCableLine(
								"y2",
								initialPosition,
								endPosition
							)}
							style={{
								stroke: "rgb(255,0,0)",
								strokeWidth: "2",
							}}
						/>
						Sorry, your browser does not support inline SVG.
					</svg>
				);
			})}
			{this.props.nodes.map((n) => (
				<div
					id={n.id}
					className="box"
					style={{
						left: n.nodePos.x,
						top: n.nodePos.y,
					}}
					onMouseDown={(e) => this.props.methods.inspectNode(e, n.id)}
				>
					<div
						className="header"
						onMouseDown={(e) => this.props.methods.startNodeDrag(e, n.id)}
					>
						<div className="header__id-display-box">{n.id}</div>
						<div className="header__request-method-display-box">
							{n.reqSettings.method}
						</div>
						<div
							className="header__url-display-box"
							title={this.props.methods.appendParamsToUrl(
								n.reqSettings.url,
								n.reqSettings.params
							)}
						>
							{this.props.methods.appendParamsToUrl(
								n.reqSettings.url,
								n.reqSettings.params
							)}
						</div>
					</div>
					<div className="body"></div>
					<div
						className="node-box__inlet-pin"
						title="inlet pin"
						onMouseDown={(e) =>
							this.props.methods.startCableDrag(e, `${n.id}/inletPin`)
						}
						onMouseUp={(e) =>
							this.props.methods.addCableConnection(`${n.id}/inletPin`)
						}
					></div>
					{n.outletPinNames.map((pinName, i) => (
						<div
							className="node-box__outlet-pin"
							style={{
								top:
									(i + 1) *
										(150 / (n.outletPinNames.length + 1)) -
									5 +
									"px",
							}}
							title={pinName}
							onMouseDown={(e) =>
								this.props.methods.startCableDrag(
									e,
									`${n.id}/outletPin/${pinName}`
								)
							}
							onMouseUp={(e) =>
								this.props.methods.addCableConnection(
									`${n.id}/outletPin/${pinName}`
								)
							}
						></div>
					))}
				</div>
			))}
			<div
				id="start"
				className="start-node-box"
				style={{
					left: this.props.startNode.position.x,
					top: this.props.startNode.position.y,
				}}
			>
				<div
					className="start-node-header"
					onMouseDown={(e) => this.props.methods.startNodeDrag(e, "start")}
				>
					start
				</div>
				<div className="start-node-body"></div>
				<div
					className="start-node-box__inlet-pin"
					title="inlet pin"
					onMouseDown={(e) =>
						this.props.methods.startCableDrag(e, `start/inletPin`)
					}
					onMouseUp={(e) => this.props.methods.addCableConnection(`start/inletPin`)}
				></div>
				<div
					className="start-node-box__outlet-pin"
					title="outlet pin"
					onMouseDown={(e) =>
						this.props.methods.startCableDrag(e, `start/outletPin`)
					}
					onMouseUp={(e) =>
						this.props.methods.addCableConnection(`start/outletPin`)
					}
				></div>
			</div>
			<div className="playback-toolbar">
				<button
					className="playback-toolbar__play-pause"
					onClick={() =>
						!this.props.runner.isPlaying
							? this.props.methods.playRunner()
							: this.props.methods.pauseRunner()
					}
				>
					<i
						className={`fa fa-${
							!this.props.runner.isPlaying ? "play" : "pause"
						}`}
						aria-hidden="true"
					></i>
				</button>
				<button className="playback-toolbar__stop">
					<i className="fa fa-stop" aria-hidden="true"></i>
				</button>
				<button className="playback-toolbar__step">
					<i className="fa fa-forward" aria-hidden="true"></i>
				</button>
			</div>
			<button className="expand-space-x">
				<i
					className="fa fa-caret-square-o-right"
					aria-hidden="true"
				></i>
			</button>
			<button className="expand-space-y">
				<i className="fa fa-caret-square-o-down" aria-hidden="true"></i>
			</button>
		</div>;
	}
}

export default MainPanel;