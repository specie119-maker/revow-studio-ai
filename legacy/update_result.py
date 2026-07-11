import re

with open('/Users/devorah/connect/ReVowStudioAI/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update generateDemoResult
new_generate = """  generateDemoResult: function() {
    console.log("generateDemoResult started");
    if (!this.selectedStyle) {
      alert('Please select a style first.');
      return;
    }

    // Show generating view
    this.navigate('generating');

    console.log("memoryProfile loaded:", this.memoryProfile);
    console.log("Generating with parameters:", {
      age: this.selectedAgeStyle,
      style: this.selectedStyle,
      outfitReference: this.outfitReferenceImage
    });

    setTimeout(() => {
      this.showResult();
    }, 3000);
  },

  showResult: function() {
    const demoResultImage = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600&h=800";
    console.log("demo image assigned:", demoResultImage);
    
    // Update UI with demo image
    const container = document.querySelector('.result-image-container');
    if (container) {
      container.innerHTML = `<img src="${demoResultImage}" alt="AI Result" class="result-img" style="width:100%; border-radius:var(--border-radius); box-shadow:0 10px 30px rgba(0,0,0,0.1);">`;
    }

    // Transition from generating to result view
    this.navigate('result');
    console.log("result screen opened");
  },"""

js = re.sub(r'  generateDemoResult: function\(\) \{.*?(?=  saveImage: function\(\) \{)', new_generate + "\n\n", js, flags=re.DOTALL)

with open('/Users/devorah/connect/ReVowStudioAI/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated app.js")
