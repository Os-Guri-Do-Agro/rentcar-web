/**
 * Debugging Utilities
 * Consistent logging with prefixes and timestamps
 */

const getTimestamp = () => new Date().toISOString();

const formatMessage = (prefix, message, data) => {
  const timestamp = getTimestamp();
  let dataString = '';
  
  if (data !== undefined) {
    try {
      if (data instanceof Error) {
        dataString = `\nERROR: ${data.message}\nSTACK: ${data.stack}`;
      } else if (typeof data === 'object') {
        dataString = `\nDATA: ${JSON.stringify(data, null, 2)}`;
      } else {
        dataString = `\nDATA: ${data}`;
      }
    } catch (e) {
      dataString = `\nDATA: [Circular or Non-Serializable Object]`;
    }
  }

  return `[${timestamp}] ${prefix} ${message}${dataString}`;
};

export const logReservaDebug = (message, data) => {
  console.log(formatMessage('[RESERVA]', message, data));
};

export const logUploadDebug = (message, data) => {
  console.log(formatMessage('[UPLOAD]', message, data));
};

export const logAdminDebug = (message, data) => {
  console.log(formatMessage('[ADMIN]', message, data));
};

export const logFormDebug = (message, data) => {
  console.log(formatMessage('[FORM]', message, data));
};

export const logSchemaDebug = (message, data) => {
  console.log(formatMessage('[SCHEMA_FIX]', message, data));
};