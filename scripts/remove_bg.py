from PIL import Image
import sys

# Usage: python remove_bg.py input.png output.png [threshold]
# Example: python remove_bg.py public/logo.png public/logo_transparent.png 40

def main():
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py input.png output.png [threshold]")
        return
    inp = sys.argv[1]
    out = sys.argv[2]
    thresh = int(sys.argv[3]) if len(sys.argv) > 3 else 40

    img = Image.open(inp).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        # If pixel is close to black, make it transparent
        if r <= thresh and g <= thresh and b <= thresh:
            newData.append((r, g, b, 0))
        else:
            newData.append((r, g, b, a))

    img.putdata(newData)
    img.save(out, "PNG")
    print(f"Saved {out}")

if __name__ == '__main__':
    main()
