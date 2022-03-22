import React, { useEffect, useRef } from "react";
import { render } from "react-dom";
import socket, { Socket } from "socket.io-client";

interface Dimensions {
  height: number;
  width: number;
}

function streamFrame(
  cvs: HTMLCanvasElement,
  io: Socket,
  video: HTMLVideoElement,
  { width, height }: Dimensions
): void {
  const ctx = cvs.getContext("2d");
  ctx.drawImage(video, 0, 0, width, height);
  const encodedImage = cvs.toDataURL("image/png");
  io.emit("frame", encodedImage);
  requestAnimationFrame(() => streamFrame(cvs, io, video, { width, height }));
}

const App = () => {
  const vid = useRef<HTMLVideoElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const io = useRef(socket());
  useEffect(() => {
    if (!vid || !cvs) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = vid.current;
      const ctx = cvs.current.getContext("2d");

      vid.current.srcObject = stream;
      vid.current.play();
      vid.current.addEventListener("playing", () => {
        const { height, width } = video.getBoundingClientRect();
        cvs.current.height = height;
        cvs.current.width = width;
        streamFrame(cvs.current, io.current, video, { width, height });
      });
    });
  }, [vid, cvs]);
  return (
    <section>
      <h1>Webcam bits</h1>
      <video ref={vid} />
      <canvas id="cnv1" ref={cvs} />
    </section>
  );
};

const entry = document.getElementById("react-root");

render(<App />, entry);
