# Simple Photo Editor

## Overview

This is a simple web-based photo editor that allows users to upload an image, apply filters, adjust brightness and contrast, add multiple text blocks with customization options, and save the edited image in different formats. The project is built using HTML, CSS, and JavaScript.

## Features

- Upload an image from your device
- Apply filters: Grayscale, Sepia, Invert
- Adjust brightness and contrast
- Add and edit multiple text blocks with customization options:
  - Font size
  - Font family
  - Font color
- Move and drag text blocks
- Undo functionality
- Visible indicator for the selected text block
- Upscale images (up to 4K resolution)
- Save the edited image in different formats (PNG, JPG)

## Getting Started

### Prerequisites

To run this project, you only need a web browser.

## Usage

1. Click the "Upload" button to select an image from your device.
2. Use the filter buttons to apply different effects to the image.
3. Adjust the brightness and contrast using the range sliders.
4. Add custom text by entering text in the input box and clicking "Add Text". You can customize the font size, family, and color.
5. Click on a text block to select it and move it around the canvas. The selected text block will have a visible indicator.
6. Use the "Undo" button to revert the last change.
7. Click the "Upscale Image" button to increase the resolution of the image.
8. Select the file format (PNG or JPG) from the dropdown and click the "Save Image" button to download the edited image.

## Project Structure

```plaintext
photo-editor/
├── index.html
├── styles.css
└── app.js
