from flask import Flask, Response, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from constants import IP_ADDRESS, PORT
import eventlet
import eventlet.wsgi
from models import ServoList
from collections import deque
from constants import SERVO_ANGLE_RANGE, N_SERVO_PINS
from adafruit_servokit import ServoKit
from classes import Hand


servo_kit = ServoKit(channels=N_SERVO_PINS) 
controller = Hand(servo_kit)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/api')
def index():
    return "DEXTRA python server"

landmark_history = deque([])

@socketio.on('message_from_client')
def handle_message(data):
    print('Servo Data:', data * SERVO_ANGLE_RANGE["max"])
    # simple smoothing avg
    if(len(landmark_history) >= 10):
        landmark_history.popleft()
        
    landmark_history.append(data)
    
    if len(landmark_history) > 0: 
        average = sum(landmark_history) / len(landmark_history)
        print('Smootheed Average Servo Angle:', average)
        controller.move_finger("middle", "pitch", average, delay=0.01)        
    
    # emit('message_from_server', {'data': 'This is a message from Flask!'})

# print(sum(landmark_history)/len(landmark_history))

if __name__ == '__main__':
    # Use eventlet to run the application
    socketio.run(app, host=IP_ADDRESS, port=PORT, debug=True)
