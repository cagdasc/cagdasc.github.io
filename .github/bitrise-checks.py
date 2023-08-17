import os
import json


def print_json(json_data):
    json_formatted_str = json.dumps(json_data, indent=2)
    print(json_formatted_str)
    
event_data_path = os.environ.get('GITHUB_EVENT_PATH')

if event_data_path:
    with open(event_data_path, 'r') as event_file:
        event_data = json.load(event_file)
        print_json(event_data)
        
        check_run_conclusion = event_data['check_run']['conclusion']
        print(f"Check run conclusion: {check_run_conclusion}")

else:
    print("Check run event data not provided.")
