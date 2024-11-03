#!/bin/bash

# Description:
# This script loops through all .webp images in the current directory
# and generates multiple thumbnails stored in the 'thumbs' subdirectory.
# It maintains the aspect ratio of images, handling both square and non-square images.

# Configuration
THUMB_DIR="thumbs"       # Directory to store thumbnails

# Define an associative array of sizes with labels and maximum dimensions
declare -A SIZES=(
    ["thumbnail"]="200x200"   # Maximum width x height
    ["small"]="300x300"       # Optional additional size
    ["medium"]="400x400"      # Standard display in cards
    ["large"]="800x800"       # Detailed views
    ["xlarge"]="1200x1200"    # High-resolution displays
)

# Choose resizing strategy
# Options:
#   - "fit" : Resize to fit within the bounding box (maintains aspect ratio, no cropping)
#   - "fill": Resize to fill the bounding box and crop excess
#   - "pad" : Resize to fit and pad the remaining area
RESIZE_STRATEGY="fit"

# Function to display usage
usage() {
    echo "Usage: $0 [strategy]"
    echo "Resizing strategies:"
    echo "  fit   - Resize to fit within the bounding box (default)"
    echo "  fill  - Resize to fill the bounding box and crop excess"
    echo "  pad   - Resize to fit and pad the remaining area"
    exit 1
}

# Optional: Allow strategy to be passed as an argument
if [ $# -gt 1 ]; then
    usage
elif [ $# -eq 1 ]; then
    case "$1" in
        fit|fill|pad)
            RESIZE_STRATEGY="$1"
            ;;
        *)
            echo "Invalid strategy: $1"
            usage
            ;;
    esac
fi

# Create the thumbnails directory if it doesn't exist
mkdir -p "$THUMB_DIR"

# Enable nullglob to handle no .webp files gracefully
shopt -s nullglob
webp_files=(*.webp)
if [ ${#webp_files[@]} -eq 0 ]; then
    echo "No .webp files found in the current directory."
    exit 0
fi

# Loop through each .webp file
for img in "${webp_files[@]}"; do
    for label in "${!SIZES[@]}"; do
        max_size="${SIZES[$label]}"  # e.g., "200x200"
        # Extract the filename without extension
        filename="${img%.*}"
        # Define the output thumbnail path with label suffix
        thumb_path="$THUMB_DIR/${filename}-${label}.webp"

        # Apply resizing strategy with optimization
        case "$RESIZE_STRATEGY" in
            fit)
                # Resize to fit within the bounding box, maintaining aspect ratio
                convert "$img" -thumbnail "$max_size>" -strip -quality 95 "$thumb_path"
                ;;
            fill)
                # Resize and crop to fill the bounding box
                convert "$img" -resize "$max_size^" -gravity center -extent "$max_size" -strip -quality 95 -define webp:method=6 "$thumb_path"
                ;;
            pad)
                # Resize to fit and pad the remaining area with a background color (e.g., white)
                convert "$img" -thumbnail "$max_size" -background white -gravity center -extent "$max_size" -strip -quality 95 "$thumb_path"
                ;;
        esac

        # Check if the thumbnail was created successfully
        if [ $? -eq 0 ]; then
            echo "Thumbnail created: $thumb_path"
        else
            echo "Failed to create thumbnail for: $img at size $label"
        fi
    done
done

echo "Thumbnail generation completed."
