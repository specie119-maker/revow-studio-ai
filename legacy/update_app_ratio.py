import re

with open('/Users/devorah/connect/ReVowStudioAI/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add to state
js = js.replace("selectedStyle: 'modern_minimal',", "selectedStyle: 'modern_minimal',\n  selectedAspectRatio: 'portrait_9_16',")

# Add selectAspectRatio method
ratio_method = """  selectAspectRatio: function(ratio, element) {
    this.selectedAspectRatio = ratio;
    document.querySelectorAll('.ratio-card').forEach(card => {
      card.classList.remove('selected');
    });
    element.classList.add('selected');
  },

  selectOutfitStyle:"""
js = js.replace("  selectOutfitStyle:", ratio_method)

# Update generateDemoResult log
new_log = """    console.log("Generating with parameters:", {
      age: this.selectedAgeStyle,
      style: this.selectedStyle,
      aspectRatio: this.selectedAspectRatio,
      outfitReference: this.outfitReferenceImage
    });"""
js = re.sub(r'    console.log\("Generating with parameters:", \{.*?\}\);', new_log, js, flags=re.DOTALL)

# Update showResult for aspect ratio
new_show = """  showResult: function() {
    let demoResultImage = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80";
    
    // Adjust aspect ratio styling
    let aspectRatioStyle = "9/16";
    if (this.selectedAspectRatio === 'square_1_1') {
      aspectRatioStyle = "1/1";
      demoResultImage += "&w=800&h=800";
    } else if (this.selectedAspectRatio === 'landscape_16_9') {
      aspectRatioStyle = "16/9";
      demoResultImage += "&w=800&h=450";
    } else if (this.selectedAspectRatio === 'print_4_5') {
      aspectRatioStyle = "4/5";
      demoResultImage += "&w=800&h=1000";
    } else {
      demoResultImage += "&w=450&h=800";
    }

    console.log("demo image assigned:", demoResultImage);
    
    // Update UI with demo image
    const container = document.querySelector('.result-image-container');
    if (container) {
      container.innerHTML = `<img src="${demoResultImage}" alt="AI Result" class="result-img" style="width:100%; aspect-ratio:${aspectRatioStyle}; object-fit:cover; border-radius:var(--border-radius); box-shadow:0 10px 30px rgba(0,0,0,0.1);">`;
    }

    // Transition from generating to result view
    this.navigate('result');
    console.log("result screen opened");
  }"""
js = re.sub(r'  showResult: function\(\) \{.*?(?=  saveImage: function\(\) \{)', new_show + "\n\n", js, flags=re.DOTALL)

with open('/Users/devorah/connect/ReVowStudioAI/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated app.js for ratio")
