# Capo-er
See what you're gonna play on guitar when apply capo.

Try live at [http://noppayut.space/capoer](http://noppayut.space/capoer)

# Usage
1. Write some or all chords in `Original chord` box
2. Press `Input chord` button
3. Output will be display in `Transposed chord` box with difficulty scores of each capo fret in the `Difficulty box`.

## 2018/11/10
For chords that are in image format (.jpg, .png, etc.), input the url of the image in `Load from image` box and press `Load URL`. OCR system is powered by [Google Cloud Vision API](https://cloud.google.com/vision) (performance not guaranteed);

Chords in the `Original chord` box will be saved after clicking the `Input chord` button. Click `Load` to recover them.


# How it makes suggestion
The easiest fret is decided based on number of open, easy bar, and the other chords.