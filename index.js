const {ImapFlow} = require('imapflow');
const {fs} = require('fs');


async function main() {
    const client = new ImapFlow({
      host: 'imap.discosparadiso.com',
      port: 993,
      secure: true, // Usa TLS
      auth: {
        user: 'contact@discosparadiso.com',
        pass: '',
      },
    });
  
    try {
      // Conectar al servidor
      await client.connect();
      console.log('Conectado al servidor IMAP');
  
      // Abrir la bandeja de entrada
      const mailbox = await client.getMailboxLock('INBOX');
      console.log(`Bandeja seleccionada: ${mailbox.path}`);
  
      // Buscar correos con el término "invoice"
      for await (let message of client.fetch({ text: 'invoice' }, { envelope: true, source: true })) {
        console.log(`Asunto: ${message.envelope.subject}`);
        console.log(`De: ${message.envelope.from[0].address}`);
  
        // Procesar archivos adjuntos si existen
        if (message.source.includes('Content-Type: application/pdf')) {
            console.log(message.source)
          //fs.writeFileSync(`./${message.envelope.messageId}.pdf`, message.source);
          console.log('Archivo PDF guardado.');
        }
      }
    } finally {
      await client.close();
      console.log('Desconectado del servidor IMAP');
    }
  }
  
  main().catch(console.error);