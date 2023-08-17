import os
import json

PAYLOAD = os.getenv("PAYLOAD", "Default paylod")
PRS = os.getenv("PRS", None)

def print_json(json_data):
    json_formatted_str = json.dumps(json_data, indent=2)
    print(json_formatted_str)

print("Hello bitrise")
print(PAYLOAD)
print("------")
print(PRS)

print("------")
print("------")

print_json(PAYLOAD)
print_json(PRS)
