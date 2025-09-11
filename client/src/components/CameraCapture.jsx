import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function CameraCapture({ onResult }) {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  };

  const uploadImage = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      // Convert base64 to Blob
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      form.append("image", blob, "capture.png");
      // POST to backend endpoint
      const resp = await axios.post("/api/quality-check", form);
      onResult(resp.data); // Pass backend analysis to parent
    } catch(e) {
      alert("Upload failed.");
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      {!imgSrc ? (
        <>
          <Webcam screenshotFormat="image/png" audio={false} ref={webcamRef} width={300} height={300} style={{ borderRadius: 12 }}/>
          <button onClick={capture} style={{ marginTop: 20 }}>Capture</button>
        </>
      ) : (
        <>
          <img src={imgSrc} alt="capture" width={300} style={{ borderRadius: 12 }}/>
          <button onClick={() => setImgSrc(null)} style={{ marginRight: 10 }}>Retake</button>
          <button onClick={uploadImage} disabled={loading}>{loading ? "Checking..." : "Check Image"}</button>
        </>
      )}
    </div>
  );
}
