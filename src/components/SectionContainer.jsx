import React from 'react';
import { cn } from '@/lib/utils';

const SectionContainer = ({ children, className, id }) => {
  return (
    <section id={id} className={cn("py-16 md:py-24 px-4 overflow-hidden", className)}>
      <div className="container mx-auto">
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;