Apply Face Memory Profile concept to current ReVow Studio AI.

Do not redesign.

Keep current UI.

Add one step after photo upload:

Create Memory Profile


Purpose:
Improve face consistency
and allow future portrait creation.


Flow:

Upload Photos
(allow 1 photo minimum,
recommend 3-5 photos)

↓

Create Memory Profile

↓

Choose Time Moment

20s
30s
Current Look

↓

Choose Style / Outfit

↓

Generate


UI:

Title:
Create Your Memory Profile

Subtitle:
Upload a few photos so AI can keep your unique features.


Upload slots:

Main Photo
Smile Photo
Side Photo
Additional Photos


For MVP:
No real AI training yet.

Only prepare structure.

Create functions:

createMemoryProfile()

saveMemoryProfile()

selectMemoryProfile()


Add TODO:

Connect face identity AI API later.


Important:
Do not store user photos permanently without consent.

Add consent checkbox:

"I confirm I have permission to use these photos."