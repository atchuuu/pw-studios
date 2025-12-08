from PIL import Image
import os

input_path = 'client/public/pw-banner.webp'
output_path = 'client/public/pw-banner.png'

try:
    im = Image.open(input_path).convert("RGB")
    im.save(output_path, "png")
    print(f"Successfully converted {input_path} to {output_path}")
except Exception as e:
    print(f"Error converting image: {e}")
