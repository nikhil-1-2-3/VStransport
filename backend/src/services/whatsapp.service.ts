import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer';

// Initialize the WhatsApp Client
// We use LocalAuth so the session is saved and we don't need to scan QR code every time
export const whatsappClient = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth' // stores session in this directory
  }),
  puppeteer: {
    executablePath: process.env.RENDER ? puppeteer.executablePath() : undefined,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

let isReady = false;

// Event: QR Code generated
whatsappClient.on('qr', (qr) => {
  console.log('====================================================');
  console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP TO LINK THE BOT');
  console.log('====================================================');
  qrcode.generate(qr, { small: true });
});

// Event: Client is ready
whatsappClient.on('ready', () => {
  isReady = true;
  console.log('WhatsApp Client is READY!');
});

// Event: Authentication failed
whatsappClient.on('auth_failure', (msg) => {
  console.error('WhatsApp Authentication Failed:', msg);
});

// Event: Disconnected
whatsappClient.on('disconnected', (reason) => {
  isReady = false;
  console.log('WhatsApp Client was disconnected:', reason);
});

// Helper function to send messages
export const sendWhatsAppMessage = async (phoneNumber: string, message: string): Promise<boolean> => {
  if (!isReady) {
    console.error('WhatsApp Client is not ready. Cannot send message.');
    return false;
  }

  try {
    // whatsapp-web.js requires country code. Defaulting to India (+91) if not provided.
    // Ensure phoneNumber is just digits
    let sanitizedPhone = phoneNumber.replace(/\D/g, '');
    
    if (sanitizedPhone.length === 10) {
      sanitizedPhone = `91${sanitizedPhone}`;
    }

    const chatId = `${sanitizedPhone}@c.us`;
    await whatsappClient.sendMessage(chatId, message);
    console.log(`WhatsApp message sent to ${sanitizedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};
