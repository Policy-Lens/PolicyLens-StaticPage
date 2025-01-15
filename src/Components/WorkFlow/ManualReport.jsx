import { useState } from "react";
import { Button, Input } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Worker, Viewer, ScrollMode } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

const ManualReport = ({ selectedControls }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentKeyPointIndex, setCurrentKeyPointIndex] = useState(0);
    const [responses, setResponses] = useState([]);
    const [feedbacks, setFeedbacks] = useState({});
    const [showFullKeyPoint, setShowFullKeyPoint] = useState(false);
    const [controlResult, setControlResult] = useState(null); 

    const currentControl = selectedControls[currentIndex];
    const currentKeyPoint = currentControl?.keyPoints?.[currentKeyPointIndex];

    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToNextPage, jumpToPreviousPage, CurrentPageLabel, NumberOfPages } =
        pageNavigationPluginInstance;

    const handleNextControl = () => {
        if (currentIndex < selectedControls.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentKeyPointIndex(0);
            setResponses([]);
            setFeedbacks({});
            setShowFullKeyPoint(false);
            setControlResult(null); 
        }
    };

    const handlePreviousControl = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setCurrentKeyPointIndex(0);
            setResponses([]);
            setFeedbacks({});
            setShowFullKeyPoint(false);
            setControlResult(null); 
        }
    };

    const handleResponse = (response) => {
        if (responses.length >= currentControl.keyPoints.length) {
            return;
        }

        setResponses((prevResponses) => [...prevResponses, response]);

        if (response === "Yes") {
            setCurrentKeyPointIndex(currentKeyPointIndex + 1);
            setShowFullKeyPoint(false);
        }
    };

    const handleFeedbackChange = (index, value) => {
        setFeedbacks((prev) => ({ ...prev, [index]: value }));
    };

    const handleNextKeyPoint = () => {
        setCurrentKeyPointIndex(currentKeyPointIndex + 1);
        setShowFullKeyPoint(false);
    };

    const yesCount = responses.filter((r) => r === "Yes").length;
    const noCount = responses.filter((r) => r === "No").length;

    const isKeyPointLengthy = currentKeyPoint && currentKeyPoint.split(" ").length > 8;

    const allKeyPointsEvaluated = responses.length >= currentControl?.keyPoints?.length;

    return (
        <div className="flex h-screen">
            {/* Document Viewer */}
            <div className="w-4/5 bg-white pr-4 relative">
                <h2 className="text-xl font-bold mb-4 ml-12 mt-2">Document Viewer</h2>
                <div className="h-[650px] flex flex-col mt-8 items-center justify-center relative">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
                        <Viewer
                            fileUrl={"/Document1.pdf"}
                            plugins={[pageNavigationPluginInstance]}
                            scrollMode={ScrollMode.Page}
                        />
                    </Worker>
                    <button
                        type="button"
                        onClick={jumpToPreviousPage}
                        className="absolute left-10 top-1/2 transform -translate-y-1/2 text-xl font-bold hover:text-blue-500"
                    >
                        <LeftOutlined />
                    </button>
                    <button
                        type="button"
                        onClick={jumpToNextPage}
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xl font-bold hover:text-blue-500"
                    >
                        <RightOutlined />
                    </button>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-bold">
                            Page <CurrentPageLabel /> of <NumberOfPages />
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls and Approval Section */}
            <div className="w-1/4 p-4 bg-gray-50 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    Selected Control ({currentIndex + 1} of {selectedControls.length})
                </h2>
                {currentControl ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-700">{currentControl.controlName}</span>
                        </div>

                        {!allKeyPointsEvaluated ? (
                            <div className="mb-6">
                                <p className="text-gray-700 font-medium mb-2">
                                    Key Point {currentKeyPointIndex + 1} of {currentControl.keyPoints.length}:
                                </p>
                                <div className="border p-2 rounded mb-4">
                                    {showFullKeyPoint ? (
                                        <>
                                            {currentKeyPoint.split("\n").map((line, index) => (
                                                <p key={index} className="mb-1">
                                                    {line.trim()}
                                                </p>
                                            ))}
                                            <button
                                                className="text-blue-500 hover:text-blue-700 ml-2"
                                                onClick={() => setShowFullKeyPoint(false)}
                                            >
                                                Less
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {currentKeyPoint.split(" ").slice(0, 8).join(" ")}...
                                            <button
                                                className="text-blue-500 hover:text-blue-700 ml-2"
                                                onClick={() => setShowFullKeyPoint(true)}
                                            >
                                                More
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        className="px-4 py-2 rounded-md"
                                        onClick={() => handleResponse("Yes")}
                                        disabled={allKeyPointsEvaluated}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        className="px-4 py-2 rounded-md"
                                        onClick={() => handleResponse("No")}
                                        disabled={allKeyPointsEvaluated}
                                    >
                                        No
                                    </Button>
                                </div>

                                
                                {responses[currentKeyPointIndex] === "No" && (
                                    <div className="mt-4">
                                        <Input.TextArea
                                            rows={3}
                                            placeholder="Provide feedback for 'No' response"
                                            value={feedbacks[currentKeyPointIndex] || ""}
                                            onChange={(e) =>
                                                handleFeedbackChange(currentKeyPointIndex, e.target.value)
                                            }
                                        />
                                        <Button
                                            className="mt-2"
                                            onClick={handleNextKeyPoint}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}

                                <div className="mt-2">
                                    <p className="text-gray-700">Yes: {yesCount}</p>
                                    <p className="text-gray-700">No: {noCount}</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600 mb-4 font-medium">
                                    Key points evaluation completed for this control.
                                </p>
                                <p className="text-gray-700">Yes: {yesCount}</p>
                                <p className="text-gray-700">No: {noCount}</p>

                                {/* Final Control Approval Section */}
                                {controlResult === null && (
                                    <div className="mt-4">
                                        <p className="text-gray-700 font-medium mb-2">
                                            Final Control Approval:
                                        </p>
                                        <div className="flex gap-4">
                                            <Button
                                                className="px-4 py-2 rounded-md"
                                                onClick={() => setControlResult("Yes")}
                                            >
                                                Yes
                                            </Button>
                                            <Button
                                                className="px-4 py-2 rounded-md"
                                                onClick={() => setControlResult("No")}
                                            >
                                                No
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {controlResult && (
                                    <p className="text-gray-700 mt-4">
                                        Final Control Approval: {controlResult}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 mt-4">
                            <Button
                                type="default"
                                className="px-6 py-2 rounded-md"
                                onClick={handlePreviousControl}
                                disabled={currentIndex === 0}
                            >
                                Back
                            </Button>
                            <Button
                                type="primary"
                                className="bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 px-6 py-2 text-white rounded-md"
                                onClick={handleNextControl}
                                disabled={currentIndex === selectedControls.length - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600">No controls selected.</p>
                )}
            </div>
        </div>
    );
};

export default ManualReport;
