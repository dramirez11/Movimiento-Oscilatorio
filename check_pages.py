import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
    
print("Sections found:")
for match in re.findall(r'<section class="notebook-page.*?>', html):
    print(match)
