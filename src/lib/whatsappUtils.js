import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { getWhatsAppNumber as fetchWhatsAppNumber } from '@/services/configService';

/**
 * Formats a phone number for WhatsApp URL (only numbers, includes country code)
 */
export const formatPhoneForWhatsapp = (phone) => {
  if (!phone) return '';
  // Remove non-numeric characters
  let clean = phone.replace(/\D/g, '');
  
  // If no country code (length 10 or 11), assume Brazil (+55)
  if (clean.length === 10 || clean.length === 11) {
    clean = '55' + clean;
  }
  
  return clean;
};

/**
 * Fetches the public WhatsApp number using ConfigService
 */
export const getWhatsAppNumber = async () => {
  const number = await fetchWhatsAppNumber();
  return formatPhoneForWhatsapp(number);
};

/**
 * Generates the full WhatsApp URL
 */
export const generateWhatsAppLink = (phoneNumber, message) => {
  const cleanPhone = formatPhoneForWhatsapp(phoneNumber || '5511913123870');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Generates a formatted message for rental inquiry
 */
export const generateWhatsAppMessage = (car, reservation, user, rentalType = "Não especificado") => {
  if (!car || !user) return '';

  const startDate = reservation?.data_inicio ? format(new Date(reservation.data_inicio), 'dd/MM/yyyy', { locale: ptBR }) : 'A definir';
  const endDate = reservation?.data_fim ? format(new Date(reservation.data_fim), 'dd/MM/yyyy', { locale: ptBR }) : 'A definir';
  
  const totalValue = reservation?.valor_total 
    ? parseFloat(reservation.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'Sob consulta';

  const message = `
*Olá! Gostaria de confirmar minha reserva na JL Rent a Car.* 

*Detalhes do Veículo:*
 *Modelo:* ${car.nome}
 *Categoria:* ${car.categoria}
 *Placa:* ${car.placa || 'A definir'}

*Detalhes da Reserva:*
 *Período:* ${startDate} até ${endDate}
 *Valor Total:* ${totalValue}
 *Tipo de Uso:* ${rentalType}
 *Protocolo:* #${reservation?.id?.slice(0, 8) || 'N/A'}

*Meus Dados:*
 *Nome:* ${user.nome}
 *Email:* ${user.email}
 *Telefone:* ${user.telefone || 'Não informado'}

_Aguardo a confirmação da documentação._
  `.trim();

  return message;
};

export const generateWhatsAppURL = (phoneNumber, message) => {
  return generateWhatsAppLink(phoneNumber, message);
};