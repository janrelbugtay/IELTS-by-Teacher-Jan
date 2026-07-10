import json

html_content = ""
with open("user_request.html", "r") as f:
    html_content = f.read()

# I don't actually have the user_request.html saved. The user provided it in their message!
# Wait, let me just extract the data from the user's message manually. It's inside the prompt.
