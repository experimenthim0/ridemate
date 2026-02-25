const QRCode = require("qrcode");

const generateUPIQR = async (upiId, name, amount) => {
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
  try {
    const qrDataUrl = await QRCode.toDataURL(upiString, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return { qrDataUrl, upiString };
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};

module.exports = { generateUPIQR };
