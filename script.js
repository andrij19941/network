navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const video = document.getElementById('webcam');
        video.srcObject = stream;

        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        const cocoSsdModelPromise = cocoSsd.load();
        const deepLabModelPromise = tf.loadGraphModel('@tensorflow-models/deeplab');

        video.addEventListener('loadedmetadata', async () => {
            const cocoModel = await cocoSsdModelPromise;
            const deepLabModel = await deepLabModelPromise;

            setInterval(async () => {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const cocoPredictions = await cocoModel.detect(canvas);
                const outputCanvas = document.getElementById('outputCanvas');
                const dlContext = outputCanvas.getContext('2d');
                const tensor = tf.browser.fromPixels(outputCanvas);
                const dlResult = await deepLabModel.executeAsync(tensor.expandDims(0));

                const [height, width] = dlResult.shape.slice(1, 3);
                tf.browser.toPixels(dlResult.squeeze(), outputCanvas);
                dlResult.dispose();
                tensor.dispose();

                const dlPredictions = dlContext.getImageData(0, 0, width, height);

                const resultDiv = document.getElementById('results');
                resultDiv.innerHTML = ''; // Очищення попередніх результатів

                cocoPredictions.forEach(prediction => {
                    const p = document.createElement('p');
                    p.textContent = `${prediction.class} - ${Math.round(prediction.score * 100)}%`;
                    resultDiv.appendChild(p);
                });

                console.log('COCO-SSD Predictions: ', cocoPredictions);
                console.log('DeepLab Predictions: ', dlPredictions);
            }, 1000); // Оновлення кадрів кожну секунду (змініть потрібний інтервал)
        });
    })
    .catch(error => {
        console.error('Error accessing the webcam:', error);
    });
