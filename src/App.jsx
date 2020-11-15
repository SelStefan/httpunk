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
// Implement data bags
// Try adding a "virtual" dot that will expand the patch space
//     (moved with those arrows at the bottom right of the patch space)
// Split the application into logical encapsulated components
// Implement a "toolbar playback" like feature for running rails
// address the potential problem with using float: right on the params remove button
// read more on this binding for methods, since it's a bit confusing
// update body content to support different content types (for now it's just JSON)
// When entering something into the url field where the params are, an invisible value gets added to the state
//     update the params method to only output the final param string
//     add a some sort of a indication/coloration to the param part of the url
// patch space left mouse movement
/*###########################################################################################*/
// rename sidebar inspector -> sidebar panel
// Implement sidebar inspector resizing
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
						reqSettings: Joi.object({
							isCollapsed: Joi.bool().required(),
							method: Joi.string()
								.valid("GET", "POST", "DELETE", "CONNECT")
								.required(),
							url: Joi.string().required(),
							activeTab: Joi.string()
								.valid("PARAMS", "AUTH", "HEADERS", "BODY")
								.required(),
							params: Joi.array()
								.items(
									Joi.object({
										key: Joi.string().required(),
										value: Joi.string().required(),
										isEnabled: Joi.bool().required(),
									})
								)
								.required(),
							bodyContent: Joi.string().required(),
						}).required(),
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
			sidebarPanel: Joi.object({
				isDragging: Joi.bool().required(),
				mouseDragLastPositionX: Joi.number().required(),
				width: Joi.number().required(),
			}).required(),
			bottomPanel: Joi.object({
				isDragging: Joi.bool().required(),
				mouseDragLastPositionY: Joi.number().required(),
				height: Joi.number().required(),
				activeTab: Joi.string()
					.valid("REQUEST_TRACER", "SCRIPTS", "DATA_BAGS")
					.required(),
			}).required(),
			runner: Joi.object({
				isPlaying: Joi.bool().required(),
				currentNodeId: Joi.string().required(),
			}),
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
					reqSettings: {
						isCollapsed: false,
						method: "GET",
						url: "https://www.google.com/",
						activeTab: "PARAMS",
						params: [
							{
								key: "a",
								value: "1",
								isEnabled: true,
							},
						],
						bodyContent: "{a: 1}",
					},
					nodePos: {
						x: 200,
						y: 300,
					},
					outletPinNames: ["1", "2"],
				},
				{
					id: "2",
					reqSettings: {
						isCollapsed: false,
						method: "POST",
						url: "https://en.wikipedia.org/",
						activeTab: "PARAMS",
						params: [
							{
								key: "b",
								value: "2",
								isEnabled: false,
							},
						],
						bodyContent: "{b: 2}",
					},
					nodePos: {
						x: 750,
						y: 300,
					},
					outletPinNames: ["a", "b"],
				},
				{
					id: "3",
					reqSettings: {
						isCollapsed: false,
						method: "GET",
						url: "https://www.youtube.com/",
						activeTab: "PARAMS",
						params: [
							{
								key: "c",
								value: "3",
								isEnabled: true,
							},
						],
						bodyContent: "{c: 3}",
					},
					nodePos: {
						x: 500,
						y: 400,
					},
					outletPinNames: ["x", "y", "z"],
				},
			],
			startNode: {
				position: {
					x: 50,
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
				["start/outletPin", "1/inletPin"],
			],
			sidebarPanel: {
				isDragging: false,
				mouseDragLastPositionX: 0,
				width: 300,
			},
			bottomPanel: {
				isDragging: false,
				mouseDragLastPositionY: 0,
				height: 100,
				activeTab: "REQUEST_TRACER",
			},
			runner: {
				isPlaying: false,
				currentNodeId: "start",
			},
		};

		console.info(stateSchema.validate(initialState));

		this.state = initialState;

		this.startNodeDrag = this.startNodeDrag.bind(this);
		this.handlePatchSpaceClick = this.handlePatchSpaceClick.bind(this);
		this.addNode = this.addNode.bind(this);
		this.inspectNode = this.inspectNode.bind(this);
		this.updateInspectedNodeId = this.updateInspectedNodeId.bind(this);
		this.toggleInspectedNodeReqSettingsIsCollapsed = this.toggleInspectedNodeReqSettingsIsCollapsed.bind(
			this
		);
		this.updateInspectedNodeReqMethod = this.updateInspectedNodeReqMethod.bind(
			this
		);
		this.updateInspectedNodeUrl = this.updateInspectedNodeUrl.bind(this);
		this.updateInspectedNodeReqSettingsActiveTab = this.updateInspectedNodeReqSettingsActiveTab.bind(
			this
		);
		this.addInspectedNodeParam = this.addInspectedNodeParam.bind(this);
		this.removeInspectedNodeParam = this.removeInspectedNodeParam.bind(
			this
		);
		this.updateInspectedNodeParamKey = this.updateInspectedNodeParamKey.bind(
			this
		);
		this.updateInspectedNodeParamValue = this.updateInspectedNodeParamValue.bind(
			this
		);
		this.toggleInspectedNodeParam = this.toggleInspectedNodeParam.bind(
			this
		);
		this.updateInspectedNodeBodyContent = this.updateInspectedNodeBodyContent.bind(
			this
		);
		this.updateInspectedNodeOutletPinName = this.updateInspectedNodeOutletPinName.bind(
			this
		);
		this.startCableDrag = this.startCableDrag.bind(this);
		this.calcCableContainerPos = this.calcCableContainerPos.bind(this);
		this.calcCableLine = this.calcCableLine.bind(this);
		this.addCableConnection = this.addCableConnection.bind(this);
		this.getPinPosition = this.getPinPosition.bind(this);
		this.startSidebarPanelDrag = this.startSidebarPanelDrag.bind(this);
		this.startBottomPanelDrag = this.startBottomPanelDrag.bind(this);
		this.setBottomPanelActiveTab = this.setBottomPanelActiveTab.bind(this);
		this.playRunner = this.playRunner.bind(this);
		this.pauseRunner = this.pauseRunner.bind(this);
		this.runNextNode = this.runNextNode.bind(this);

		//////// Util ////////////
		this.getInspectedNode = this.getInspectedNode.bind(this);
	}

	componentDidMount() {
		window.addEventListener("mouseup", () =>
			this.setState((curState) =>
				produce(curState, (draftState) => {
					draftState.nodePinnedId = null;
					draftState.cableDrag.isDragging = false;
					draftState.cableDrag.origin = null;
					draftState.sidebarPanel.isDragging = false;
					draftState.bottomPanel.isDragging = false;
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

			if (this.state.sidebarPanel.isDragging) {
				const mousePos = this.getMousePos(e);

				this.setState((curState) =>
					produce(curState, (draftState) => {
						draftState.sidebarPanel.width +=
							curState.sidebarPanel.mouseDragLastPositionX -
							mousePos.x;
						draftState.sidebarPanel.mouseDragLastPositionX =
							mousePos.x;
					})
				);
			}

			if (this.state.bottomPanel.isDragging) {
				const mousePos = this.getMousePos(e);

				this.setState((curState) =>
					produce(curState, (draftState) => {
						draftState.bottomPanel.height +=
							curState.bottomPanel.mouseDragLastPositionY -
							mousePos.y;
						draftState.bottomPanel.mouseDragLastPositionY =
							mousePos.y;
					})
				);
			}
		});
	}

	componentDidUpdate(prevProps, prevState) {
		// Typical usage (don't forget to compare props):
		if (this.state.runner.isPlaying !== prevState.runner.isPlaying) {
			console.log(this.state.runner.isPlaying);
			if (!prevState.runner.isPlaying) {
				this.runNextNode();
			}
		}
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

	toggleInspectedNodeReqSettingsIsCollapsed() {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				const inspectedNode = draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				);
				inspectedNode.reqSettings.isCollapsed = !inspectedNode
					.reqSettings.isCollapsed;
			})
		);
	}

	updateInspectedNodeReqMethod(e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).reqSettings.method = e.target.value;
			})
		);
	}

	updateInspectedNodeUrl(e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).reqSettings.url = e.target.value;
			})
		);
		console.log(e.target.value);
	}

	updateInspectedNodeReqSettingsActiveTab(tabName) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).reqSettings.activeTab = tabName;
			})
		);
	}

	addInspectedNodeParam() {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes
					.find((n) => n.id === draftState.nodeInspectedId)
					.reqSettings.params.push({
						key: "",
						value: "",
						isEnabled: true,
					});
			})
		);
	}
	removeInspectedNodeParam(i) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes
					.find((n) => n.id === draftState.nodeInspectedId)
					.reqSettings.params.splice(i, 1);
			})
		);
	}
	updateInspectedNodeParamKey(i, e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).reqSettings.params[i].key = e.target.value;
			})
		);
	}
	updateInspectedNodeParamValue(i, e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).reqSettings.params[i].value = e.target.value;
			})
		);
	}
	toggleInspectedNodeParam(i) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				const inspectedNode = draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				);
				inspectedNode.reqSettings.params[i].isEnabled = !inspectedNode
					.reqSettings.params[i].isEnabled;
			})
		);
	}

	updateInspectedNodeBodyContent(e) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.nodes.find(
					(n) => n.id === draftState.nodeInspectedId
				).reqSettings.bodyContent = e.target.value;
			})
		);
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
		let originType;
		// Start nodes
		const origin = this.state.cableDrag.origin;
		if (origin.substring(0, origin.indexOf("/")) === "start") {
			originType =
				origin.substring(origin.indexOf("/") + 1, origin.length) ===
				"inletPin"
					? "inlet"
					: "outlet";
		} else {
			// Request nodes
			originType =
				(this.state.cableDrag.origin.match(/\//g) || []).length === 1
					? "inlet"
					: "outlet";
		}

		let targetType;
		// Start nodes
		if (target.substring(0, target.indexOf("/")) === "start") {
			targetType =
				target.substring(target.indexOf("/") + 1, target.length) ===
				"inletPin"
					? "inlet"
					: "outlet";
		} else {
			// Request nodes
			targetType =
				(target.match(/\//g) || []).length === 1 ? "inlet" : "outlet";
		}

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
		// Code to run only for the start node
		if (pin.substring(0, pin.indexOf("/")) === "start") {
			const type =
				pin.substring(pin.indexOf("/") + 1, pin.length) === "inletPin"
					? "inlet"
					: "outlet";
			if (type === "inlet") {
				const node = this.state.startNode;
				const pinOffset = 15;
				const startNodeBoxHeight = 100;
				const position = {
					x: node.position.x - pinOffset + 5,
					y: node.position.y + startNodeBoxHeight / 2 + 5,
				};
				return position;
			} else if (type === "outlet") {
				const node = this.state.startNode;
				const pinOffset = 15;
				const startNodeBoxWidth = 100;
				const startNodeBoxHeight = 100;
				const position = {
					x: node.position.x + startNodeBoxWidth + pinOffset - 5,
					y: node.position.y + startNodeBoxHeight / 2 + 5,
				};
				return position;
			}
		}

		// Otherwise run the code for anything kind of pin that isn't on the start node (request nodes)
		const type = (pin.match(/\//g) || []).length === 1 ? "inlet" : "outlet";
		//console.log("type:", type, pin);
		if (type === "inlet") {
			const [nodeId, ,] = pin.split("/");
			const node = this.state.nodes.find((n) => n.id === nodeId);
			const pinOffset = 15;
			const nodeBoxHeight = 150;
			const position = {
				x: node.nodePos.x - pinOffset + 5,
				y: node.nodePos.y + nodeBoxHeight / 2 + 5,
			};
			//console.log(position);
			return position;
		} else if (type === "outlet") {
			const [nodeId, , outletPinName] = pin.split("/");
			//console.log(nodeId, outletPinName);
			const node = this.state.nodes.find((n) => n.id === nodeId);
			const nodeBoxWidth = 200;
			const nodeBoxHeight = 150;
			const pinOffset = 15;
			// (node.outletPinNames.indexOf(outletPinName) + 1) *
			// 	(150 / (node.outletPinNames.length + 1)) -
			// 	5;
			const position = {
				x: node.nodePos.x + nodeBoxWidth + pinOffset - 5,
				y:
					node.nodePos.y +
					(node.outletPinNames.indexOf(outletPinName) + 1) *
						(nodeBoxHeight / (node.outletPinNames.length + 1)),
			};
			//console.log(position);
			return position;
		}
	}

	startSidebarPanelDrag(e) {
		// console.log(this.state.nodePinnedId, e.target.getClientRects()[0]);
		const mousePos = this.getMousePos(e);
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.sidebarPanel.isDragging = true;
				draftState.sidebarPanel.mouseDragLastPositionX = mousePos.x;
			})
		);
	}

	startBottomPanelDrag(e) {
		// console.log(this.state.nodePinnedId, e.target.getClientRects()[0]);
		const mousePos = this.getMousePos(e);
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.bottomPanel.isDragging = true;
				draftState.bottomPanel.mouseDragLastPositionY = mousePos.y;
			})
		);
	}

	setBottomPanelActiveTab(tabName) {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.bottomPanel.activeTab = tabName;
			})
		);
	}

	playRunner() {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.runner.isPlaying = true;
			})
		);
	}
	pauseRunner() {
		this.setState((curState) =>
			produce(curState, (draftState) => {
				draftState.runner.isPlaying = false;
			})
		);
	}

	runNextNode() {
		if (this.state.runner.currentNodeId === "start") {
			const firstNodePin = this.state.cableConnections.find(
				(cC) => cC[0].substring(0, cC[0].indexOf("/")) === "start"
			)[1];
			console.log("!1", firstNodePin);
			const firstNodeId = firstNodePin.substring(
				0,
				firstNodePin.indexOf("/")
			);
			console.log("!2", firstNodeId);
			console.log(firstNodeId);
			const firstNode = this.state.nodes.find(
				(n) => n.id === firstNodeId
			);
			console.log("!3", firstNode);
			fetch(
				this.appendParamsToUrl(
					firstNode.reqSettings.url,
					firstNode.reqSettings.params
				)
			)
				.then(function (response) {
					// The API call was successful!
					return response.text();
				})
				.then(function (html) {
					// This is the HTML from our response as a text string
					console.log(html);
				})
				.catch(function (err) {
					// There was an error
					console.warn("Something went wrong.", err);
				});
		}
	}

	//////// Util ////////////

	getInspectedNode() {
		return this.state.nodes.find(
			(n) => n.id === this.state.nodeInspectedId
		);
	}

	appendParamsToUrl(url, params) {
		// Extracts the url root
		url =
			url.indexOf("?") === -1 ? url : url.substring(0, url.indexOf("?"));
		let numOfParamsAppended = 0;
		params.forEach((p, i) => {
			if (numOfParamsAppended > 0) {
				url = url + "&";
			}
			if (p.isEnabled) {
				if (numOfParamsAppended === 0) {
					url = url + "?";
				}
				url = url + `${p.key}=${p.value}`;
				numOfParamsAppended++;
			}
		});
		return url;
	}

	render() {
		return (
			<div className="main-container">
				<div
					className="patch-space"
					style={{
						width: `calc(100% - ${this.state.sidebarPanel.width}px)`,
						height: `calc(100% - ${this.state.bottomPanel.height}px)`,
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
									{n.reqSettings.method}
								</div>
								<div
									className="header__url-display-box"
									title={this.appendParamsToUrl(
										n.reqSettings.url,
										n.reqSettings.params
									)}
								>
									{this.appendParamsToUrl(
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
						<div
							className="start-node-box__inlet-pin"
							title="inlet pin"
							onMouseDown={(e) =>
								this.startCableDrag(e, `start/inletPin`)
							}
							onMouseUp={(e) =>
								this.addCableConnection(`start/inletPin`)
							}
						></div>
						<div
							className="start-node-box__outlet-pin"
							title="outlet pin"
							onMouseDown={(e) =>
								this.startCableDrag(e, `start/outletPin`)
							}
							onMouseUp={(e) =>
								this.addCableConnection(`start/outletPin`)
							}
						></div>
					</div>
					<div className="playback-toolbar">
						<button
							className="playback-toolbar__play-pause"
							onClick={() =>
								!this.state.runner.isPlaying
									? this.playRunner()
									: this.pauseRunner()
							}
						>
							<i
								className={`fa fa-${
									!this.state.runner.isPlaying
										? "play"
										: "pause"
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
						<i
							className="fa fa-caret-square-o-down"
							aria-hidden="true"
						></i>
					</button>
				</div>
				<div
					className="sidebar-panel"
					style={{
						width: this.state.sidebarPanel.width + "px",
						height: `calc(100% - ${this.state.bottomPanel.height}px)`,
					}}
				>
					<div
						className="sidebar-panel__drag"
						onMouseDown={(e) => {
							this.startSidebarPanelDrag(e);
						}}
					></div>
					{this.state.nodeInspectedId !== null ? (
						<div>
							<div className="node-id">
								<div className="node-id__label">Id:</div>
								<input
									type="text"
									className="node-id__input-field"
									value={this.state.nodeInspectedId}
									onChange={(e) =>
										this.updateInspectedNodeId(e)
									}
								/>
							</div>
							<hr style={{ margin: "0" }} />
							<div className="request-settings">
								<div
									className="request-settings__label"
									onClick={
										this
											.toggleInspectedNodeReqSettingsIsCollapsed
									}
								>
									<i
										class={`fa fa-caret-${
											!this.getInspectedNode().reqSettings
												.isCollapsed
												? "down"
												: "right"
										}`}
										aria-hidden="true"
									></i>
									&nbsp; Request Settings:
								</div>
								{!this.getInspectedNode().reqSettings
									.isCollapsed ? (
									<div>
										<div className="request-settings__url">
											<select
												className="request-settings__method-select"
												value={
													this.getInspectedNode()
														.reqSettings.method
												}
												onChange={
													this
														.updateInspectedNodeReqMethod
												}
											>
												<option value="GET">GET</option>
												<option value="POST">
													POST
												</option>
												<option value="DELETE">
													DELETE
												</option>
												<option value="CONNECT">
													CONNECT
												</option>
											</select>
											<input
												type="text"
												className="request-settings__url-input-field"
												value={this.appendParamsToUrl(
													this.getInspectedNode()
														.reqSettings.url,
													this.getInspectedNode()
														.reqSettings.params
												)}
												onChange={(e) =>
													this.updateInspectedNodeUrl(
														e
													)
												}
											/>
										</div>
										<div className="request-settings__tabs">
											<button
												className={`request-settings__tab ${
													this.getInspectedNode()
														.reqSettings
														.activeTab === "PARAMS"
														? "request-settings__tab--active"
														: null
												}`}
												onClick={() =>
													this.updateInspectedNodeReqSettingsActiveTab(
														"PARAMS"
													)
												}
											>
												Params
											</button>
											<button
												className={`request-settings__tab ${
													this.getInspectedNode()
														.reqSettings
														.activeTab === "AUTH"
														? "request-settings__tab--active"
														: null
												}`}
												onClick={() =>
													this.updateInspectedNodeReqSettingsActiveTab(
														"AUTH"
													)
												}
											>
												Auth
											</button>
											<button
												className={`request-settings__tab ${
													this.getInspectedNode()
														.reqSettings
														.activeTab === "HEADERS"
														? "request-settings__tab--active"
														: null
												}`}
												onClick={() =>
													this.updateInspectedNodeReqSettingsActiveTab(
														"HEADERS"
													)
												}
											>
												Headers
											</button>
											<button
												className={`request-settings__tab ${
													this.getInspectedNode()
														.reqSettings
														.activeTab === "BODY"
														? "request-settings__tab--active"
														: null
												}`}
												onClick={() =>
													this.updateInspectedNodeReqSettingsActiveTab(
														"BODY"
													)
												}
											>
												Body
											</button>
										</div>
										{(() => {
											if (
												this.getInspectedNode()
													.reqSettings.activeTab ===
												"PARAMS"
											) {
												return (
													<div className="request-settings__params">
														{this.getInspectedNode().reqSettings.params.map(
															(p, i) => (
																<div>
																	<input
																		className="request-settings__params-key-field"
																		type="text"
																		placeholder="Add key"
																		disabled={
																			!p.isEnabled
																		}
																		value={
																			p.key
																		}
																		onChange={(
																			e
																		) =>
																			this.updateInspectedNodeParamKey(
																				i,
																				e
																			)
																		}
																	/>
																	<input
																		className="request-settings__params-value-field"
																		type="text"
																		placeholder="Add value"
																		disabled={
																			!p.isEnabled
																		}
																		value={
																			p.value
																		}
																		onChange={(
																			e
																		) =>
																			this.updateInspectedNodeParamValue(
																				i,
																				e
																			)
																		}
																	/>
																	<button
																		className="request-settings__params-toggle-button"
																		onClick={() =>
																			this.toggleInspectedNodeParam(
																				i
																			)
																		}
																	>
																		{p.isEnabled
																			? "Disable"
																			: "Enable"}
																	</button>
																	<button
																		className="request-settings__params-remove-button"
																		onClick={() =>
																			this.removeInspectedNodeParam(
																				i
																			)
																		}
																	>
																		Remove
																	</button>
																</div>
															)
														)}
														<input
															className="request-settings__params-key-field"
															type="text"
															placeholder="Add key"
															disabled
														/>
														<input
															className="request-settings__params-value-field"
															type="text"
															placeholder="Add value"
															disabled
														/>
														<button
															className="request-settings__params-toggle-button"
															onClick={
																this
																	.addInspectedNodeParam
															}
														>
															Enable
														</button>
														<button
															className="request-settings__params-remove-button"
															disabled
														>
															Remove
														</button>
													</div>
												);
											} else if (
												this.getInspectedNode()
													.reqSettings.activeTab ===
												"AUTH"
											) {
												return <div>Auth</div>;
											} else if (
												this.getInspectedNode()
													.reqSettings.activeTab ===
												"HEADERS"
											) {
												return <div>Headers</div>;
											} else if (
												this.getInspectedNode()
													.reqSettings.activeTab ===
												"BODY"
											) {
												return (
													<div className="request-settings__body-container">
														<textarea
															className="request-settings__body"
															value={
																this.getInspectedNode()
																	.reqSettings
																	.bodyContent
															}
															onChange={(e) =>
																this.updateInspectedNodeBodyContent(
																	e
																)
															}
														></textarea>
													</div>
												);
											}
										})()}
									</div>
								) : null}
							</div>
							<hr style={{ margin: "0" }} />
							<div className="settings-group">
								<div className="settings-group__outlet-pins-label">
									Outlet pin names:
								</div>
								{this.getInspectedNode().outletPinNames.map(
									(pinName, i) => (
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
									)
								)}
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
					style={{ height: this.state.bottomPanel.height + "px" }}
				>
					<div
						className="bottom-panel__drag"
						onMouseDown={(e) => {
							this.startBottomPanelDrag(e);
						}}
					></div>
					<div className="bottom-panel__tabs-header">
						<button
							onClick={() =>
								this.setBottomPanelActiveTab("REQUEST_TRACER")
							}
						>
							Request Tracer
						</button>
						<button
							onClick={() =>
								this.setBottomPanelActiveTab("SCRIPTS")
							}
						>
							Scripts
						</button>
						<button
							onClick={() =>
								this.setBottomPanelActiveTab("DATA_BAGS")
							}
						>
							Data Bags
						</button>
					</div>
					{(() => {
						if (
							this.state.bottomPanel.activeTab ===
							"REQUEST_TRACER"
						) {
							return <div>Request Tracer</div>;
						} else if (
							this.state.bottomPanel.activeTab === "SCRIPTS"
						) {
							return <div>Scripts</div>;
						} else if (
							this.state.bottomPanel.activeTab === "DATA_BAGS"
						) {
							return <div>Data Bags</div>;
						}
					})()}
				</div>
			</div>
		);
	}
}

export default App;
