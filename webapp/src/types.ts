export interface LandmarkInterface {
  x: number;
  y: number;
  z: number;
}

type FingerType = "thumb" | "index" | "middle" | "ring" | "pinky";

export interface FingerInterface {
  finger: FingerType;
  angle: {
    pitch: number;
    yaw: {
      left: number;
      right: number;
    };
  };
}
