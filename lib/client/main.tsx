import React, { useEffect, useRef } from "react";
import { render } from "react-dom";

const App = () => {
  const vid = useRef<HTMLVideoElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!vid) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      vid.current.srcObject = stream;
      vid.current.play();
    });
  }, [vid, cvs]);
  return (
    <section>
      <h1>Webcam bits</h1>
      <video ref={vid} />
      <canvas ref={cvs} />
    </section>
  );
};

const entry = document.getElementById("react-root");

render(<App />, entry);
