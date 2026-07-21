import requests
import json

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer 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",
    "Content-Type": "application/json"
}
data = {
    "model": "microsoft/phi-4-mini-instruct",
    "messages": [{"role": "user", "content": "Hi"}],
    "max_tokens": 50,
    "stream": False
}

try:
    print("Sending request with requests...")
    response = requests.post(url, headers=headers, json=data, timeout=60)
    print(f"Status Code: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
