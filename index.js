require('dotenv').config()

const {ImapFlow} = require('imapflow');
const {fs} = require('fs');
const { simpleParser } = require('mailparser');
const { parse } = require('path');





async function main() {
    const client = new ImapFlow({
      host: 'imap.discosparadiso.com',
      port: 993,
      secure: true, // Usa TLS
      auth: {
        user: 'contact@discosparadiso.com',
        pass: process.env.THUNDERBIRD_CONTACT_PASSWORD,
      },
      logger: {
        debug: () => {}, // Silencia logs de nivel "debug"
        info: console.log, // Mantiene logs de nivel "info"
        warn: console.warn,
        error: console.error
    }
    });
  
    try {

      const range = "1:*"; // Busca en todos los mensajes
      const query = {
          source: true,
          envelope: true, // Obtén datos del sobre (asunto, remitente, etc.)
          bodyStructure: true,
      };
      // Conectar al servidor
      await client.connect();
      console.log('Conectado al servidor IMAP');
  
      // Abrir la bandeja de entrada
      await client.mailboxOpen('INBOX');
  
      // Buscar correos con el término "invoice"
      const messages = await client.fetch(range, query, {uid: true})
      for await (const message of messages) { 
        if (!message.source) {
          console.error(`El mensaje con ID ${message.id} no tiene contenido (source).`);
          continue;
      }
        const parsed = await simpleParser(message.source);  
        if(/invoice|factura/i.test(parsed.subject) && parsed.attachments){
          for(const attachment of parsed.attachments) {
            console.log(attachment.filename)
          }
        }
        
        /*
        if(parsed.attachments){
          for (const attachment of parsed.attachments){
            if(/invoice|factura/i.test(attachment.filename) && attachment.filename.endsWith('.pdf')){
              console.log(`${attachment.filename}.pdf`)
            } else {
              console.log(attachment.filename)
            }
          }
        }*/
      }
      
    } finally {
      await client.close();
      console.log('Desconectado del servidor IMAP');
    }
  }
  
  main().catch(console.error);