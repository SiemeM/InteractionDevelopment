document.addEventListener('DOMContentLoaded', function () {
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const webcam = new Webcam(webcamElement, 'user', canvasElement);
    const resultElement = document.getElementById('result');
    let net;

    // Initialize webcam
    webcam.start()
        .then(result => {
            console.log("Webcam started");
        })
        .catch(err => {
            console.error("Error starting webcam:", err);
        });

    // Load the model
    async function loadModel() {
        net = await ml5.imageClassifier('MobileNet', () => {
            console.log("Model loaded!");
        });
        document.getElementById('capture').addEventListener('click', classifyImage);
    }

    // Classify the image
    async function classifyImage() {
        console.log("Capturing image...");
        webcam.snap();  // Take a snapshot and draw it on the canvas
        const image = canvasElement;  // Use the canvas as the image for classification

        try {
            const results = await net.classify(image);
            console.log("Classification results:", results);
            resultElement.innerHTML = results.map(result =>
                `<div>${result.label}: ${result.confidence.toFixed(3)}</div>`
            ).join('');
        } catch (error) {
            console.error("Error during classification:", error);
        }
    }

    loadModel();
});
