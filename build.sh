#!/bin/bash

# Manually run Tailwind CSS build
npx tailwindcss -i ./src/assets/css/main.css -o ./dist/assets/css/main.css --minify

# Run the full build with npm build
npm run build
