import re

with open('/Users/devorah/connect/ReVowStudioAI/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace fonts
old_fonts = r'<link href="https://fonts.googleapis.com/css2\?family=Outfit.*?rel="stylesheet">'
new_fonts = '<link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap" rel="stylesheet">'
html = re.sub(old_fonts, new_fonts, html, flags=re.DOTALL)

with open('/Users/devorah/connect/ReVowStudioAI/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html fonts")
