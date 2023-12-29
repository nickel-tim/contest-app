import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styles.colormasks import RadialGradiantColorMask
from io import BytesIO
import base64


import time

def qr_code_generator(data=None, output_path='custom_qr_code.png'):
# Create QR code
    
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_L)

    qr.add_data(data)

    qr_img = qr.make_image(image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer())


    # Convert QR code image to base64
    img_byte_array = BytesIO()
    qr_img.save(img_byte_array, format='PNG')
    img_base64 = base64.b64encode(img_byte_array.getvalue()).decode('utf-8')

    return img_base64


if __name__=='__main__':
    data = {
        "points": 20,
        "eventId": "fd8402ad-89f8-4435-b3e9-fc9307f38d34",
        "is_active": True,
        "uuid": "b9223763-5b31-4048-90ea-a63177de04d9"
    }
    s = time.time()
    out_path = qr_code_generator(data, './test.png')
    print(time.time()-s)
