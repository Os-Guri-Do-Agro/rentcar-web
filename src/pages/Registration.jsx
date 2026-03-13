import React from 'react';
import { useForm } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';

const Registration = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Cadastro Recebido!",
      description: "Seus dados foram enviados para análise. Entraremos em contato em breve.",
      duration: 5000,
    });
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-[#0E3A2F] mb-2">Faça seu Cadastro</h1>
          <p className="text-gray-600 mb-10">Preencha os dados abaixo para agilizar a análise da sua assinatura.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Data */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Dados Pessoais</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <input id="fullName" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="Seu nome completo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <input id="cpf" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="000.000.000-00" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço Completo com CEP</Label>
                  <input id="address" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="Rua, Número, Bairro, Cidade - CEP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular (WhatsApp)</Label>
                  <input id="phone" required type="tel" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="(11) 90000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <input id="email" required type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" placeholder="seu@email.com" />
                </div>
              </div>
            </section>

            {/* Alternate Contact */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Contato Alternativo (Referência)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="refName">Nome</Label>
                  <input id="refName" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refPhone">Telefone</Label>
                  <input id="refPhone" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="refAddress">Endereço</Label>
                  <input id="refAddress" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none" />
                </div>
              </div>
            </section>

            {/* Documents */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Documentos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Upload CNH Digital</span>
                  <input type="file" className="hidden" />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Comprovante de Residência</span>
                  <input type="file" className="hidden" />
                </div>
                <div className="md:col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Print do Perfil no App (Uber/99)</span>
                  <p className="text-xs text-gray-400 mt-1">Apenas para motoristas de aplicativo</p>
                  <input type="file" className="hidden" />
                </div>
              </div>
            </section>

            {/* Terms */}
            <section className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Checkbox id="lgpd" required />
                <Label htmlFor="lgpd" className="text-sm leading-relaxed">
                  Concordo com o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD) para fins de análise de crédito e cadastro.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  Declaro que as informações acima são verdadeiras e aceito os termos de uso da JL Rent a Car.
                </Label>
              </div>
            </section>

            <button 
              type="submit"
              className="w-full bg-[#0E3A2F] text-white font-bold py-4 rounded-lg hover:bg-[#165945] transition-colors shadow-lg"
            >
              Enviar Cadastro
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;