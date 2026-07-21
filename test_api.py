from openai import OpenAI

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "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",
  timeout=60.0
)

print("Sending request...")
completion = client.chat.completions.create(
  model="microsoft/phi-4-mini-instruct",
  messages=[{"role":"user","content":"Hi"}],
  temperature=0.1,
  top_p=0.7,
  max_tokens=100,
  stream=False
)

print("Response:")
print(completion.choices[0].message.content)