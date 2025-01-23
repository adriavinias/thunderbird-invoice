const { OAuth2Client } =require('google-auth-library');
const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON de credenciales y al token
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');

// Carga el cliente OAuth2
function getOAuthClient() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_id, client_secret, redirect_uris } = credentials.installed;
    return new OAuth2Client(client_id,client_secret,redirect_uris[0])
}

// Genera la URL de autorización
function generateAuthUrl() {
    const auth = getOAuthClient();
    return auth.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
    });
}

//Paso 1: Muestra la URL y espera al usuario
function promptAuthorization() {
    const url = generateAuthUrl();
    console.log('Por favor, accede a la siguiente URL para autorizar la aplicación:');
    console.log(url);
    console.log('Luego, introduce el código de autorización aquí.');
}

// Guarda el token en un archivo
function saveToken(tokens) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token guardado en:', TOKEN_PATH);
}

// Obtiene un token de acceso a partir del código de autorización
async function getAccessToken(code) {
    const auth = getOAuthClient();
    const { tokens } = await auth.getToken(code);
    saveToken(tokens);
    return tokens;
}

// Carga el token desde el archivo
function loadToken() {
    if (fs.existsSync(TOKEN_PATH)) {
        return JSON.parse(fs.readFileSync(TOKEN_PATH));
    }
    throw new Error('Token no encontrado. Autoriza la aplicación primero.');
}

// Exporta las funciones de autenticación
module.exports = {
    generateAuthUrl,
    getAccessToken,
    loadToken,
    getOAuthClient,
    promptAuthorization
};
