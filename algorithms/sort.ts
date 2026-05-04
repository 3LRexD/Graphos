// algorithms/sort.ts

export type SortAlgorithm = "selection" | "insertion" | "merge" | "shell";

export interface SortInput {
  values: number[];
  algorithm: SortAlgorithm;
}

export interface SortStep {
  iteration: number;
  array: number[];
  comparing: number[];   // indices being compared
  swapping: number[];    // indices being swapped
  sorted: number[];      // indices confirmed sorted
  pivot?: number;        // pivot index (quicksort/not used here but kept for type compat)
  description: string;
}

export interface SortResult {
  error: false;
  algorithm: SortAlgorithm;
  algorithmName: string;
  original: number[];
  sorted: number[];
  steps: SortStep[];
  totalComparisons: number;
  totalSwaps: number;
}

export type SortError =
  | { error: true; reason: "empty" }
  | { error: true; reason: "too_large" }
  | { error: true; reason: "invalid_values" };

export type SortOutput = SortResult | SortError;

const ALGORITHM_NAMES: Record<SortAlgorithm, string> = {
  selection: "Selection Sort",
  insertion: "Insertion Sort",
  merge:     "Merge Sort",
  shell:     "Shell Sort",
};

export function computeSort(input: SortInput): SortOutput {
  const { values, algorithm } = input;

  if (!values.length) return { error: true, reason: "empty" };
  if (values.length > 30) return { error: true, reason: "too_large" };
  if (values.some(v => !isFinite(v))) return { error: true, reason: "invalid_values" };

  const steps: SortStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  const arr = [...values];

  const snap = (
    array: number[],
    comparing: number[],
    swapping: number[],
    sorted: number[],
    description: string,
    pivot?: number
  ): void => {
    steps.push({
      iteration: steps.length + 1,
      array: [...array],
      comparing,
      swapping,
      sorted: [...sorted],
      pivot,
      description,
    });
  };

  if (algorithm === "selection") {
    const sortedSet: number[] = [];
    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < arr.length; j++) {
        comparisons++;
        snap(arr, [minIdx, j], [], sortedSet, `Buscando mínimo: comparar índice ${minIdx} (${arr[minIdx]}) con índice ${j} (${arr[j]})`);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        swaps++;
        snap(arr, [], [i, minIdx], sortedSet, `Intercambiar mínimo ${arr[minIdx]} a posición ${i}`);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      }
      sortedSet.push(i);
      snap(arr, [], [], [...sortedSet], `Posición ${i} fija con valor ${arr[i]}`);
    }
    sortedSet.push(arr.length - 1);
    snap(arr, [], [], Array.from({ length: arr.length }, (_, i) => i), "¡Arreglo ordenado!");
  }

  else if (algorithm === "insertion") {
    const sortedSet: number[] = [0];
    snap(arr, [], [], [...sortedSet], `El primer elemento (${arr[0]}) ya está ordenado`);
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      snap(arr, [i], [], [...sortedSet], `Tomar elemento ${key} para insertar en posición correcta`);
      while (j >= 0 && arr[j] > key) {
        comparisons++;
        snap(arr, [j, j + 1], [], [...sortedSet], `Comparar ${arr[j]} > ${key}, desplazar a la derecha`);
        arr[j + 1] = arr[j];
        swaps++;
        snap(arr, [], [j, j + 1], [...sortedSet], `Desplazar ${arr[j + 1]} a posición ${j + 1}`);
        j--;
      }
      if (j >= 0) comparisons++; // For the last comparison that fails the while loop condition
      arr[j + 1] = key;
      sortedSet.push(i);
      snap(arr, [], [], [...sortedSet], `Insertar ${key} en posición ${j + 1}`);
    }
    snap(arr, [], [], Array.from({ length: arr.length }, (_, i) => i), "¡Arreglo ordenado!");
  }

  else if (algorithm === "merge") {
    const sortedSet: number[] = [];
    const mergeSort = (a: number[], left: number, right: number) => {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      mergeSort(a, left, mid);
      mergeSort(a, mid + 1, right);

      const leftArr = a.slice(left, mid + 1);
      const rightArr = a.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      snap(a, Array.from({ length: right - left + 1 }, (_, x) => left + x), [], sortedSet,
        `Uniendo sublistas [${leftArr}] y [${rightArr}]`);

      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        if (leftArr[i] <= rightArr[j]) {
          a[k++] = leftArr[i++];
        } else {
          a[k++] = rightArr[j++];
          swaps++;
        }
      }
      while (i < leftArr.length) a[k++] = leftArr[i++];
      while (j < rightArr.length) a[k++] = rightArr[j++];

      snap(a, [], Array.from({ length: right - left + 1 }, (_, x) => left + x), sortedSet,
        `Sublista fusionada: [${a.slice(left, right + 1)}]`);
    };
    mergeSort(arr, 0, arr.length - 1);
    snap(arr, [], [], Array.from({ length: arr.length }, (_, i) => i), "¡Arreglo ordenado!");
  }

  else if (algorithm === "shell") {
    const sortedSet: number[] = [];
    for (let gap = Math.floor(arr.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < arr.length; i++) {
        let temp = arr[i];
        let j;
        snap(arr, [i], [], [...sortedSet], `Brecha ${gap}: tomar elemento ${temp}`);
        for (j = i; j >= gap; j -= gap) {
          comparisons++;
          snap(arr, [j - gap, i], [], [...sortedSet], `Comparar ${arr[j - gap]} con ${temp} (Brecha ${gap})`);
          if (arr[j - gap] > temp) {
            arr[j] = arr[j - gap];
            swaps++;
            snap(arr, [], [j, j - gap], [...sortedSet], `Desplazar ${arr[j - gap]} a la derecha`);
          } else {
            break;
          }
        }
        arr[j] = temp;
        snap(arr, [], [], [...sortedSet], `Insertar ${temp} en posición ${j}`);
      }
    }
    snap(arr, [], [], Array.from({ length: arr.length }, (_, i) => i), "¡Arreglo ordenado!");
  }

  return {
    error: false,
    algorithm,
    algorithmName: ALGORITHM_NAMES[algorithm],
    original: [...values],
    sorted: [...arr],
    steps,
    totalComparisons: comparisons,
    totalSwaps: swaps,
  };
}