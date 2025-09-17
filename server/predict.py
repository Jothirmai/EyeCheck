import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import traceback

def log(msg):
    """Send logs to stderr (Node.js can capture them)"""
    print(f"[LOG] {msg}", file=sys.stderr, flush=True)

# Ensure correct arguments
if len(sys.argv) < 3:
    log("ERROR: Need 2 image paths (left & right)")
    print(json.dumps({"error": "Need 2 image paths (left & right)"}))
    sys.exit(1)

left_img_path = sys.argv[1]
right_img_path = sys.argv[2]

# Load model (only once per process)
MODEL_PATH = "cataract_model.h5"
try:
    model = load_model(MODEL_PATH)
    log(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    log(f"ERROR: Failed to load model: {str(e)}")
    print(json.dumps({"error": f"Failed to load model: {str(e)}"}))
    sys.exit(1)

def preprocess(img_path):
    """Load and preprocess an image for prediction"""
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # shape (1,224,224,3)
        img_array = img_array / 255.0
        log(f"Image loaded: {img_path}, shape: {img_array.shape}")
        return img_array
    except Exception as e:
        log(f"ERROR preprocessing image {img_path}: {str(e)}")
        raise

def predict_eye(img_path):
    """Run prediction on a single eye image"""
    try:
        img_array = preprocess(img_path)
        pred = model.predict(img_array)
        log(f"Raw prediction for {img_path}: {pred}")
        # Binary classification threshold
        return "Normal" if pred[0][0] >= 0.5 else "Cataract"
    except Exception as e:
        log(f"ERROR predicting image {img_path}: {str(e)}")
        return f"Error: {str(e)}"

def main():
    try:
        left_result = predict_eye(left_img_path)
        right_result = predict_eye(right_img_path)

        log(f"Left Eye Prediction: {left_result}")
        log(f"Right Eye Prediction: {right_result}")

        output = {
            "left_eye": left_result,
            "right_eye": right_result
        }

        # Output only JSON to stdout
        print(json.dumps(output))
    
    except Exception as e:
        log("Unhandled exception in prediction:")
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
