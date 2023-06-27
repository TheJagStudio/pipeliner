import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TrainingPipeline from "./Pages/trainingPipeline";
import TextAnotator from "./Pages/textAnotator";
import ImageAnnotation from "./Pages/imageAnnotation";
import Navbar from "./Components/navbar";
export default function App() {
	return (
		<Router>
			<div className="flex flex-col bg-primary-950 h-screen">
				<Navbar />
				<Routes>
					<Route path="/" element={<TrainingPipeline title="Home" />} />
					<Route path="/imageAnnotation" element={<ImageAnnotation title="Home" />} />
					{/* <Route path="/text" element={<TextAnotator title="Text Anotator" />} /> */}
				</Routes>
			</div>
		</Router>
	);
}
