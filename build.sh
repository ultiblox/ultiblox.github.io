#!/bin/bash

# Run Tailwind CSS build
npx tailwindcss -i ./src/assets/css/main.css -o ./dist/assets/css/main.css --minify

# Run Eleventy to build the site
npx @11ty/eleventy
