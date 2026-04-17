<template>
  <div class="flex flex-col items-center">
    <div
      class="relative border-4 border-gray-700 bg-black rounded-lg overflow-hidden touch-none"
      ref="canvasContainer"
    >
      <canvas
        ref="canvasRef"
        :width="width"
        :height="height"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawingTouch"
        @touchmove="drawTouch"
        @touchend="stopDrawing"
      ></canvas>
    </div>
    <div class="flex gap-4 mt-4">
      <button
        @click="clearCanvas"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
      >
        Clear
      </button>
      <button
        @click="submitImage"
        class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  width: { type: Number, default: 280 },
  height: { type: Number, default: 280 },
  lineWidth: { type: Number, default: 18 } // Thick stroke for better AI visibility
});

const emit = defineEmits(['submit']);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let isDrawing = false;

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      clearCanvas();
    }
  }
});

const clearCanvas = () => {
  if (ctx && canvasRef.value) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
};

const getCoordinates = (e: MouseEvent | TouchEvent) => {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  let clientX, clientY;

  if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else if (window.TouchEvent && e instanceof TouchEvent && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    return { x: 0, y: 0 }; 
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
};

const startDrawingBase = (x: number, y: number) => {
  isDrawing = true;
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = props.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Draw a dot even if there is no movement
    ctx.lineTo(x, y);
    ctx.stroke();
  }
};

const startDrawing = (e: MouseEvent) => {
  const { x, y } = getCoordinates(e);
  startDrawingBase(x, y);
};

const startDrawingTouch = (e: TouchEvent) => {
  e.preventDefault(); // Prevent scrolling while drawing
  const { x, y } = getCoordinates(e);
  startDrawingBase(x, y);
};

const drawBase = (x: number, y: number) => {
  if (!isDrawing || !ctx) return;
  ctx.lineTo(x, y);
  ctx.stroke();
};

const draw = (e: MouseEvent) => {
  if (!isDrawing) return;
  const { x, y } = getCoordinates(e);
  drawBase(x, y);
};

const drawTouch = (e: TouchEvent) => {
  if (!isDrawing) return;
  e.preventDefault();
  const { x, y } = getCoordinates(e);
  drawBase(x, y);
};

const stopDrawing = () => {
  isDrawing = false;
  if (ctx) ctx.beginPath();
};

const submitImage = () => {
  if (canvasRef.value) {
    const base64Image = canvasRef.value.toDataURL('image/png');
    emit('submit', base64Image);
  }
};
</script>
