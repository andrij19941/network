navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const video = document.getElementById('webcam');
        video.srcObject = stream;

        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        video.addEventListener('loadedmetadata', () => {
            setInterval(() => {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                cocoSsd.load().then(model => {
                    model.detect(canvas).then(predictions => {
                        console.log('Predictions: ', predictions);

                        const resultDiv = document.getElementById('results');
                        resultDiv.innerHTML = ''; // Очищення попередніх результатів

                        predictions.forEach(prediction => {
                            const p = document.createElement('p');
                            p.textContent = `${prediction.class} - ${Math.round(prediction.score * 100)}%`;
                            resultDiv.appendChild(p);
                        });
                    });
                });
            }, 1000); // Оновлення кадрів кожну секунду (змініть потрібний інтервал)
        });
    })
    .catch(error => {
        console.error('Error accessing the webcam:', error);
    });

