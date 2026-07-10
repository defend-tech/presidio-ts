import type { ImagePixel, ImageSource } from "../entities.js";

type CanvasLike = HTMLCanvasElement | OffscreenCanvas;
type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** Canvas-backed image transformations usable in browsers and Node with optional `canvas`. */
export class ImageProcessingEngine {
  static async createCanvas(width: number, height: number): Promise<CanvasLike> {
    if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }
    // Avoid a hard Node dependency: load `canvas` only in Node environments that provide it.
    const loadCanvas = new Function("return import('canvas')") as () => Promise<{ createCanvas: (w: number, h: number) => CanvasLike }>;
    return (await loadCanvas()).createCanvas(width, height);
  }

  static async toCanvas(image: ImageSource): Promise<CanvasLike> {
    if (isCanvas(image)) return image;
    const source = isImageSource(image) ? image : await this.loadImage(image);
    const { width, height } = dimensions(source);
    const canvas = await this.createCanvas(width, height);
    this.context(canvas).drawImage(source, 0, 0);
    return canvas;
  }

  static async greyscale(image: ImageSource): Promise<CanvasLike> {
    const canvas = await this.toCanvas(image);
    const context = this.context(canvas);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const value = Math.round(0.299 * pixels.data[index] + 0.587 * pixels.data[index + 1] + 0.114 * pixels.data[index + 2]);
      pixels.data[index] = value;
      pixels.data[index + 1] = value;
      pixels.data[index + 2] = value;
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  }

  static async blur(image: ImageSource, radius = 2): Promise<CanvasLike> {
    const source = await this.toCanvas(image);
    const canvas = await this.createCanvas(source.width, source.height);
    const context = this.context(canvas);
    context.filter = `blur(${Math.max(0, radius)}px)`;
    context.drawImage(source, 0, 0);
    context.filter = "none";
    return canvas;
  }

  static async threshold(image: ImageSource, value = 128): Promise<CanvasLike> {
    const canvas = await this.greyscale(image);
    const context = this.context(canvas);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const color = pixels.data[index] >= value ? 255 : 0;
      pixels.data[index] = color;
      pixels.data[index + 1] = color;
      pixels.data[index + 2] = color;
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  }

  static async resize(image: ImageSource, width: number, height: number): Promise<CanvasLike> {
    const source = await this.toCanvas(image);
    const canvas = await this.createCanvas(width, height);
    this.context(canvas).drawImage(source, 0, 0, width, height);
    return canvas;
  }

  static async rotate(image: ImageSource, degrees: number, background: string | ImagePixel = "transparent"): Promise<CanvasLike> {
    const source = await this.toCanvas(image);
    const radians = degrees * Math.PI / 180;
    const width = Math.ceil(Math.abs(source.width * Math.cos(radians)) + Math.abs(source.height * Math.sin(radians)));
    const height = Math.ceil(Math.abs(source.width * Math.sin(radians)) + Math.abs(source.height * Math.cos(radians)));
    const canvas = await this.createCanvas(width, height);
    const context = this.context(canvas);
    context.fillStyle = color(background);
    context.fillRect(0, 0, width, height);
    context.translate(width / 2, height / 2);
    context.rotate(radians);
    context.drawImage(source, -source.width / 2, -source.height / 2);
    return canvas;
  }

  static context(canvas: CanvasLike): Context {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("A 2D Canvas context is required");
    return context;
  }

  private static async loadImage(image: string | Blob | ArrayBuffer | Uint8Array): Promise<HTMLImageElement> {
    if (typeof Image === "undefined") throw new Error("Image loading requires a browser Image implementation or the optional canvas package");
    const url = typeof image === "string" ? image : URL.createObjectURL(image instanceof Blob ? image : bytesToBlob(image));
    try {
      const loaded = new Image();
      loaded.src = url;
      await loaded.decode();
      return loaded;
    } finally {
      if (typeof image !== "string") URL.revokeObjectURL(url);
    }
  }
}

function isCanvas(image: ImageSource): image is CanvasLike {
  return typeof image === "object" && image !== null && "getContext" in image && "width" in image && "height" in image;
}

function isImageSource(image: ImageSource): image is CanvasImageSource {
  return typeof image === "object" && image !== null && !(image instanceof Blob) && !(image instanceof ArrayBuffer) && !(image instanceof Uint8Array) && "width" in image && "height" in image;
}

function bytesToBlob(bytes: ArrayBuffer | Uint8Array): Blob {
  const copy = bytes instanceof ArrayBuffer ? bytes.slice(0) : bytes.slice().buffer as ArrayBuffer;
  return new Blob([copy]);
}

function dimensions(source: CanvasImageSource): { width: number; height: number } {
  if ("videoWidth" in source && source.videoWidth > 0) return { width: source.videoWidth, height: source.videoHeight };
  if ("displayWidth" in source) return { width: source.displayWidth, height: source.displayHeight };
  if ("width" in source && "height" in source) return { width: length(source.width), height: length(source.height) };
  throw new Error("Unable to determine image dimensions");
}

function length(value: number | SVGAnimatedLength): number {
  return typeof value === "number" ? value : value.baseVal.value;
}

function color(value: string | ImagePixel): string {
  return typeof value === "string" ? value : `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a ?? 255})`;
}
