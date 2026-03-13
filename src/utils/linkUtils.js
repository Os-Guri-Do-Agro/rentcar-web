/**
 * Utility functions for handling external links and social media redirects
 */

export const abrirLink = (url) => {
    console.log("[linkUtils] Abrindo link genérico:", url);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const abrirInstagram = (url) => {
    console.log("[linkUtils] Abrindo Instagram:", url);
    if (!url) return;
    // Basic validation could be added here
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const abrirFacebook = (url) => {
    console.log("[linkUtils] Abrindo Facebook:", url);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const abrirWhatsApp = (numero) => {
    console.log("[linkUtils] Abrindo WhatsApp para:", numero);
    if (!numero) return;
    
    // Remove non-numeric characters for the link
    const cleanNumber = numero.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const abrirEmail = (email) => {
    console.log("[linkUtils] Abrindo cliente de email para:", email);
    if (!email) return;
    window.location.href = `mailto:${email}`;
};

export const abrirTelefone = (telefone) => {
    console.log("[linkUtils] Abrindo discador para:", telefone);
    if (!telefone) return;
    window.location.href = `tel:${telefone.replace(/\D/g, '')}`;
};

export const abrirMaps = (mapsUrl) => {
    console.log("[linkUtils] Abrindo Google Maps:", mapsUrl);
    if (!mapsUrl) return;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
};