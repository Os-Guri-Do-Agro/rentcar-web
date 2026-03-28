/**
 * Utility functions for handling external links and social media redirects
 */

export const abrirLink = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const abrirInstagram = (url) => {
    if (!url) return;
    // Basic validation could be added here
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const abrirFacebook = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const abrirWhatsApp = (numero) => {
    if (!numero) return;
    
    // Remove non-numeric characters for the link
    const cleanNumber = numero.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const abrirEmail = (email) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
};

export const abrirTelefone = (telefone) => {
    if (!telefone) return;
    window.location.href = `tel:${telefone.replace(/\D/g, '')}`;
};

export const abrirMaps = (mapsUrl) => {
    if (!mapsUrl) return;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
};