import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]"
        >
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <p className="font-bold text-[#0E3A2F] mb-1">Nós valorizamos sua privacidade</p>
              <p>Utilizamos cookies para melhorar sua experiência em nosso site. Ao continuar navegando, você concorda com nossa Política de Privacidade.</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { localStorage.setItem('cookie-consent', 'declined'); setIsVisible(false); }}
                className="text-gray-600"
              >
                Recusar
              </Button>
              <Button 
                onClick={acceptCookies}
                className="bg-[#00D166] text-[#0E3A2F] hover:bg-[#00F178] font-bold"
              >
                Aceitar Cookies
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;