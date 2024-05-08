import json
from enum import Enum
from typing import List
from pydantic import BaseModel, Field
 
 
class Servo(BaseModel):
    servo_name: str
    normalized_pitch: int | None = None
    normalized_yaw_left: int | None = None
    normalized_yaw_right: int | None = None
     
class ServoList(BaseModel):
    servos: List[Servo] = Field(default_factory=list)