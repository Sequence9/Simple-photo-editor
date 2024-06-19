document.getElementById('upload').addEventListener('change', loadImage);
document.getElementById('save').addEventListener('click', saveImage);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();

function loadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        }
    }
    reader.readAsDataURL(file);
}

function saveImage() {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
}

function applyFilter(filter) {
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        switch (filter) {
            case 'grayscale':
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
                break;
            case 'sepia':
                data[i] = data[i] * 0.393 + data[i + 1] * 0.769 + data[i + 2] * 0.189;
                data[i + 1] = data[i] * 0.349 + data[i + 1] * 0.686 + data[i + 2] * 0.168;
                data[i + 2] = data[i] * 0.272 + data[i + 1] * 0.534 + data[i + 2] * 0.131;
                break;
            case 'invert':
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
                break;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

document.getElementById('brightness').addEventListener('input', applyAdjustments);
document.getElementById('contrast').addEventListener('input', applyAdjustments);

function applyAdjustments() {
    ctx.drawImage(img, 0, 0);
    const brightness = parseInt(document.getElementById('brightness').value);
    const contrast = parseInt(document.getElementById('contrast').value);

    ctx.filter = `brightness(${brightness + 100}%) contrast(${contrast + 100}%)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none';
}

function addText() {
    const text = document.getElementById('text-input').value;
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(text, 50, 50); // Position can be adjusted
}