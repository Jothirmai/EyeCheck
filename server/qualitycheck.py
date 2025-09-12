import cv2
import numpy as np
import json
import sys

def analyze_image_quality(image_path, 
                         blur_threshold=150,
                         exposure_low_percentile=5,
                         exposure_high_percentile=95,
                         clip_threshold=0.1,
                         visualize=False):
    # Load image and convert to grayscale
    image = cv2.imread(image_path)
    if image is None:
        print(json.dumps({"error": "Image not found or invalid path"}))
        sys.exit(1)
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # Blur detection
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance = laplacian.var()
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (h * w)
    blur_score = variance * edge_density
    is_blurry = blur_score < blur_threshold
    
    # Exposure detection
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist = hist / hist.sum()
    shadow_clip = float(np.sum(hist[:10]))
    highlight_clip = float(np.sum(hist[-10:]))
    percentile_low = float(np.percentile(gray, exposure_low_percentile))
    percentile_high = float(np.percentile(gray, exposure_high_percentile))
    
    exposure_issues = []
    if shadow_clip > clip_threshold:
        exposure_issues.append("underexposed")
    if highlight_clip > clip_threshold:
        exposure_issues.append("overexposed")
    if (percentile_high - percentile_low) < 100:
        exposure_issues.append("low dynamic range")
    
    exposure_status = "properly exposed" if not exposure_issues else ", ".join(exposure_issues)
    
    result = {
        "blurry": bool(is_blurry),
        "blurscore": float(blur_score),
        "exposurestatus": exposure_status,
        "shadowclip": shadow_clip,
        "highlightclip": highlight_clip,
        "dynamicrange": float(percentile_high - percentile_low)
    }
    
    if visualize:
        print(result)  # debugging only
    return result

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "sfbsdfvsdv.jpg"
    result = analyze_image_quality(path, visualize=False)
    print(json.dumps(result))   # ✅ Node.js can parse this
