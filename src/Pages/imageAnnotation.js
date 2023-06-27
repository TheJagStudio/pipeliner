import React, { useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";

const ImageAnnotation = () => {
	const [shapes, setShapes] = useState([]);
	const stageRef = useRef()

	const handleMouseDown = (event) => {
		const { x, y } = event.target.getStage().getPointerPosition();
		setShapes([...shapes, [{ x, y }]]);
	};

	const handleMouseMove = (event) => {
		if (shapes.length === 0) {
			return;
		}

		const { x, y } = event.target.getStage().getPointerPosition();
		const lastShape = shapes[shapes.length - 1];
		const lastPoint = lastShape[lastShape.length - 1];
		lastShape[lastShape.length - 1] = { ...lastPoint, x, y };

		setShapes([...shapes.slice(0, -1), lastShape]);
	};

	const handleMouseUp = () => {
		const lastShape = shapes[shapes.length - 1];
		const simplifiedPoints = lastShape.map((point) => [point.x, point.y]).flat();
		lastShape.splice(0, lastShape.length, ...simplifiedPoints.map(([x, y]) => ({ x, y })));
		const dataURL = stageRef.current.toDataURL();
		const link = document.createElement("a");
		link.download = "annotated-image.png";
		link.href = dataURL;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setShapes([...shapes.slice(0, -1), lastShape]);
	};
	return (
		<div className="bg-primary-950 p-3 w-full h-full flex flex-nowrap gap-3">
			<div className="w-[20%] bg-primary-900 rounded-3xl inner-shadow p-3">
				<div className="relative group bg-gradient-to-tr from-primary-800 to-primary-900 rounded-2xl h-48 shadow-xl outline-2 outline-dashed outline-primary-900 hover:outline-primary-800 -outline-offset-8 flex flex-col items-center justify-center transition-all duration-500">
					<input type="file" multiple name="images" accept="image/*" className="absolute top-0 left-0 w-full h-full opacity-0" />
					<svg width="150px" height="150px" className="text-primary-200 opacity-50 group-hover:opacity-100 transition-all" viewBox="0 0 32 32">
						<path fill="currentColor" d="M26.958,11.076C26.49,5.993,22.203,2,17,2c-4.379,0-8.254,2.899-9.543,7.015 c-4.26-0.262-7.875,3.381-7.418,7.728C0.419,20.357,3.661,23,7.295,23H12v6c0,0.552,0.448,1,1,1h6c0.552,0,1-0.448,1-1v-6h5.788 c2.99,0,5.684-2.097,6.139-5.053C32.449,14.557,30.11,11.584,26.958,11.076z M18,21v7h-4v-7h-2.586L16,16.414L20.586,21H18z  M25.856,21H22l-5.293-5.293c-0.391-0.391-1.024-0.391-1.414,0L10,21H7.223c-2.61,0-4.945-1.903-5.199-4.5 C1.733,13.52,4.078,11,7,11c0.345,0,0.693,0.036,1.033,0.107c0.534,0.111,1.035-0.274,1.151-0.807C9.975,6.647,13.257,4,17,4 c4.395,0,7.974,3.563,8,7.952C25.003,12.51,25.443,13,26.001,13c2.395,0.001,4.305,2.117,3.958,4.578 C29.678,19.572,27.869,21,25.856,21z" />
					</svg>
					<p className="text-lg text-white opacity-50 group-hover:opacity-100 font-mono transition-all">Drag and Drop Files</p>
				</div>
			</div>
			<div className="w-[80%] bg-primary-900 rounded-3xl inner-shadow">
				<Stage width={window.innerWidth} height={window.innerHeight} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
					<Layer>
						{shapes.map((shape, i) => (
							<Line key={i} points={shape.map((point) => [point.x, point.y]).flat()} stroke="red" strokeWidth={5} lineCap="round" lineJoin="round" />
						))}
					</Layer>
				</Stage>
			</div>
		</div>
	);
};

export default ImageAnnotation;
