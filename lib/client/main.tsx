import React, { useEffect, useRef } from "react";
import { render } from "react-dom";

class Processor {
  constructor(
    private readonly video: HTMLVideoElement,
    private readonly cvs: HTMLCanvasElement,
    private readonly cvs2: HTMLCanvasElement
  ) {
    this.setCanvasDimensions();
    this.timerCallback();
  }

  private setCanvasDimensions() {
    console.log(this.video.getBoundingClientRect());
    const { height, width } = this.video.getBoundingClientRect();
    for (const c of [this.cvs, this.cvs2]) {
      c.height = height;
      c.width = width;
    }
  }

  private timerCallback() {
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    requestAnimationFrame(() => this.timerCallback());
  }

  private computeFrame() {
    const ctx1 = this.cvs.getContext("2d");
    const ctx2 = this.cvs2.getContext("2d");
    const { height, width } = this.video.getBoundingClientRect();

    ctx1.drawImage(this.video, 0, 0, width, height);

    const frame = ctx1.getImageData(0, 0, width, height);
    const length = frame.data.length;
    const data = frame.data;

    for (let i = 0; i < length; i += 4) {
      const red = data[i + 0];
      const green = data[i + 1];
      const blue = data[i + 2];
      data[i] = green;
      data[i + 1] = red;
      data[i + 2] = 255 - blue;
      //if (green > 100 && red > 100 && blue < 43) {
      //if (green > 170 && red > 170 && blue > 170) {
      //data[i + 3] = 0;
      // data[i] = 0;
      //}
    }
    ctx2.putImageData(frame, 0, 0);
  }
}

const App = () => {
  const vid = useRef<HTMLVideoElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const cv2 = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!vid) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      vid.current.srcObject = stream;
      vid.current.play();
      vid.current.addEventListener("playing", () => {
        const processor = new Processor(vid.current, cvs.current, cv2.current);
        console.log(processor);
      });
    });
  }, [vid, cvs]);
  return (
    <section>
      <h1>Webcam bits</h1>
      <video ref={vid} />
      <canvas ref={cvs} />
      <canvas ref={cv2} />
    </section>
  );
};

const entry = document.getElementById("react-root");

render(<App />, entry);
