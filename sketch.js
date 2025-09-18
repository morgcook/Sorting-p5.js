let values;
let monoSynth;
let colors;

var sortType;

var sortSelected = false;
var idle = true;

var validSorts = ['h', 'q', 'b', 's', 'i', 'c']

let level;
let bogoNum = 0;

let wait = 0;

let states;

let n = 100;
var w;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  console.log(`Please input the character corresponding to the desired
sorting algorithm:

  HEAPSORT = 'h'
  QUICKSORT = 'q'
  BUBBLESORT = 'b'
  SELECTION SORT = 's'
  INSERTION SORT = 'i'
  CUBESORT = 'c'\n\n`);

  values = new Array(n);
  states = new Array(values.length);
  colors = new Array(ceil(Math.log2(n)));
  w = width / n;
  
  monoSynth = new p5.MonoSynth();

  for (let i = 0; i < values.length; i++) {
    values[i] = (i) * (height / values.length);
    states[i] = -1;
  }

  for (let i = values.length - 1; i >= 0; i--) {
    syncSwap(values, i, floor(random(i)));
  }
  
  for (let i = 0; i < colors.length; i++) {
    colors[i] = {r: random(255), g: random(255), b: random(255)};
  }
  
  level = values.length;
}

async function sortArray(arr, iteration) {
  if (sortType == 'h') {
    await heapSort(arr);
  } else if (sortType == 'q') {
    await quicksort(arr, 0, arr.length - 1);
  } else if (sortType == 'm') {
    await mergeSort(arr, 0, arr.length - 1);
  } else if (sortType == 'b') {
    if (iteration < arr.length) {
      await bubbleSort(arr, iteration);
      await sortArray(arr, iteration + 1);
      return
    }
  } else if (sortType == 's') {
    if (iteration < arr.length) {
      await selectionSort(arr, iteration);
      await sortArray(arr, iteration + 1);
      return;
    }
  } else if (sortType == 'i') {
    if (iteration < arr.length) {
      await insertionSort(arr, iteration);
      await sortArray(arr, iteration + 1);
      return
    }
  } else if (sortType == 'bogo') {
    await bogoSort(arr);
    console.log(bogoNum);
  } else if (sortType == 'c') {
    await cubeSort(arr, 0, arr.length - 1);
  }
  await completion(arr);
}

function draw() {
  background(28);
  
  for (let i = 0; i < values.length; i++) {
    if (w < 3) noStroke();
    if (sortType != 'h' || idle) {
      if (states[i] == -1) {
        fill(255);
      } else if (states[i] == 0) {
        fill(0, 0, 255);
      } else if (states[i] == 1) {
        fill(255, 0, 0);
      } else if (states[i] == 2) {
        fill(0, 255, 0);
      }
    } else {
      if (i < level) {
        let color = colors[floor(Math.log2(i + 1))];
        fill(color.r, color.g, color.b);
      } else {
        fill(255);
      }
    }
    // let color = map(values[i], 0, height, 0, 360);
    // fill(color, 255, 255);
    rect(i * w, height - values[i], w, values[i]);
  }
}

async function bubbleSort(arr, iteration) {
  for (let j = 0; j < values.length - iteration - 1; j++) {
    states[j] = 0;
    let freq = map(values[j + 1], 0, height, 164.81, 659.25);
    monoSynth.play(freq, 0.1, 0, 0.001);
    if (values[j] > values[j + 1]) {
      await swap(arr, j, j + 1);
    }
    states[j] = -1;
  }
}

async function selectionSort(arr, iteration) {
  if (iteration < values.length - 1) {
    let minIndex = iteration;
    for (let j = iteration + 1; j < values.length; j++) {
      states[j] = 0;
      let freq = map(values[j], 0, height, 164.81, 659.25);
      monoSynth.play(freq, 0.1, 0, 0.001);
      
      await sleep(2);
      if (values[j] < values[minIndex]) {
        states[minIndex] = -1;
        minIndex = j;
        states[minIndex] = 1;
      } else {
        states[j] = -1;
      }
    }
    await swap(arr, iteration, minIndex);
    states[minIndex] = -1;
  }
}



async function insertionSort(arr, iteration) {
  if (iteration > 0) {
    let val = arr[iteration];
    let j = iteration - 1;

    while (j >= 0 && arr[j] > val) {
      states[j + 1] = 0;
      let freq = map(values[j], 0, height, 164.81, 659.25);
      monoSynth.play(freq, 0.1, 0, 0.001);
      await swap(arr, j, j + 1);
      states[j + 1] = -1;
      j = j - 1;
    }
  }
}

// QUICK SORT

async function quicksort(arr, start, end) {
  if (start >= end) return;

  let index = await partition(arr, start, end);
  states[index] = -1;

  await Promise.all([
    quicksort(arr, start, index - 1),
    quicksort(arr, index + 1, end),
  ]);
}

async function partition(arr, start, end) {
  for (let i = start; i < end; i++) {
    states[i] = 1;
  }

  let pivot = arr[end];
  let pivotIndex = start;
  states[pivotIndex] = 0;

  for (let i = start; i < end; i++) {
    if (arr[i] <= pivot) {
      await swap(arr, i, pivotIndex);
      states[pivotIndex] = -1;
      pivotIndex++;
      states[pivotIndex] = 0;
    }
  }

  await swap(arr, pivotIndex, end);
  return pivotIndex;
}

// MERGE SORT

async function mergeSort(arr, start, end) {
  if (start >= end) return;

  let mid = start + floor((end - start) / 2);

  await Promise.all([mergeSort(arr, start, mid), mergeSort(arr, mid + 1, end)]);
  await merge(arr, start, mid, end);
}

async function merge(arr, start, mid, end) {
  let n1 = mid - start + 1;
  let n2 = end - mid;

  let left = new Array(n1);
  let right = new Array(n2);

  for (let i = 0; i < n1; i++) left[i] = arr[start + i];
  for (let j = 0; j < n2; j++) right[j] = arr[mid + 1 + j];

  let i = 0;
  let j = 0;
  let k = start;

  while (i < n1 && j < n2) {
    await sleep(wait);
    if (left[i] <= right[j]) {
      arr[k] = left[i];
      i++;
    } else {
      arr[k] = right[j];
      j++;
    }
    k++;
  }

  while (i < n1) {
    arr[k] = left[i];
    i++;
    k++;
  }

  while (j < n2) {
    arr[k] = right[j];
    j++;
    k++;
  }
}

// HEAP SORT

async function heapSort(arr) {
  let n = arr.length;
  
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(arr, n, i);
  }

  level--;
  for (let i = n - 1; i > 0; i--) {
    await swap(arr, 0, i);
    await heapify(arr, i, 0);
    level--;
  }
}

async function heapify(arr, n, i) {
  let largest = i;
  
  let l = 2 * i + 1;
  let r = 2 * i + 2;
  
  if (l < n && arr[l] > arr[largest]) largest = l;
  if (r < n && arr[r] > arr[largest]) largest = r;
  
  if (largest != i) {
    await swap(arr, i, largest);
    await heapify(arr, n, largest);
  }
}

// BOGO SORT

async function bogoSort(arr) {
  while (!isSorted(arr)) {
    reshuffle(arr);
    bogoNum++;
    await sleep(wait);
  }
}

function reshuffle(arr) {
  for (let i = values.length - 1; i >= 0; i--) {
    syncSwap(values, i, floor(random(i)));
  }
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

// CUBE SORT

async function cubeSort(arr, start, end) {
  if (start >= end) return;
  let pivot = arr[floor((start + end) / 2)];

  let i = start;
  let j = end;
  while (i <= j) {
    while (arr[i] < pivot) i++;
    while (arr[j] > pivot) j--;

    if (i <= j) {
      await swap(arr, i, j);
      i++;
      j--;
    }
  }

  await Promise.all([
    cubeSort(arr, start, j),
    cubeSort(arr, i, end)
  ]);
}

// ~ OTHER STUFF ~

async function completion(arr) {
  idle = true;
  for (let i = 0; i < arr.length; i++) {
    let freq = map(values[i], 0, height, 164.81, 659.25);
    monoSynth.play(freq, 0.1, 0, 0.01);
    await sleep(10);
    states[i] = 2;
  }
  await reset(arr);
  sortSelected = false;
}

async function reset(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    await swap(arr, i, floor(random(i)));
    states[i] = -1
  }
  states[0] = -1
}

async function swap(arr, a, b) {
  await sleep(wait);

  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function syncSwap(arr, a, b) {
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function keyPressed() {
  if (!sortSelected) {
    if (validSorts.indexOf(key) != -1) {
      idle = false;
      level = values.length;
      sortType = key;
      sortArray(values, 0);
    }
  }
}
