// Ejemplos de prueba para el componente SubirArchivo

// TEST 1: Validación de nombreArchivo
const testNombreArchivo = (nombreArchivo, hasExistingFile, expected) => {
  console.log(`Testing: "${nombreArchivo}" with hasExistingFile=${hasExistingFile}`);
  console.log(`Expected: ${expected}`);
  console.log('---');
};

// Casos que NO deberían detectar archivo
testNombreArchivo("Subir archivo PDF", false, false);
testNombreArchivo("Ningún archivo seleccionado", false, false);
testNombreArchivo("Seleccionar archivo", false, false);
testNombreArchivo("", false, false);
testNombreArchivo(null, false, false);
testNombreArchivo(undefined, false, false);

// Casos que SÍ deberían detectar archivo
testNombreArchivo("documento.pdf", false, true);
testNombreArchivo("imagen.jpg", false, true);
testNombreArchivo("convocatoria-olimpiada-2024.pdf", false, true);
testNombreArchivo("foto_perfil.png", false, true);

// Casos con hasExistingFile explícito
testNombreArchivo("documento.pdf", true, true);
testNombreArchivo("Subir archivo PDF", true, true); // hasExistingFile override
testNombreArchivo("documento.pdf", false, true);
testNombreArchivo("Subir archivo PDF", false, false);

// Casos límite
testNombreArchivo("a.p", false, false); // Muy corto
testNombreArchivo("archivo", false, false); // Sin extensión
testNombreArchivo("archivo.txt", false, false); // Extensión no válida (si acceptedFormats=['pdf'])
testNombreArchivo("archivo.PDF", false, true); // Extensión en mayúsculas (debería funcionar)

// TEST 2: Configuraciones comunes de uso

// Configuración para solo PDF
const configPDF = {
  acceptedFormats: ['pdf'],
  acceptedMimeTypes: ['application/pdf'],
  acceptAttribute: ".pdf,application/pdf",
  maxFileSize: 10 * 1024 * 1024
};

// Configuración para imágenes
const configImagenes = {
  acceptedFormats: ['jpg', 'jpeg', 'png', 'gif'],
  acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
  acceptAttribute: ".jpg,.jpeg,.png,.gif",
  maxFileSize: 5 * 1024 * 1024
};

// Configuración para documentos múltiples
const configDocumentos = {
  acceptedFormats: ['pdf', 'doc', 'docx'],
  acceptedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  acceptAttribute: ".pdf,.doc,.docx",
  maxFileSize: 20 * 1024 * 1024
};

console.log('Configuraciones de ejemplo creadas:', {
  configPDF,
  configImagenes,
  configDocumentos
});

export {
  testNombreArchivo,
  configPDF,
  configImagenes,
  configDocumentos
};
