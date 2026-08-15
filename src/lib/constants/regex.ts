export const REGEX = {
    // Mínimo 8 caracteres, máximo 30. Conjunto de caracteres permitidos (letras, números, símbolos)
    PASSWORD: /^[a-zA-Z\d\W_]{8,30}$/,
    // Sin símbolos seguidos, empieza y termina en letra/número, 4-20 chars
    USERNAME: /^(?!.*[-_.]{2})[a-zA-Z0-9][a-zA-Z0-9-_.]{2,18}[a-zA-Z0-9]$/,
    // Email estándar
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    // Teléfono: Opcional +, seguido de 10 a 15 números
    PHONE_NUMBER: /^\+?[0-9]{10,15}$/,
    // Documento: Solo números, con la excepción de permitir opcionalmente una 'E' o 'R' al principio
    DOCUMENT_NUMBER: /^[ER]?[0-9]{6,12}$/i,
    // Nombres: Permite tildes, Ñ, espacios internos, pero NO espacios al inicio/final
    PERSON_NAME: /^(?! )[a-zA-ZÀ-ÿ\s']{2,48}(?<! )$/
};
