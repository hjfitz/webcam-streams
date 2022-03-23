import React, { useEffect, useRef } from "react";
import { render } from "react-dom";

enum Filters {
  Invert = "invert",
  Ukraine = "ukraine",
}

type FilterFunc = (f: ImageData) => ImageData;

class FilterState {
  private filterName = Filters.Invert;

  get filter(): FilterFunc {
    switch (this.filterName) {
      case Filters.Invert: {
        return Filter.invert;
      }
      case Filters.Ukraine: {
        return Filter.ukraine;
      }
      default: {
        return Filter.noop;
      }
    }
  }

  setState(newState: Filters) {
    this.filterName = newState;
  }
}

class Filter {
  static invert(frame: ImageData) {
    const { data } = frame;
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i + 0];
      const green = data[i + 1];
      const blue = data[i + 2];
      data[i] = 255 - red;
      data[i + 1] = 255 - green;
      data[i + 2] = 255 - blue;
    }
    return frame;
  }

  static ukraine(frame: ImageData) {
    const { data } = frame;
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i + 0];
      const green = data[i + 1];
      const blue = data[i + 2];
      data[i] = green;
      data[i + 1] = red;
      data[i + 2] = 255 - blue;
    }
    return frame;
  }

  static noop(frame: ImageData) {
    return frame;
  }
}

class Processor {
  private readonly filterState = new FilterState();
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
    const newFrame = this.filterState.filter(frame);
    ctx2.putImageData(newFrame, 0, 0);
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
