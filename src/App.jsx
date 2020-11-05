import React from "react";
import logo from "./logo.svg";
import "./App.css";

// list key?
// look into immutable ways of adding elements to arrays
// onClick -> e.stopPropagation -> onMouseDown - doesn't work?
// incorporate immer into the application
// Implement cables with regular (rotated) divs

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: "Test",
			nodePinnedId: null,
			nodeInspectedId: null,
			initialNodeDragOffset: {
				x: 0,
				y: 0,
			},
			nodes: [
				{
					id: "1",
					nodePos: {
						x: 0,
						y: 0,
					},
				},
				{
					id: "2",
					nodePos: {
						x: 250,
						y: 0,
					},
				},
				{
					id: "3",
					nodePos: {
						x: 250,
						y: 200,
					},
				},
			],
			startNode: {
				position: {
					x: 100,
					y: 300,
				},
			},
			cable: {
				position: {
					x: 100,
					y: 100,
				},
			},
			cableIsDragging: false,
			initialCableDragPos: {
				x: 100,
				y: 100,
			},
			cableEndPos: {
				x: 0,
				y: 0,
			},
		};

		this.startDrag = this.startDrag.bind(this);
		this.handlePatchSpaceClick = this.handlePatchSpaceClick.bind(this);
		this.addNode = this.addNode.bind(this);
		this.inspectNode = this.inspectNode.bind(this);
		this.updateInspectedNodeId = this.updateInspectedNodeId.bind(this);
		this.calcCableContainerPos = this.calcCableContainerPos.bind(this);
		this.calcCableLine = this.calcCableLine.bind(this);
	}

	componentDidMount() {
		window.addEventListener("mouseup", () =>
			this.setState({ nodePinnedId: null, cableIsDragging: false })
		);

		window.addEventListener("mousemove", (e) => {
			if (this.state.nodePinnedId !== null) {
				const newPos = this.getMousePos(e);
				//console.log(newPos);
				// this.setState((curState) => ({
				// 	nodePos: {
				// 		x: newPos.x - curState.initialNodeDragOffset.x,
				// 		y: newPos.y - curState.initialNodeDragOffset.y,
				// 	},
				// }));
				if (this.state.nodePinnedId === "start") {
					this.setState((curState) => ({
						startNode: {
							...curState.startNode,
							position: {
								x: newPos.x - curState.initialNodeDragOffset.x,
								y: newPos.y - curState.initialNodeDragOffset.y,
							},
						},
					}));
				} else {
					this.setState((curState) => ({
						nodes: this.state.nodes.map((n) =>
							n.id === curState.nodePinnedId
								? {
										...n,
										nodePos: {
											x:
												newPos.x -
												curState.initialNodeDragOffset
													.x,
											y:
												newPos.y -
												curState.initialNodeDragOffset
													.y,
										},
								  }
								: n
						),
					}));
				}
			}

			if (this.state.cableIsDragging) {
				const mousePos = this.getMousePos(e);
				this.setState((curState) => ({
					cable: {
						position: {
							x: curState.initialCableDragPos.x,
							y: curState.initialCableDragPos.y,
						},
					},
					cableEndPos: {
						x: mousePos.x,
						y: mousePos.y,
					},
				}));
			}
		});
	}

	getMousePos(e) {
		return {
			x: e.clientX + document.body.scrollLeft,
			y: e.clientY + document.body.scrollTop,
		};
	}

	startDrag(e, id) {
		// console.log(this.state.nodePinnedId, e.target.getClientRects()[0]);
		const mousePos = this.getMousePos(e);
		const offset = e.target.getClientRects()[0];
		console.log(mousePos, offset);
		this.setState({
			nodePinnedId: id,
			initialNodeDragOffset: {
				x: mousePos.x - offset.left,
				y: mousePos.y - offset.top,
			},
		});
	}

	handlePatchSpaceClick() {
		this.setState({
			nodeInspectedId: null,
		});
	}

	addNode(e) {
		e.preventDefault();
		let newNodeId = 0;
		while (
			this.state.nodes.map((n) => n.id).includes(newNodeId.toString())
		) {
			newNodeId++;
		}
		console.log(newNodeId, e);
		this.setState((curState) => ({
			nodeInspectedId: newNodeId.toString(),
			nodes: curState.nodes.concat({
				id: newNodeId.toString(),
				nodePos: {
					x: e.clientX,
					y: e.clientY,
				},
			}),
		}));
	}

	inspectNode(e, id) {
		console.log(id);
		this.setState({
			nodeInspectedId: id,
		});
		e.stopPropagation();
	}

	updateInspectedNodeId(e) {
		this.setState((curState) => ({
			nodeInspectedId: e.target.value,
			nodes: this.state.nodes.map((n) =>
				n.id === curState.nodeInspectedId
					? {
							...n,
							id: e.target.value,
					  }
					: n
			),
		}));
		console.log(e.target.value);
	}

	calcCableContainerPos(startPos, endPos) {
		return {
			left:
				endPos.x - startPos.x > 0
					? this.state.cable.position.x
					: endPos.x,
			top:
				endPos.y - startPos.y > 0
					? this.state.cable.position.y
					: endPos.y,
		};
	}

	// point = 'x1' | 'y1' | 'x2' | 'y2'
	calcCableLine(point, startPos, endPos) {
		switch (point) {
			case "x1":
				return endPos.x - startPos.x > 0 ? 0 : startPos.x - endPos.x;
				break;
			case "y1":
				return endPos.y - startPos.y > 0 ? 0 : startPos.y - endPos.y;
				break;
			case "x2":
				return endPos.x - startPos.x > 0 ? endPos.x - startPos.x : 0;
				break;
			case "y2":
				return endPos.y - startPos.y > 0 ? endPos.y - startPos.y : 0;
				break;
			default:
				break;
		}
	}

	render() {
		return (
			<div className="main-container">
				<div
					className="patch-space"
					onMouseDown={() => this.handlePatchSpaceClick()}
					onContextMenu={(e) => this.addNode(e)}
				>
					{JSON.stringify(this.state)}
					<svg
						height={Math.abs(
							this.state.cableEndPos.y -
								this.state.initialCableDragPos.y
						)}
						width={Math.abs(
							this.state.cableEndPos.x -
								this.state.initialCableDragPos.x
						)}
						style={{
							position: "absolute",
							...this.calcCableContainerPos(
								this.state.initialCableDragPos,
								this.state.cableEndPos
							),
							// left: this.state.cable.position.x,
							// top: this.state.cable.position.y,
							backgroundColor: "rgb(0, 255, 0, 0.1)",
						}}
					>
						<line
							x1={this.calcCableLine(
								"x1",
								this.state.initialCableDragPos,
								this.state.cableEndPos
							)}
							y1={this.calcCableLine(
								"y1",
								this.state.initialCableDragPos,
								this.state.cableEndPos
							)}
							x2={this.calcCableLine(
								"x2",
								this.state.initialCableDragPos,
								this.state.cableEndPos
							)}
							y2={this.calcCableLine(
								"y2",
								this.state.initialCableDragPos,
								this.state.cableEndPos
							)}
							style={{ stroke: "rgb(255,0,0)", strokeWidth: "2" }}
						/>
						Sorry, your browser does not support inline SVG.
					</svg>
					{this.state.nodes.map((n) => (
						<div
							id={n.id}
							className="box"
							style={{
								left: n.nodePos.x,
								top: n.nodePos.y,
							}}
							onMouseDown={(e) => this.inspectNode(e, n.id)}
						>
							<div
								className="header"
								onMouseDown={(e) => this.startDrag(e, n.id)}
							>
								{n.id}
							</div>
							<div className="body"></div>
							<div
								className="node-box__inlet-pin"
								onMouseDown={(e) => {
									e.stopPropagation();
									console.log(e);
									this.setState({
										cableIsDragging: true,
										initialCableDragPos: {
											x: e.clientX,
											y: e.clientY,
										},
										cableEndPos: {
											x: e.clientX,
											y: e.clientY,
										},
										// cable: {
										// 	position: {
										// 		x: e.clientX,
										// 		y: e.clientY
										// 	}
										// }
									});
								}}
							></div>
							<div className="node-box__outlet-pin"></div>
						</div>
					))}
					<div
						id="start"
						className="start-node-box"
						style={{
							left: this.state.startNode.position.x,
							top: this.state.startNode.position.y,
						}}
					>
						<div
							className="header"
							onMouseDown={(e) => this.startDrag(e, "start")}
						>
							start
						</div>
						<div className="start-node-body"></div>
						<div className="start-node-box__inlet-pin"></div>
						<div className="start-node-box__outlet-pin"></div>
					</div>
					<button className="expand-space-x">
						<i
							className="fa fa-caret-square-o-right"
							aria-hidden="true"
						></i>
					</button>
					<button className="expand-space-y">
						<i
							className="fa fa-caret-square-o-down"
							aria-hidden="true"
						></i>
					</button>
				</div>
				<div className="sidebar-inspector">
					{this.state.nodeInspectedId !== null ? (
						<div className="input-group">
							<div className="input-label">Id:</div>
							<input
								type="text"
								className="input-field"
								value={this.state.nodeInspectedId}
								onChange={(e) => this.updateInspectedNodeId(e)}
							/>
						</div>
					) : null}
				</div>
			</div>
		);
	}
}

export default App;
