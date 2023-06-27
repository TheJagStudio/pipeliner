import React, { useCallback, useRef, useState } from "react";
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";

import Sidebar from "../Components/Sidebar";

const initNodes = [
	{
		id: "1",
		type: "Predictor",
		data: { id: 1, images: 0, items: 0, completed: 0, inProgress: 0, progress: 20 },
		position: { x: -150, y: -200 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "2",
		type: "ImageDataSource",
		data: { id: 2, images: 0, items: 0, completed: 0, inProgress: 0, progress: 20 },
		position: { x: -150, y: -200 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "3",
		type: "UrlDataSource",
		data: { id: 3, images: 0, items: 0, completed: 0, inProgress: 0, progress: 20 },
		position: { x: -150, y: -200 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "4",
		type: "CamreraDataSource",
		data: { id: 4, images: 0, items: 0, completed: 0, inProgress: 0, progress: 20 },
		position: { x: -150, y: -200 },
		dragHandle: ".custom-drag-handle",
	},
]

const initEdges = [
	{
		id: "e1-2",
		source: "1",
		target: "2",
	},
	{
		id: "e2-3",
		source: "2",
		target: "3",
	},
	{
		id: "e3-4",
		source: "3",
		target: "4",
	},
	{
		id: "e4-5",
		source: "4",
		target: "5",
	},
]

const PreditionPipeline = () => {
	const reactFlowWrapper = useRef(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
	const [reactFlowInstance, setReactFlowInstance] = useState(null);
	let id = 0;
	const getId = () => `pipeJoins_${id++}`;
	const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);
	const onDrop = useCallback(
		(event) => {
			event.preventDefault();
			console.log(reactFlowWrapper);
			const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
			const type = event.dataTransfer.getData("application/reactflow");
			// check if the dropped element is valid
			if (typeof type === "undefined" || !type) {
				return;
			}
			const position = reactFlowInstance.project({
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			});
			let tempData = {};
			if (type === "Predictor") {
				tempData = { id: getId(), images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "ImageDataSource") {
				tempData = { id: getId(), labels: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "UrlDataSource") {
				tempData = { id: getId(), labels: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "CamreraDataSource") {
				tempData = { id: getId(), labels: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} 
			const newNode = {
				id: getId(),
				type,
				position,
				data: tempData,
				dragHandle: ".custom-drag-handle",
			};
			setNodes((nds) => nds.concat(newNode));
		},
		[reactFlowInstance]
	);
	return (
		<ReactFlowProvider>
			<div className="w-full h-screen rounded-lg p-2 flex items-center gap-2" ref={reactFlowWrapper}>
				<Sidebar />
				<div className="bg-primary-900 w-[80vw] overflow-hidden drop-shadow-lg h-full rounded-xl">
					<ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={onDragOver} fitView>
						<MiniMap zoomable pannable className="bg-primary-600 rounded-xl" />
						<Controls />
						<Background variant="dots" color="var(--primary-500)" className="opacity-40" gap={8} size={1.5} />
					</ReactFlow>
				</div>
			</div>
		</ReactFlowProvider>
	);
}

export default PreditionPipeline