import React from 'react';

const Terms = () => {
  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-[#0E3A2F] mb-8 border-b pb-4">Termos e Condições</h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Objeto</h2>
              <p>
                O presente termo tem como objeto o aluguel de veículos sem condutor, de propriedade da JL RENT A CAR LTDA, para o LOCATÁRIO, mediante pagamento de diárias ou mensalidades conforme tabela vigente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Requisitos para Locação</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Idade mínima de 21 anos.</li>
                <li>CNH definitiva e válida por no mínimo 2 anos.</li>
                <li>Comprovante de residência atualizado em nome do locatário.</li>
                <li>Aprovação em análise de crédito e cadastro.</li>
                <li>Para motoristas de app: comprovante de cadastro ativo nas plataformas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Responsabilidades do Locatário</h2>
              <p>
                O LOCATÁRIO é integralmente responsável pela guarda e uso correto do veículo, devendo zelar pelo mesmo como se fosse seu. Multas de trânsito ocorridas durante o período de locação serão de inteira responsabilidade do LOCATÁRIO, acrescidas de taxa administrativa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Manutenção e Seguro</h2>
              <p>
                A JL RENT A CAR oferece manutenção preventiva inclusa. Danos causados por mau uso, negligência ou imperícia não estão cobertos. O seguro possui franquia (coparticipação) em caso de sinistro, cujo valor consta no contrato específico de locação.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Pagamentos e Prazos</h2>
              <p>
                Os pagamentos devem ser efetuados rigorosamente nas datas estipuladas. O atraso acarretará em juros, multa e possível bloqueio/recolhimento do veículo.
              </p>
            </section>
            
            <p className="text-sm text-gray-500 mt-8 pt-4 border-t">
              Última atualização: Dezembro de 2024.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;