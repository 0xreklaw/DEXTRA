import { useEffect, useRef, useState } from "react";
import { Results, Hands, HAND_CONNECTIONS, VERSION } from "@mediapipe/hands";
import {
  drawConnectors,
  drawLandmarks,
  Data,
  lerp,
} from "@mediapipe/drawing_utils";
import {
  scaleLandmark,
  normalizeLandmark,
  handOrientation,
  calculateFingerValues,
  convertDepthToMillimeters,
  drawLandmarkLink,
  getAbsoluteDistanceBetweenPoints,
  normalizeDistance,
} from "../utils";
import { SERVER_PORT, PYTHON_SERVER } from "../constants";
import io from "socket.io-client";

const socket = io(PYTHON_SERVER);

const constraints = {
  video: { width: { min: 1280 }, height: { min: 720 } },
};

export default function CameraTracking() {
  const [testDist, setTestDist] = useState<number | null>(null);
  const testDistRef = useRef(testDist);

  useEffect(() => {
    testDistRef.current = testDist;
  }, [testDist]);

  useEffect(() => {
    const sendMessage = () => {
      if (testDistRef.current !== null) {
        socket.emit("message_from_client", testDistRef.current);
        console.log("Message sent every second to server", testDistRef.current);
      }
    };

    socket.on("connect", () => {
      const interval = setInterval(sendMessage, 1000);
      return () => clearInterval(interval);
    });

    return () => {
      socket.off("connect");
      socket.off("message_from_server");
    };
  }, []);

  // useEffect(() => {
  // if (testDist !== null) {
  //   console.log(testDist);
  // }
  // const sendMessage = () => {
  //   if (testDist !== null) {
  //     socket.emit("message_from_client", { data: testDist });
  //     console.log("Message sent every second to server", testDist);
  //   }
  // };

  // socket.on("connect", () => {
  //     console.log("Connected to server");
  //     const messageInterval = setInterval(sendMessage, 1000); // 1000 milliseconds = 1 second

  //     return () => {
  //       clearInterval(messageInterval);
  //     };
  //   });

  // return () => {
  //   socket.off("connect");
  //   socket.off("message_from_server");
  // };
  // }, []);

  // useEffect(() => {
  //   // Set up an interval to log the testDist value
  // const interval = setInterval(() => {
  //   console.log(testDistRef.current); // Log the current value of testDist
  // }, 1000); // Repeat every 5000 milliseconds (5 seconds)

  // // Cleanup function to clear the interval when the component unmounts
  // return () => clearInterval(interval);
  // }, []);

  const [inputVideoReady, setInputVideoReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const inputVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!inputVideoReady) {
      return;
    }
    if (inputVideoRef.current && canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d");
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        if (inputVideoRef.current) {
          inputVideoRef.current.srcObject = stream;
        }
        sendToMediaPipe();
      });

      const hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onResults);

      const sendToMediaPipe = async () => {
        if (inputVideoRef.current) {
          if (!inputVideoRef.current.videoWidth) {
            // console.log(inputVideoRef.current.videoWidth);
            requestAnimationFrame(sendToMediaPipe);
          } else {
            await hands.send({ image: inputVideoRef.current });
            requestAnimationFrame(sendToMediaPipe);
          }
        }
      };
    }
  }, [inputVideoReady]);

  const onResults = (results: Results) => {
    if (canvasRef.current && contextRef.current) {
      setLoaded(true);

      const videoWidth = inputVideoRef.current?.videoWidth || 0;
      const videoHeight = inputVideoRef.current?.videoHeight || 0;
      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;

      contextRef.current.save();
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      contextRef.current.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      if (results.multiHandLandmarks && results.multiHandedness) {
        for (
          let index = 0;
          index < results.multiHandLandmarks.length;
          index++
        ) {
          const landmarks = results.multiHandLandmarks[index];

          // const normalizedLandmarks = landmarks.map((landmark) =>
          //   normalizeLandmark(
          //     landmark,
          //     videoWidth,
          //     videoHeight,
          //     canvasWidth,
          //     canvasHeight
          //   )
          // );

          // const orientation = handOrientation(
          //   classification.label,
          //   thumbTip,
          //   pinkyTip
          // );

          // ---------------------------
          // draw
          // ---------------------------

          // linkages

          // drawLandmarkLink(contextRef.current, landmarks[0], landmarks[4]); // wrist to thumb
          drawLandmarkLink(contextRef.current, landmarks[0], landmarks[8]); // wrist to index finger
          // drawLandmarkLink(contextRef.current, landmarks[0], landmarks[12]); // wrist to middle finger
          // drawLandmarkLink(contextRef.current, landmarks[0], landmarks[16]); // wrist to ring finger
          // drawLandmarkLink(contextRef.current, landmarks[0], landmarks[20]); // wrist to pinky

          const middleFingerDistance = getAbsoluteDistanceBetweenPoints(
            landmarks[8],
            landmarks[0]
          );
          const normalizedDistance = normalizeDistance(middleFingerDistance);
          setTestDist(normalizedDistance);

          // draw landmarks dots
          // drawLandmarks(contextRef.current, landmarks, {
          //   color: isRightHand ? "#00FF00" : "#FF0000",
          //   fillColor: isRightHand ? "#FF0000" : "#00FF00",
          //   radius: (data: Data) => {
          //     return lerp(data.from!.z!, -0.15, 0.1, 10, 1);
          //   },
          // });
        }
      }
      contextRef.current.restore();
    }
  };

  return (
    <div className="hands-container" style={{ position: "relative" }}>
      <video
        autoPlay
        ref={(el) => {
          inputVideoRef.current = el;
          setInputVideoReady(!!el);
        }}
        style={{ width: "100%", height: "auto" }}
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      {!loaded && (
        <div className="loading">
          <div className="spinner"></div>
          <div className="message">Loading</div>
        </div>
      )}
    </div>
  );
}

// const thumbCmc = normalizedLandmarks[1];
// const thumbMcp = normalizedLandmarks[2];
// const thumbIp = normalizedLandmarks[3];
// const thumbTip = normalizedLandmarks[4];

// const indexFingerMcp = normalizedLandmarks[5];
// const indexFingerPip = normalizedLandmarks[6];
// const indexFingerDip = normalizedLandmarks[7];
// const indexFingerTip = normalizedLandmarks[8];

// const middleFingerMcp = normalizedLandmarks[9];
// const middleFingerPip = normalizedLandmarks[10];
// const middleFingerDip = normalizedLandmarks[11];
// const middleFingerTip = normalizedLandmarks[12];

// const ringFingerMcp = normalizedLandmarks[13];
// const ringFingerPip = normalizedLandmarks[14];
// const ringFingerDip = normalizedLandmarks[15];
// const ringFingerTip = normalizedLandmarks[16];

// const pinkyMcp = normalizedLandmarks[17];
// const pinkyPip = normalizedLandmarks[18];
// const pinkyDip = normalizedLandmarks[19];
// const pinkyTip = normalizedLandmarks[20];

// const wrist = normalizedLandmarks[0];

// ------------------------ BELOW ------------------------
// ------------------------ BELOW ------------------------
// ------------------------ BELOW ------------------------
// connection.onopen = () => {
//   console.log("WebSocket connection established.");

//   // Set up an interval to send the normalized distance every second
//   setInterval(() => {
//     const middleFingerDistance = getAbsoluteDistanceBetweenPoints(
//       landmarks[8].x,
//       landmarks[8].y,
//       landmarks[0].x,
//       landmarks[0].y
//     );
//     const normalizedDistance =
//       normalizeDistance(middleFingerDistance);
//     sendData(connection, { normalizedDistance });
//   }, 1000); // 1000 milliseconds = 1 second
// };

// connection.onerror = (error) => {
//   console.error("WebSocket error:", error);
// };

// connection.onclose = () => {
//   console.log("WebSocket connection closed.");
// };

// const scaledLandmarks = landmarks.map((landmark) =>
//   scaleLandmark(
//     landmark,
//     canvasWidth,
//     canvasHeight
//   )
// );

// Usage example
// const thumbValues = calculateFingerValues(
//   [thumbCmc, thumbMcp, thumbIp, thumbTip],
//   "Thumb"
// );

// console.log(thumbValues)

// let fingerValues = calculateFingerValues(
//   [indexFingerMcp, indexFingerPip, indexFingerDip, indexFingerTip],
//   "Index"
// );

// if (indexFingerKnuckle && indexFingerTip) {
//   const pinch_distance = Math.sqrt(
//     (indexFingerKnuckle.x - indexFingerTip.x) **
//       2 +
//       (indexFingerKnuckle.y -
//         indexFingerTip.y) **
//         2
//   );
//   console.log("Pinch Distance:", pinch_distance);
// }

// if (middleFingerKnuckle && middleFingerTip) {
//   const middleFingerDistance = Math.sqrt(
//     (middleFingerKnuckle.x -
//       middleFingerTip.x) **
//       2 +
//       (middleFingerKnuckle.y -
//         middleFingerTip.y) **
//         2
//   );
//   console.log("Middle Finger Distance:", middleFingerDistance);
// }

// if (ringFingerKnuckle && ringFingerTip) {
//   const ringFingerDistance = Math.sqrt(
//     (ringFingerKnuckle.x - ringFingerTip.x) **
//       2 +
//       (ringFingerKnuckle.y_coordinate - ringFingerTip.y_coordinate) **
//         2
//   );
//   console.log("Ring Finger Distance:", ringFingerDistance);
// }

// if (pinkyFingerKnuckle && pinkyFingerTip) {
//   const pinkyFingerDistance = Math.sqrt(
//     (pinkyFingerKnuckle.x - pinkyFingerTip.x) **
//       2 +
//       (pinkyFingerKnuckle.y -
//         pinkyFingerTip.y) **
//         2
//   );
//   console.log("Pinky Finger Distance:", pinkyFingerDistance);
// }
