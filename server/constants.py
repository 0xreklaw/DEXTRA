from utils import get_ip_address

# Server Configuration
PORT = 8080
IP_ADDRESS = get_ip_address()
URL = f"{IP_ADDRESS}:{PORT}"

# Servo Configuration
N_SERVO_PINS = 16
SERVO_ANGLE_RANGE = {"max": 160, "min": 0}  # in degrees

# Pin Mapping for Servos by Finger Functions
SERVO_MAPPING = {
    "thumb": {"pitch": 0, "yaw_left": 1, "yaw_right": 2},
    "index": {"pitch": 3, "yaw_left": 4, "yaw_right": 5},
    "middle": {"pitch": 6, "yaw_left": 7, "yaw_right": 8},
    "ring": {"pitch": 9, "yaw_left": 10, "yaw_right": 11},
    "pinky": {"pitch": 12, "yaw_left": 13, "yaw_right": 14},
    "wrist": {"pitch": 15}
}

