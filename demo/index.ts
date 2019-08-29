/* Copyright 2019 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import * as fmnist from './data/projection.json';
import {Points, Dataset, PointMetadata} from '../src/data';
import {ScatterGL, RenderMode} from '../src';

const dataPoints: Points = [];
const metadata: PointMetadata[] = [];
fmnist.projection.forEach((vector: number[], index) => {
  const labelIndex = fmnist.labels[index];
  dataPoints.push(vector);
  metadata.push({
    labelIndex,
    label: fmnist.label_names[labelIndex],
  });
});

const nDimensions = 3;
const dataset = new Dataset(dataPoints, nDimensions, metadata);

dataset.setSpriteMetadata({
  spriteImage: 'spritesheet.png',
  singleSpriteSize: [28, 28],
});

let lastSelectedPoints: number[] = [];

const containerElement = document.getElementById('container')!;
const messagesElement = document.getElementById('messages')!;

const scatterGL = new ScatterGL(containerElement, dataset, {
  onHover: (point: number | null) => {
    const message = `🔥hover ${point}`;
    console.log(message);
    messagesElement.innerHTML = message;
  },
  onSelect: (points: number[]) => {
    let message = '';
    if (points.length === 0 && lastSelectedPoints.length === 0) {
      message = '🔥 no selection';
    } else if (points.length === 0 && lastSelectedPoints.length > 0) {
      message = '🔥 deselected';
    } else if (points.length === 1) {
      message = `🔥 selected ${points}`;
    } else {
      message = `🔥selected ${points.length} points`;
    }
    console.log(message);
    messagesElement.innerHTML = message;
  },
  renderMode: RenderMode.POINT,
});

document
  .querySelectorAll<HTMLInputElement>('input[name="interactions"]')
  .forEach(inputElement => {
    inputElement.addEventListener('change', () => {
      if (inputElement.value === 'pan') {
        scatterGL.setPanMode();
      } else if (inputElement.value === 'select') {
        scatterGL.setSelectMode();
      }
    });
  });

document
  .querySelectorAll<HTMLInputElement>('input[name="render"]')
  .forEach(inputElement => {
    inputElement.addEventListener('change', () => {
      if (inputElement.value === 'points') {
        scatterGL.setPointRenderMode();
      } else if (inputElement.value === 'sprites') {
        scatterGL.setSpriteRenderMode();
      } else if (inputElement.value === 'text') {
        scatterGL.setTextRenderMode();
      }
    });
  });

const colorsByLabel = [...new Array(10)].map((_, i) => {
  const hue = Math.floor((255 / 10) * i);
  return `hsl(${hue}, 100%, 50%)`;
});

document
  .querySelectorAll<HTMLInputElement>('input[name="color"]')
  .forEach(inputElement => {
    inputElement.addEventListener('change', () => {
      if (inputElement.value === 'default') {
        scatterGL.setPointColorer(null);
      } else if (inputElement.value === 'label') {
        scatterGL.setPointColorer(i => {
          const labelIndex = dataset.metadata![i].labelIndex as number;
          return colorsByLabel[labelIndex];
        });
      }
    });
  });

const dimensionsToggle = document.querySelector<HTMLInputElement>(
  'input[name="3D"]'
)!;
dimensionsToggle.addEventListener('change', (e: any) => {
  const is3D = dimensionsToggle.checked;
  scatterGL.setDimensions(is3D ? 3 : 2);
});
