/**
 * Date Utility Functions
 * Consistent date formatting and handling across the application
 */

export const formatarData = (data) => {
  console.log(`[DATE_UTILS] Formatando data:`, data);

  if (!data) {
    console.log(`[DATE_UTILS] Data inválida (null/undefined)`);
    return "-";
  }

  try {
    const dataObj = new Date(data);

    // Validate if it's a valid date
    if (isNaN(dataObj.getTime())) {
      console.log(`[DATE_UTILS] Data inválida (NaN):`, data);
      return "-";
    }

    // Options for formatting
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    // Check if it's just a date string (YYYY-MM-DD) to avoid timezone shifts or unwanted time
    // If original input matches YYYY-MM-DD exactly, we might want to skip time or force UTC handling
    // For now, using standard locale string with pt-BR
    const formatted = dataObj.toLocaleDateString('pt-BR', options);
    
    // If the time is 00:00, sometimes users prefer just the date, but requirement says "DD/MM/YYYY HH:mm"
    // Let's stick to the requested format.
    
    console.log(`[DATE_UTILS] Resultado: ${formatted}`);
    return formatted;

  } catch (error) {
    console.error(`[DATE_UTILS] Erro ao formatar data:`, error);
    return "-";
  }
};