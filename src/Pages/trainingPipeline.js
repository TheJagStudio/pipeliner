import React, { useCallback, useRef, useState } from "react";
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from "reactflow";

import "reactflow/dist/style.css";
// Input / Output
import InputImage from "../Components/InputImage";
import SplitDataset from "../Components/SplitDataset";
import InputLabel from "../Components/InputLabel";
import InputDataset from "../Components/InputDataset";

// Pre-processeing
import ImageResize from "../Components/ImageResize";
import ImageRotateFlip from "../Components/ImageRotateFlip";
import ImageGrayscale from "../Components/ImageGrayscale";
import ImageBrightness from "../Components/ImageBrightness";

// Gallery
import ImageViewer from "../Components/ImageViewer";

import Sidebar from "../Components/Sidebar";

const nodeTypes = {
	InputImage: InputImage,
	InputLabel: InputLabel,
	InputDataset: InputDataset,
	SplitDataset: SplitDataset,
	ImageResize: ImageResize,
	ImageRotateFlip: ImageRotateFlip,
	ImageGrayscale: ImageGrayscale,
	ImageBrightness: ImageBrightness,
	ImageViewer: ImageViewer,
};

const initNodes = [
	{
		id: "1",
		type: "InputImage",
		data: { id: 1, images: 0, items: 0, completed: 0, inProgress: 0, progress: 20 },
		position: { x: -150, y: -200 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "2",
		type: "InputLabel",
		data: { id: 2, labels: 0, items: 0, completed: 0, inProgress: 0, progress: 20 },
		position: { x: -150, y: 0 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "3",
		type: "InputDataset",
		data: { id: 3, zips: 0, items: 0, completed: 0, inProgress: 0, progress: 20 },
		position: { x: -150, y: 200 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "4",
		type: "SplitDataset",
		data: { id: 4, images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 },
		position: { x: 100, y: 0 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "5",
		type: "ImageResize",
		data: { id: 5, images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 },
		position: { x: 350, y: 0 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "6",
		type: "ImageRotateFlip",
		data: { id: 6, images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 },
		position: { x: 600, y: 0 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "7",
		type: "ImageGrayscale",
		data: { id: 7, images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 },
		position: { x: 850, y: 0 },
		dragHandle: ".custom-drag-handle",
	},
	{
		id: "8",
		type: "ImageBrightness",
		data: { id: 8, images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 },
		position: { x: 1100, y: 0 },
		dragHandle: ".custom-drag-handle",
	},
];

const initEdges = [
	{
		id: "e1-4",
		source: "1",
		targetHandle: "image",
		target: "4",
	},
	{
		id: "e2-4",
		source: "2",
		targetHandle: "label",
		target: "4",
	},
	{
		id: "e3-4",
		source: "3",
		targetHandle: "zip",
		target: "4",
	},
	{
		id: "e4-5",
		source: "4",
		target: "5",
	},
	{
		id: "e5-6",
		source: "5",
		target: "6",
	},
	{
		id: "e6-7",
		source: "6",
		target: "7",
	},
	{
		id: "e7-8",
		source: "7",
		target: "8",
	},
];
const TrainingPipeline = () => {
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
			if (type === "InputImage") {
				tempData = { id: getId(), images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "InputLabel") {
				tempData = { id: getId(), labels: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "InputDataset") {
				tempData = { id: getId(), images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "SplitDataset") {
				tempData = { id: getId(), images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "ImageResize") {
				tempData = { id: getId(), images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "ImageRotateFlip") {
				tempData = { id: getId(), images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
			} else if (type === "ImageViewer") {
				tempData = { id: getId(), images: 0, items: 0, completed: 0, inProgress: 0, progress: 0 };
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
};

export default TrainingPipeline;
