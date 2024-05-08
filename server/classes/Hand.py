import os
import sys
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

from constants import N_SERVO_PINS, SERVO_MAPPING
from adafruit_servokit import ServoKit
from time import sleep

class Hand:

    def __init__(self, servo_kit: ServoKit):
        self.servo_kit = servo_kit
        
    def _move_servo(self, servo_pin: str, angle: float, delay: float):
        self.servo_kit.servo[servo_pin].angle = angle   
        sleep(delay)
        
    def _validate_servo(self, servo_name: str, orientation: str):
        if servo_name == self.WRIST_NAME:
            raise ValueError("Cannot control wrist servo in this method")
        
        servo_pins = SERVO_MAPPING.get(servo_name)
        if not servo_pins:
            raise KeyError(f"Servo '{servo_name}' not found in mapping.")
        
        servo_pin = servo_pins.get(orientation)
        if servo_pin is None:
            raise ValueError(f"Invalid orientation '{orientation}' for servo '{servo_name}'")
        
        return servo_pin
    
    def move_finger(self, servo_name: str, orientation: str, angle: float, delay: float, action: str):
        servo_pin = self._validate_servo(servo_name, orientation)
        self._move_servo(servo_pin, angle, delay)
        print("move finger: ", angle)