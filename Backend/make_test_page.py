from PIL import Image, ImageDraw

img = Image.new("RGB", (800, 1000), "white")
d = ImageDraw.Draw(img)

lines = [
    "Chapter 4: The Solar System",
    "",
    "The Sun is a star at the center of our solar system.",
    "There are 8 planets that orbit the Sun.",
    "Mercury is the closest planet to the Sun.",
    "Jupiter is the largest planet in the solar system.",
    "Earth is the only planet known to have life.",
    "The Moon orbits the Earth and has no light of its own.",
    "Saturn is famous for its beautiful rings.",
    "A year on Earth is 365 days, the time to orbit the Sun.",
    "Mars is called the Red Planet because of its red soil.",
]
y = 60
for ln in lines:
    d.text((50, y), ln, fill="black")
    y += 50

img.save("test_page.jpg", "JPEG", quality=90)
print("wrote test_page.jpg")
