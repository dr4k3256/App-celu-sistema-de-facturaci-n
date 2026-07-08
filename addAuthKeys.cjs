const fs = require('fs');

const enPath = 'src/locales/en.json';
const esPath = 'src/locales/es.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

// Add missing keys to English
Object.assign(en.security, {
  fieldsRequired: 'Both fields are required',
  loginSuccess: 'Welcome! Access granted.',
  invalidCredentials: 'Incorrect username or password',
  accountCreated: 'Account created successfully. Welcome!',
  loginTitle: 'Welcome Back',
  createAccount: 'Create Your Account',
  loginDesc: 'Enter your credentials to access the system',
  createDesc: 'Create a local account to protect your data. No internet required.',
  usernamePlaceholder: 'e.g. admin',
  enter: 'Login',
  create: 'Create Account & Enter'
});

// Add missing keys to Spanish
Object.assign(es.security, {
  fieldsRequired: 'Ambos campos son requeridos',
  loginSuccess: '¡Bienvenido! Acceso concedido.',
  invalidCredentials: 'Usuario o contraseña incorrectos',
  accountCreated: 'Cuenta creada exitosamente. ¡Bienvenido!',
  loginTitle: 'Bienvenido',
  createAccount: 'Crea tu cuenta',
  loginDesc: 'Ingresa tus credenciales para acceder al sistema',
  createDesc: 'Crea una cuenta local para proteger tus datos. No requiere internet.',
  usernamePlaceholder: 'Ej. admin',
  enter: 'Ingresar',
  create: 'Crear Cuenta e Ingresar'
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
console.log('Translation keys added!');
