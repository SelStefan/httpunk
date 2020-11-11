import React from "react";
import produce from "immer";
import Joi from "joi";
import logo from "./logo.svg";
import "./App.css";

// list key?
// look into immutable ways of adding elements to arrays
// onClick -> e.stopPropagation -> onMouseDown - doesn't work?
// incorporate immer into the application
// incorporate joi schema description language library into the app (and document the state object)
// Implement cables with regular (rotated) divs
// inlet/outlet pin display name when some key is pressed
// Display an error if there two nodes with the same if
// Display an error if there are two outlet pins with the same name within a node
// Implement a method that calculates pin positions
// When a pin gets deleted, also remove it's associated cable connections
// Find a better way to continue propagation to the header (parent) element
// Add node title for display instead of id
// Implement request tracer view
// Implement sidebar inspector resizing
// Implement data bags
// Try adding a "virtual" dot that will expand the patch space
//     (moved with those arrows at the bottom right of the patch space)
// Split the application into logical encapsulated components
/*###########################################################################################*/
// When changing node id: update every occurrence of that node id in the cable connections array

class App extends React.Component {
	constructor(props) {
		super(props);

		const stateSchema = Joi.object({
			value: Joi.string(),
			nodePinnedId: Joi.string().allow(null).required(),
			nodeInspectedId: Joi.string().allow(null).required(),
			initialNodeDragOffset: Joi.object({
				x: Joi.number().required(),
				y: Joi.number().required(),
			}).required(),
			nodes: Joi.array()
				.items(
					Joi.object({
						id: Joi.string().required(),
						reqMethod: Joi.string()
							.valid("GET", "POST", "DELETE", "CONNECT")
							.required(),
						url: Joi.string().required(),
						nodePos: Joi.object({
							x: Joi.number().required(),
							y: Joi.number().required(),
						}),
						outletPinNames: Joi.array()
							.items(Joi.string())
							.required(),
					})
				)
				.required(),
			startNode: Joi.object({
				position: Joi.object({
					x: Joi.number().required(),
					y: Joi.number().required(),
				}).required(),
			}).required(),
			cableDrag: Joi.object({
				isDragging: Joi.bool().required(),
				origin: Joi.string().allow(null).required(),
				initialPos: Joi.object({
					x: Joi.number().required(),
					y: Joi.number().required(),
				}).required(),
				endPos: Joi.object({
					x: Joi.number().required(),
					y: Joi.number().required(),
				}).required(),
			}).required(),
			cableConnections: Joi.array()
				.items(Joi.array().items(Joi.string()).length(2))
				.required(),
			bottomPanelIsDragging: Joi.bool().required(),
			bottomPanelMouseLastPositionY: Joi.number().required(),
			bottomPanelHeight: Joi.number().required(),
		});

		const initialState = {
			nodePinnedId: null,
			nodeInspectedId: null,
			initialNodeDragOffset: {
				x: 0,
				y: 0,
			},
			nodes: [
				{
					id: "1",
					reqMethod: "GET",
					url: "https://www.google.com/",
					nodePos: {
						x: 0,
						y: 0,
					},
					outletPinNames: ["1", "2"],
				},
				{
					id: "2",
					reqMethod: "POST",
					url: "https://en.wikipedia.org/",
					nodePos: {
						x: 250,
						y: 0,
					},
					outletPinNames: ["a", "b"],
				},
				{
					id: "3",
					reqMethod: "GET",
					url: "https://www.youtube.com/",
					nodePos: {
						x: 250,
						y: 200,
					},
					outletPinNames: ["x", "y", "z"],
				},
			],
			startNode: {
				position: {
					x: 100,
					y: 300,
				},
			},
			cableDrag: {
				isDragging: false,
				origin: null,
				initialPos: {
					x: 0,
					y: 0,
				},
				endPos: {
					x: 0,
					y: 0,
				},
			},
			cableConnections: [
				["3/outletPin/x", "2/inletPin"],
				["1/outletPin/1", "3/inletPin"],
			],
			bottomPanelIsDragging: false,
			bottomPanelMouseLastPositionY: 0,
			bottomPanelHeight: 100,
		};

		console.info(stateSchema.validate(initialState));

		this.state = initialState;

		this.startNodeDrag = this.startNodeDrag.bind(this);
		this.handlePatchSpaceClick = this.handlePatchSpaceClick.bind(this);
		this.addNode = this.addNode.bind(this);
		this.inspectNode = this.inspectNode.bind(this);
		this.updateInspectedNodeId = this.updateInspectedNodeId.bind(this);
		this.updateInspectedNodeReqMethod = this.updateInspectedNodeReqMethod.bind(
			this
		);
		this.updateInspectedNodeUrl = this.updateInspectedNodeUrl.bind(this);
		this.updateInspectedNodeOutletPinName = this.updateInspectedNodeOutletPinName.bind(
			this
		);
		this.startCableDrag = this.startCableDrag.bind(this);
		this.calcCableContainerPos = this.calcCableContainerPos.bind(this);
		this.calcCableLine = this.calcCableLine.bind(this);
		this.addCableConnection = this.addCableConnection.bind(this);
		this.getPinPosition = this.getPinPosition.bind(this);
		this.startBottomPanelDrag = this.startBottomPanelDrag.bind(this);
	}

	componentDidMount() {
		window.addEventListener("mouseup", () =>
			this.setState((curState) =>
				produce(curState, (draftState) => {
					draftState.nodePinnedId = null;
					draftState.cableDrag.isDragging = false;
					draftState.cableDrag.origin = null;
					draftState.bottomPanelIsDragging = false;
				})
			)
		);

		window.addEventListener("mousemove", (e) => {
			if (this.state.nodePinnedId !== null) {
				const newPos = this.getMousePos(e);

				if (this.state.nodePinnedId === "start") {
					this.setState((curState) => ({
						startNode: {
							position: {
								x: newPos.x - curState.initialNodeDragOffset.x,
								y: newPos.y - curState.initialNodeDragOffset.y,
							},
						},
					}));
				} else {
					this.setState((curState) =>
						produce(curState, (draftState) => {
							draftState.nodes.find(
								(n) => n.id === draftState.nodePinnedId
							).nodePos = {
								x:
									newPos.x -
									draftState.initialNodeDragOffset.x,
								y:
									newPos.y -
									draftState.initialNodeDragOffset.y,
							};
						})
					);
				}
			}

			if (this.state.cableDrag.isDragging) {
				const mousePos = this.getMousePos(e);

				this.setState((curState) =>
					produce(curState, (draftState) => {
						draftState.cableDrag.endPos = {
							x: mousePos.x,
							y: mousePos.y,
						};
					})
				);
			}

			if (this.state.bottomPanelIsDragging) {
				const mousePos = this.getMousePos(e);

				this.setState((curState) =>
					produce(curState, (draftState) => {
						draftState.bottomPanelHeight +=
							curState.bottomPanelMouseLastPositionY - mousePos.y;
						draftState.bottomPanelMouseLastPositionY = mousePos.y;
					})
				);
			}
		});
	}

	getMousePos(e) {
		return {
			x: e.clientX + document.body.scrollLeft,
			y: e.clientY + document.body.scrollTop,
		};
	}

	startNodeDrag(e, id) {
		console.log("DRAG:", e, id);
		// console.log(this.state.nodePinnedId, e.target.getClientRects()[0]);
		const mousePos = this.getMousePos(e);
		const offset = e.target.getClientRects()[0];
		console.log(mousePos, offset.top);
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
		let newNodeIdNum = 0;
		while (
			this.state.nodes.map((n) => n.id).includes("node-" + newNodeIdNum)
		) {
			newNodeIdNum++;
		}
		const newNodeId = "node-" + newNodeIdNum;
		console.log(newNodeId, e);
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodeInspectedId = newNodeId;
				draftState.nodes.push({
					id: newNodeId,
					nodePos: {
						x: e.clientX,
						y: e.clientY,
					},
					outletPinNames: ["success", "error"],
				});
			})
		);
	}

	inspectNode(e, id) {
		console.log(id);
		this.setState({
			nodeInspectedId: id,
		});
		e.stopPropagation();
	}

	updateInspectedNodeId(e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodeInspectedId = e.target.value;
				draftState.nodes.find(
					(n) => n.id === curState.nodeInspectedId
				).id = e.target.value;
				// Update every occurrence of the old node id in the cable connections array
				//   with the new node id
				draftState.cableConnections.forEach(function (cC, i) {
					if (cC[0].split("/")[0] === curState.nodeInspectedId) {
						const pinPathArr = this[i][0].split("/");
						pinPathArr[0] = draftState.nodeInspectedId;
						this[i][0] = pinPathArr.join("/");
					}
					if (cC[1].split("/")[0] === curState.nodeInspectedId) {
						const pinPathArr = this[i][1].split("/");
						pinPathArr[0] = draftState.nodeInspectedId;
						this[i][1] = pinPathArr.join("/");
					}
				}, draftState.cableConnections);
			})
		);
	}

	updateInspectedNodeReqMethod(e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).reqMethod = e.target.value;
			})
		);
	}

	updateInspectedNodeUrl(e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).url = e.target.value;
			})
		);
		console.log(e.target.value);
	}

	updateInspectedNodeOutletPinName(i, e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).outletPinNames[i] = e.target.value;
			})
		);
	}

	deleteInspectedNodeOutletPin(i) {
		// At least one outlet pin has to exist
		if (
			this.state.nodes.find((n) => n.id === this.state.nodeInspectedId)
				.outletPinNames.length < 2
		)
			return;

		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes
					.find((n) => n.id === draftState.nodeInspectedId)
					.outletPinNames.splice(i, 1);
			})
		);
	}

	addInspectedNodeOutletPin() {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes
					.find((n) => n.id === draftState.nodeInspectedId)
					.outletPinNames.push("new outlet pin");
			})
		);
	}

	startCableDrag(e, origin) {
		e.stopPropagation();
		console.log(e);
		this.setState({
			cableDrag: {
				isDragging: true,
				origin: origin,
				initialPos: {
					x: e.clientX,
					y: e.clientY,
				},
				endPos: {
					x: e.clientX,
					y: e.clientY,
				},
			},
		});
	}

	calcCableContainerPos(startPos, endPos) {
		return {
			left: endPos.x - startPos.x > 0 ? startPos.x : endPos.x,
			top: endPos.y - startPos.y > 0 ? startPos.y : endPos.y,
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

	addCableConnection(target) {
		const originType =
			(this.state.cableDrag.origin.match(/\//g) || []).length === 1
				? "inlet"
				: "outlet";
		const targetType =
			(target.match(/\//g) || []).length === 1 ? "inlet" : "outlet";

		let newCableConnection;
		if (originType === "inlet" && targetType === "outlet") {
			newCableConnection = [target, this.state.cableDrag.origin];
		} else if (originType === "outlet" && targetType === "inlet") {
			newCableConnection = [this.state.cableDrag.origin, target];
		}

		if (
			newCableConnection &&
			!this.state.cableConnections.some(
				(cC) =>
					JSON.stringify(cC) === JSON.stringify(newCableConnection)
			)
		) {
			console.log("pass", newCableConnection);
			this.setState((curState) =>
				produce(curState, (draftState) => {
					draftState.cableConnections.push(newCableConnection);
				})
			);
		}
	}

	getPinPosition(pin) {
		const type = (pin.match(/\//g) || []).length === 1 ? "inlet" : "outlet";
		//console.log("type:", type, pin);
		if (type === "inlet") {
			const [nodeId, ,] = pin.split("/");
			const node = this.state.nodes.find((n) => n.id === nodeId);
			const pinOffset = 15;
			const position = {
				x: node.nodePos.x - pinOffset + 5,
				y: node.nodePos.y + 150 / 2 + 5,
			};
			//console.log(position);
			return position;
		} else if (type === "outlet") {
			const [nodeId, , outletPinName] = pin.split("/");
			//console.log(nodeId, outletPinName);
			const node = this.state.nodes.find((n) => n.id === nodeId);
			const nodeBoxWidth = 200;
			const pinOffset = 15;
			// (node.outletPinNames.indexOf(outletPinName) + 1) *
			// 	(150 / (node.outletPinNames.length + 1)) -
			// 	5;
			const position = {
				x: node.nodePos.x + nodeBoxWidth + pinOffset - 5,
				y:
					node.nodePos.y +
					(node.outletPinNames.indexOf(outletPinName) + 1) *
						(150 / (node.outletPinNames.length + 1)),
			};
			//console.log(position);
			return position;
		}
	}

	startBottomPanelDrag(e) {
		// console.log(this.state.nodePinnedId, e.target.getClientRects()[0]);
		const mousePos = this.getMousePos(e);
		this.setState({
			bottomPanelIsDragging: true,
			bottomPanelMouseLastPositionY: mousePos.y,
		});
	}

	render() {
		return (
			<div className="main-container">
				<div
					className="patch-space"
					style={{
						height: `calc(100% - ${this.state.bottomPanelHeight}px)`,
					}}
					onMouseDown={() => this.handlePatchSpaceClick()}
					onContextMenu={(e) => this.addNode(e)}
				>
					{JSON.stringify(this.state)}
					{this.state.cableDrag.isDragging ? (
						<svg
							height={Math.abs(
								this.state.cableDrag.endPos.y -
									this.state.cableDrag.initialPos.y
							)}
							width={Math.abs(
								this.state.cableDrag.endPos.x -
									this.state.cableDrag.initialPos.x
							)}
							style={{
								position: "absolute",
								...this.calcCableContainerPos(
									this.state.cableDrag.initialPos,
									this.state.cableDrag.endPos
								),
								backgroundColor: "rgb(0, 255, 0, 0.1)",
							}}
						>
							<line
								x1={this.calcCableLine(
									"x1",
									this.state.cableDrag.initialPos,
									this.state.cableDrag.endPos
								)}
								y1={this.calcCableLine(
									"y1",
									this.state.cableDrag.initialPos,
									this.state.cableDrag.endPos
								)}
								x2={this.calcCableLine(
									"x2",
									this.state.cableDrag.initialPos,
									this.state.cableDrag.endPos
								)}
								y2={this.calcCableLine(
									"y2",
									this.state.cableDrag.initialPos,
									this.state.cableDrag.endPos
								)}
								style={{
									stroke: "rgb(255,0,0)",
									strokeWidth: "2",
								}}
							/>
							Sorry, your browser does not support inline SVG.
						</svg>
					) : null}
					{this.state.cableConnections.map((cC) => {
						// the initial/end positions might be reversed,
						//   but it seems that theres a slight improvement in performance this way
						const initialPosition = this.getPinPosition(cC[1]);
						const endPosition = this.getPinPosition(cC[0]);
						return (
							<svg
								height={Math.abs(
									endPosition.y - initialPosition.y
								)}
								width={Math.abs(
									endPosition.x - initialPosition.x
								)}
								style={{
									position: "absolute",
									...this.calcCableContainerPos(
										endPosition,
										initialPosition
									),
									backgroundColor: "rgb(0, 255, 0, 0.1)",
								}}
							>
								<line
									x1={this.calcCableLine(
										"x1",
										initialPosition,
										endPosition
									)}
									y1={this.calcCableLine(
										"y1",
										initialPosition,
										endPosition
									)}
									x2={this.calcCableLine(
										"x2",
										initialPosition,
										endPosition
									)}
									y2={this.calcCableLine(
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
								onMouseDown={(e) => this.startNodeDrag(e, n.id)}
							>
								<div className="header__id-display-box">
									{n.id}
								</div>
								<div className="header__request-method-display-box">
									{n.reqMethod}
								</div>
								<div
									className="header__url-display-box"
									title={n.url}
								>
									{n.url}
								</div>
							</div>
							<div className="body"></div>
							<div
								className="node-box__inlet-pin"
								title="inlet pin"
								onMouseDown={(e) =>
									this.startCableDrag(e, `${n.id}/inletPin`)
								}
								onMouseUp={(e) =>
									this.addCableConnection(`${n.id}/inletPin`)
								}
							></div>
							{n.outletPinNames.map((pinName, i) => (
								<div
									className="node-box__outlet-pin"
									style={{
										top:
											(i + 1) *
												(150 /
													(n.outletPinNames.length +
														1)) -
											5 +
											"px",
									}}
									title={pinName}
									onMouseDown={(e) =>
										this.startCableDrag(
											e,
											`${n.id}/outletPin/${pinName}`
										)
									}
									onMouseUp={(e) =>
										this.addCableConnection(
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
							left: this.state.startNode.position.x,
							top: this.state.startNode.position.y,
						}}
					>
						<div
							className="start-node-header"
							onMouseDown={(e) => this.startNodeDrag(e, "start")}
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
				<div
					className="sidebar-inspector"
					style={{
						height: `calc(100% - ${this.state.bottomPanelHeight}px)`,
					}}
				>
					{this.state.nodeInspectedId !== null ? (
						<div>
							<div className="settings-group">
								<div className="settings-group__id-input-label">
									Id:
								</div>
								<input
									type="text"
									className="settings-group__id-input-field"
									value={this.state.nodeInspectedId}
									onChange={(e) =>
										this.updateInspectedNodeId(e)
									}
								/>
							</div>
							<hr style={{ margin: "0" }} />
							<div className="settings-group">
								<div className="settings-group__request-label">
									Request:
								</div>
								<select
									className="settings-group__request-method-select"
									value={
										this.state.nodes.find(
											(n) =>
												n.id ===
												this.state.nodeInspectedId
										).reqMethod
									}
									onChange={this.updateInspectedNodeReqMethod}
								>
									<option value="GET">GET</option>
									<option value="POST">POST</option>
									<option value="DELETE">DELETE</option>
									<option value="CONNECT">CONNECT</option>
								</select>
								<input
									type="text"
									className="settings-group__url-input-field"
									value={
										this.state.nodes.find(
											(n) =>
												n.id ===
												this.state.nodeInspectedId
										).url
									}
									onChange={(e) =>
										this.updateInspectedNodeUrl(e)
									}
								/>
							</div>
							<hr style={{ margin: "0" }} />
							<div className="settings-group">
								<div className="settings-group__outlet-pins-label">
									Outlet pin names:
								</div>
								{this.state.nodes
									.find(
										(n) =>
											n.id === this.state.nodeInspectedId
									)
									.outletPinNames.map((pinName, i) => (
										<div>
											<input
												type="text"
												className="settings-group__outlet-pin-name-input-field"
												value={pinName}
												onChange={(e) =>
													this.updateInspectedNodeOutletPinName(
														i,
														e
													)
												}
											/>
											<button
												className="settings-group__outlet-pin-delete-button"
												onClick={() =>
													this.deleteInspectedNodeOutletPin(
														i
													)
												}
											>
												Delete
											</button>
										</div>
									))}
								<button
									className="settings-group__outlet-pin-add-button"
									onClick={() =>
										this.addInspectedNodeOutletPin()
									}
								>
									Add pin
								</button>
							</div>
						</div>
					) : null}
				</div>
				<div
					className="bottom-panel"
					style={{ height: this.state.bottomPanelHeight + "px" }}
				>
					<div
						className="bottom-panel__drag"
						onMouseDown={(e) => {
							this.startBottomPanelDrag(e);
						}}
					></div>
				</div>
			</div>
		);
	}
}

export default App;
