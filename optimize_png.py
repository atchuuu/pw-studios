from PIL import Image
import sys
import os

def optimize_png(input_path):
    try:
        # Check if file exists
        if not os.path.exists(input_path):
            print(f"Error: File '{input_path}' not found.")
            return

        # Get original size
        original_size = os.path.getsize(input_path)
        
        # Open image
        img = Image.open(input_path)
        
        # Quantize to 256 colors (8-bit) 
        # This significantly reduces size while maintaining high visual quality for logos
        # method=2 (FASTOCTREE) is fast and usually gives good results
        optimized_img = img.quantize(colors=256, method=2)
        
        # Save with optimization flags
        optimized_img.save(input_path, "PNG", optimize=True)
        
        # Get new size
        new_size = os.path.getsize(input_path)
        reduction = ((original_size - new_size) / original_size) * 100
        
        print(f"Successfully optimized: {input_path}")
        print(f"Original Size: {original_size/1024:.2f} KB")
        print(f"New Size:      {new_size/1024:.2f} KB")
        print(f"Reduction:     {reduction:.1f}%")

    except ImportError:
        print("Error: 'Pillow' library is required.")
        print("Please install it running: pip install Pillow")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 optimize_png.py <path_to_png>")
    else:
        optimize_png(sys.argv[1])
