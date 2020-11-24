import React from "react";
import "./SidebarPanel.css";

class SidebarPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div
				className="sidebar-panel"
				style={{
					width: this.props.sidebarPanel.width + "px",
					height: `calc(100% - ${this.props.bottomPanel.height}px)`,
				}}
			>
				<div
					className="sidebar-panel__drag"
					onMouseDown={(e) => {
						this.props.methods.startSidebarPanelDrag(e);
					}}
				></div>
				{this.props.nodeInspectedId !== null ? (
					<div>
						<div className="node-id">
							<div className="node-id__label">Id:</div>
							<input
								type="text"
								className="node-id__input-field"
								value={this.props.nodeInspectedId}
								onChange={(e) => this.props.methods.updateInspectedNodeId(e)}
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
									className={`fa fa-caret-${
										!this.props.methods.getInspectedNode().reqSettings
											.isCollapsed
											? "down"
											: "right"
									}`}
									aria-hidden="true"
								></i>
								&nbsp; Request Settings:
							</div>
							{!this.props.methods.getInspectedNode().reqSettings
								.isCollapsed ? (
								<div>
									<div className="request-settings__url">
										<select
											className="request-settings__method-select"
											value={
												this.props.methods.getInspectedNode()
													.reqSettings.method
											}
											onChange={
												this
													.updateInspectedNodeReqMethod
											}
										>
											<option value="GET">GET</option>
											<option value="POST">POST</option>
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
											value={this.props.methods.appendParamsToUrl(
												this.props.methods.getInspectedNode()
													.reqSettings.url,
												this.props.methods.getInspectedNode()
													.reqSettings.params
											)}
											onChange={(e) =>
												this.props.methods.updateInspectedNodeUrl(e)
											}
										/>
									</div>
									<div className="request-settings__tabs">
										<button
											className={`request-settings__tab ${
												this.props.methods.getInspectedNode()
													.reqSettings.activeTab ===
												"PARAMS"
													? "request-settings__tab--active"
													: null
											}`}
											onClick={() =>
												this.props.methods.updateInspectedNodeReqSettingsActiveTab(
													"PARAMS"
												)
											}
										>
											Params
										</button>
										<button
											className={`request-settings__tab ${
												this.props.methods.getInspectedNode()
													.reqSettings.activeTab ===
												"AUTH"
													? "request-settings__tab--active"
													: null
											}`}
											onClick={() =>
												this.props.methods.updateInspectedNodeReqSettingsActiveTab(
													"AUTH"
												)
											}
										>
											Auth
										</button>
										<button
											className={`request-settings__tab ${
												this.props.methods.getInspectedNode()
													.reqSettings.activeTab ===
												"HEADERS"
													? "request-settings__tab--active"
													: null
											}`}
											onClick={() =>
												this.props.methods.updateInspectedNodeReqSettingsActiveTab(
													"HEADERS"
												)
											}
										>
											Headers
										</button>
										<button
											className={`request-settings__tab ${
												this.props.methods.getInspectedNode()
													.reqSettings.activeTab ===
												"BODY"
													? "request-settings__tab--active"
													: null
											}`}
											onClick={() =>
												this.props.methods.updateInspectedNodeReqSettingsActiveTab(
													"BODY"
												)
											}
										>
											Body
										</button>
									</div>
									{(() => {
										if (
											this.props.methods.getInspectedNode().reqSettings
												.activeTab === "PARAMS"
										) {
											return (
												<div className="request-settings__params">
													{this.props.methods.getInspectedNode().reqSettings.params.map(
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
																		this.props.methods.updateInspectedNodeParamKey(
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
																		this.props.methods.updateInspectedNodeParamValue(
																			i,
																			e
																		)
																	}
																/>
																<button
																	className="request-settings__params-toggle-button"
																	onClick={() =>
																		this.props.methods.toggleInspectedNodeParam(
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
																		this.props.methods.removeInspectedNodeParam(
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
											this.props.methods.getInspectedNode().reqSettings
												.activeTab === "AUTH"
										) {
											return <div>Auth</div>;
										} else if (
											this.props.methods.getInspectedNode().reqSettings
												.activeTab === "HEADERS"
										) {
											return <div>Headers</div>;
										} else if (
											this.props.methods.getInspectedNode().reqSettings
												.activeTab === "BODY"
										) {
											return (
												<div className="request-settings__body-container">
													<textarea
														className="request-settings__body"
														value={
															this.props.methods.getInspectedNode()
																.reqSettings
																.bodyContent
														}
														onChange={(e) =>
															this.props.methods.updateInspectedNodeBodyContent(
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
							{this.props.methods.getInspectedNode().outletPinNames.map(
								(pinName, i) => (
									<div>
										<input
											type="text"
											className="settings-group__outlet-pin-name-input-field"
											value={pinName}
											onChange={(e) =>
												this.props.methods.updateInspectedNodeOutletPinName(
													i,
													e
												)
											}
										/>
										<button
											className="settings-group__outlet-pin-delete-button"
											onClick={() =>
												this.props.methods.deleteInspectedNodeOutletPin(
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
								onClick={() => this.props.methods.addInspectedNodeOutletPin()}
							>
								Add pin
							</button>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}

export default SidebarPanel;