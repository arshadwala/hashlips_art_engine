import glob
from PIL import Image
from multiprocessing import Pool

filenames = glob.glob("build/images/*.png")


def process_image(filename):
    im = Image.open(filename)  # .resize((400,400))
    rgb_im = im.convert("RGB")  # is this needed?
    rgb_im.save(filename.replace("png", "jpeg"), quality=80)


pool = Pool()
pool.map(process_image, filenames)
