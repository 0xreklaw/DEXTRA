import os
import sys
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

from time import sleep
import threading
from adafruit_servokit import ServoKit
from constants import N_SERVO_PINS, SERVO_MAPPING
from classes import Hand


servo_kit = ServoKit(channels=N_SERVO_PINS) 
controller = Hand(servo_kit)

def set_all_finger_positions(orientation: str, angle: float):
    finger_keys = list(SERVO_MAPPING.keys())[:-1]
    for finger in finger_keys:
        controller.move_finger(finger, orientation, angle, delay=0.01)

    """
    
    Examples:
    
    palm_gesture = set_all_finger_positions("pitch", MIN_SERVO_ANGLE)
    fist_gesture = set_all_finger_positions("pitch", MAX_SERVO_ANGLE)
    
    """

# Pre-Programmed Gestures
def palm_gesture():
    set_all_finger_positions("pitch", MIN_SERVO_ANGLE)
    
def fist_gesture():
    set_all_finger_positions("pitch", MAX_SERVO_ANGLE)

def reset_joint_angles():
    set_all_finger_positions("pitch", MIN_SERVO_ANGLE)
    set_all_finger_positions("yaw_left", MIN_SERVO_ANGLE)
    set_all_finger_positions("yaw_right", MIN_SERVO_ANGLE)
    
def middle_finger(delay=0.01):
    pitch_angle = 180
    joint_movements = [
        # TODO ("thumb", "pitch", 45)
        ("index", "yaw_left", pitch_angle)
        ("ring", "yaw_right", pitch_angle)
        ("pinky", "yaw_right", pitch_angle)
    ]
        
    threads = []

    for finger, joint, angle in joint_movements:
        thread = threading.Thread(target=controller.move_finger, args=(finger, joint, angle, delay))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

def spock(delay=0.01):
    yaw_angle = 45.0
    joint_movements = [
        ("index", "yaw_left", yaw_angle)
        ("middle", "yaw_left", yaw_angle)
        ("ring", "yaw_right", yaw_angle)
        ("pinky", "yaw_right", yaw_angle)
    ]

    threads = []

    for finger, joint, angle in joint_movements:
        thread = threading.Thread(target=controller.move_finger, args=(finger, joint, angle, delay))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()


def point(delay=0.01):
    joint_movements = [
        ("middle", "pitch", 180.0),
        ("ring", "pitch", 180.0),
        ("pinky", "pitch", 180.0),
        ("thumb", "pitch", 90.0),
        ("thumb", "yaw_left", 90.0)
    ]

    threads = []

    for finger, joint, angle in joint_movements:
        thread = threading.Thread(target=controller.move_finger, args=(finger, joint, angle, delay))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

