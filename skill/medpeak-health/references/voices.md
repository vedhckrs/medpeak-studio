# Narrator voices (ElevenLabs library, checked 2026-11-15)

Top young, energetic, clear English voices from the shared library, by real usage over the last
year (characters generated). To use one, put it in video.json:
`"voice": {"voiceId": "...", "publicOwnerId": "...", "name": "...", "model": "eleven_multilingual_v2"}`.
`publicOwnerId` lets the key pool add the voice to whichever ElevenLabs account it switches to.

| # | Voice | Gender | Accent | Style | Uses/yr | voiceId | publicOwnerId |
|---|---|---|---|---|---|---|---|
| 1 | Brittney - Fun, Youthful | F | American | social media, upbeat | 16.7B | kPzsL2i3teMYv0FxEYQ6 | e70117aeedd1f2d59cffcc96e42961819238d6ce7ec83e34fad935c7db9e95ec |
| 2 | Hope - Upbeat and Clear | F | American | social media, upbeat | 11.1B | tnSpp4vdxKPjI9w0GnoV | 7d272ea0221fbc9ce382a3eaf4d7f907179558360d93b351ec7d344d30023cf9 |
| 3 | Amelia - Enthusiastic and Expressive | F | British | narration, upbeat | 5.7B | ZF6FPAbjXT4488VcRRnw | 9265ac49c437181ced8d508db9b8248e1b839589ba453afca0db0f9d60ff389a |
| 4 | Alex - Upbeat, Energetic and Clear | M | American | entertainment, confident | 3.7B | yl2ZDV1MzN4HbQJbMihG | a231663267efedf44629d1210c43f7045270e9dc6cf04a23c533dd75a567d5ba |
| 5 | Jessica - Playful, Bright, Warm | F | American | conversational, upbeat | 2.6B | r1KmysJdVYZjJCm4mL3b | d5a057fa67bd4518fbf13eb08503860c528f1b11bb306922220aa0c561744e90 |
| 6 | Hope - Professional, Clear and Natural | F | American | educational, confident | 1.4B | WZlYpi1yf6zJhNWXih74 | 7d272ea0221fbc9ce382a3eaf4d7f907179558360d93b351ec7d344d30023cf9 |
| 7 | Allison - Energetic, Clear and Bubbly | F | American | entertainment, upbeat | 1.1B | xctasy8XvGp2cVO9HL9k | 938efb29fb9ae8e6b4ac49cebc66e30d58eda3e02ac1910d4f1c03e0a30132c5 |
| 8 | Eve - Authentic, Energetic and Happy | F | American | conversational, upbeat | 840M | BZgkqPqms7Kj9ulSkVzn | cab0f4a4d83ff44919f93c5d01052405fa3c50c414d1ecab061b67b0bd8d536a |
| 9 | Todd - Clear, Engaging and Educational | M | American | educational, upbeat | 763M | g14YnDYCsy3k7XLlcKlO | bc7e3d6babf4fdba703be995bbc8f635413337652399fda3b2d0bea6c908a3e8 |
| 10 | Brian - Energetic, Lively, Storytelling | M | American | narration | 690M | UGTtbzgh3HObxRjWaSpr | a62f8cb610e69962950841bdb32d3cb38ecad9276ac7056cc796ed73baf9610d |
| 11 | Drew - Casual, Curious and Fun | M | American | social media, upbeat | 589M | q0IMILNRPxOgtBTS4taI | 675db5c1a341e2f820aefb00825680aa042d958a4a3aef3200735c799210dcb4 |
| 12 | Liam - Viral Short-Form Storyteller | M | American | social media, hyped | 483M | VCgLBmBjldJmfphyB8sZ | e7a2b2ad2c8c0e84ff8898c27d67ced377371daf6f6b439cb0edc28c1fa8c3e6 |
| 13 | Viraj - Energetic and Confident | M | Indian | narration, confident | 456M | bajNon13EdhNMndG3z05 | f87f057c2250691953ac2e6227859706764bd08c88a055a18c74261957885a51 |
| 14 | Axell - Energetic YouTube Personality | M | British | social media, excited | 367M | 2mltbVQP21Fq8XgIfRQJ | 70f5a5480e10b0bfc6be976e983454dd45959b0912e28c385f7b15fd46e2cdbb |
| 15 | Harper - Confident, Clear and Cool | F | American | educational, confident | 185M | c1uwEpPUcC16tq1udqxk | f995f689648bc413c1b7fb9ec8524f634e4d32f5030ee172ef6d847ba9dc5ee9 |

The machine-readable list the pipeline draws from is `../voices.json`: every new video gets one of
these 15 at random, never one used by the last 7 videos (`node pipeline/voice.mjs <slug> --pick-voice`).
Refresh this list: `node pipeline/voice.mjs --voices` (account) or the shared-voices search in git history.
