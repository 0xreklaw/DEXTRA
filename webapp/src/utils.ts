import { drawConnectors } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { LandmarkInterface } from "./types";

export function scaleLandmark(
  landmark: LandmarkInterface,
  canvasWidth: number,
  canvasHeight: number
) {
  const x = Math.max(
    0,
    Math.min(landmark["x"] * canvasWidth, canvasWidth)
  );
  const y = Math.max(
    0,
    Math.min(landmark["y"] * canvasHeight, canvasHeight)
  );

  return {
    x,
    y,
  };
}

export function normalizeLandmark(
  landmark: LandmarkInterface,
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number
) {
  const xNormalized = Math.min(landmark["x"] / videoWidth);
  const yNormalized = Math.min(landmark["y"] / videoHeight);

  const x = Math.max(
    0,
    Math.min(xNormalized * canvasWidth, canvasWidth)
  );
  const y = Math.max(
    0,
    Math.min(yNormalized * canvasHeight, canvasHeight)
  );

  return {
    x,
    y,
  };
}

// determine if the hand is front or back facing
export function handOrientation(
  handedness: "Left" | "Right",
  pinkyPosition: { x: number; y: number },
  thumbPosition: { x: number; y: number }
): "Back" | "Front" {
  if (handedness === "Left") {
    return pinkyPosition.x < thumbPosition.x
      ? "Back"
      : "Front";
  } else if (handedness === "Right") {
    return thumbPosition.x > pinkyPosition.x
      ? "Back"
      : "Front";
  }
  // default return in case handedness is neither "Left" nor "Right"
  return null;
}

export function calculateFingerValues(
  fingerLandmarks: { x: number; y: number }[],
  fingerName: string
) {
  let maxDistance = 0;
  let minDistance = Number.MAX_VALUE;
  let currentDistance = 0;

  for (let i = 0; i < fingerLandmarks.length - 1; i++) {
    const currentPoint = fingerLandmarks[i];
    const nextPoint = fingerLandmarks[i + 1];

    const distance = Math.sqrt(
      Math.pow(nextPoint.x - currentPoint.x, 2) +
        Math.pow(nextPoint.y - currentPoint.y, 2)
    );

    currentDistance += distance;
    maxDistance = Math.max(maxDistance, distance);
    minDistance = Math.min(minDistance, distance);
  }

  const averageDistance = currentDistance / (fingerLandmarks.length - 1);

  console.log(`${fingerName} Finger Values:`);
  console.log(`- Current Distance: ${currentDistance}`);
  console.log(`- Max Distance: ${maxDistance}`);
  console.log(`- Min Distance: ${minDistance}`);
  console.log(`- Average Distance: ${averageDistance}`);
}

export function convertDepthToMillimeters(
  relativeDepth: number,
  minDepth: number,
  scale: number
): number {
  // Add an offset to make all depth values positive
  const absoluteDepth = relativeDepth - minDepth;

  // Convert the depth value to millimeters using a scale factor
  const depthInMillimeters = absoluteDepth * scale;

  return depthInMillimeters;
}

export function drawLandmarkLink(
  ref: CanvasRenderingContext2D,
  terminalLandmark: { x: number; y: number },
  endLandmark: { x: number; y: number }
) {
  drawConnectors(ref, [terminalLandmark, endLandmark], HAND_CONNECTIONS, {
    color: "#00FF00",
    // color: isRightHand ? "#00FF00" : "#FF0000",
  });
}
let maxDistance = 0;
let minDistance = Number.MAX_SAFE_INTEGER; // If you also want to account for minimum distance normalization

export function updateMaxDistance(newDistance: number) {
    if (newDistance > maxDistance) {
        maxDistance = newDistance;
    }
    if (newDistance < minDistance) {
        minDistance = newDistance;
    }
}

export function normalizeDistance(distance: number): number {
    // This will normalize based on the dynamic range observed
    return (distance - minDistance) / (maxDistance - minDistance);
}


export function getAbsoluteDistanceBetweenPoints(
  coordinateOne: { x: number; y: number },
  coordinateTwo: { x: number; y: number }
) {
  const deltaX = (coordinateTwo.x = coordinateOne.x);
  const deltaY = (coordinateTwo.y = coordinateOne.y);
  const distance =  Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  updateMaxDistance(distance);  // Update the max distance whenever a new distance is calculated
  return distance;
}

export function sendSocketData(connection, data: any) {
  if (connection.readyState === WebSocket.OPEN) {
    connection.send(JSON.stringify(data));
} else {
    console.error('WebSocket is not open.');
}
}

// const relativeDepth = landmarks[3].z; // Example relative depth value
// console.log(relativeDepth)
// const minDepth = -0.12
// const scale = 1000; // Example scale factor to convert depth to millimeters

// const depthInMillimeters = convertDepthToMillimeters(
//   relativeDepth,
//   minDepth,
//   scale
// );
// console.log("Depth in millimeters:", depthInMillimeters);
