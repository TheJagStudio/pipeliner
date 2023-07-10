import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TrainingPipeline from "./Pages/trainingPipeline";
import TrainForm from "./Pages/TrainForm";

import PredictionPipeline from "./Pages/PreditionPipeline";
import PredictionForm from "./Pages/PredictionForm";

import TextAnotator from "./Pages/textAnotator";
import ImageAnnotation from "./Pages/imageAnnotation";
import Navbar from "./Components/Navbar";
import ImageGallery from "./Pages/ImageGallery";

import FabricRegistration from "./Pages/FabricRegistration";
import AnnotatorAlloaction from "./Pages/AnnotatorAlloaction";

export default function App() {
    return (
        <Router>
            <div className="flex flex-col bg-primary-950 min-h-screen">
                <Navbar />
                <Routes>
                    <Route path="/" element={<FabricRegistration />} />
                    <Route path="/train" element={<TrainForm />} />
                    <Route path="/prediction" element={<PredictionForm />} />
                    <Route path="/image-annotation" element={<ImageAnnotation />} />
                    <Route path="/image-gallery" element={<ImageGallery />} />
                    <Route path="/annotator-allocation" element={<AnnotatorAlloaction />} />
                    {/* <Route path="/text" element={<TextAnotator title="Text Anotator" />} /> */}
                </Routes>
            </div>
        </Router>
    );
}
