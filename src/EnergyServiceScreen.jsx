import React, { useState, useMemo } from 'react';
import { Fuel, Gauge, Zap } from 'lucide-react';
import { ds, fmt, v, Field, AppFooter, BackBtn } from './App';

const EnergyServiceScreen = () => {
  const [inputs, setInputs] = useState({
    systemType: 'cng',
    dieselConsumption: 36,
    dieselPrice: 73.26,
    cngPrice: 28.51,
    lngPrice: 45,
    cngCoefficient: 1.2,
    lngCoefficient: 0.86,
    monthlyMileage: 15000,
    baseSubstitutionRate: 40,
    progressiveRate: 70,
    contractTerm: 3,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(p => ({ ...p, [name]: value }));
  };

  const setSystemType = (type) => setInputs(p => ({ ...p, systemType: type }));
  const setTerm = (term) => setInputs(p => ({ ...p, contractTerm: term }));

  const isLng = inputs.systemType === 'lng';
  const gt = ds.gas(isLng);
  const gasUnit = isLng ? 'кг' : 'м³';

  const results = useMemo(() => {
    const dCons = v(inputs.dieselConsumption);
    const dPrice = v(inputs.dieselPrice);
    const gPrice = isLng ? v(inputs.lngPrice) : v(inputs.cngPrice);
    const gCoef = isLng ? v(inputs.lngCoefficient) : v(inputs.cngCoefficient);
    const totalM = v(inputs.monthlyMileage);
    const years = v(inputs.contractTerm);
    
    const baseRate = v(inputs.baseSubstitutionRate) / 100;
    const progRate = v(inputs.progressiveRate) / 100;

    const calcSavings = (rate) => {
      const subD = dCons * rate;
      const gasCons = subD * gCoef; 
      const sav100 = (subD * dPrice) - (gasCons * gPrice);
      return (sav100 / 100) * totalM;
    };

    const baseSav = calcSavings(baseRate);
    const progSav = calcSavings(progRate);
    const diffSav = Math.max(0, progSav - baseSav);
    const serviceCashback = diffSav * 0.5;
    const clientProfit = baseSav + serviceCashback;
    const totalContractProfit = clientProfit * 12 * years;

    return {
      baseSav: Math.round(baseSav),
      progSav: Math.round(progSav),
      diffSav: Math.round(diffSav),
      serviceCashback: Math.round(serviceCashback),
      clientProfit: Math.round(clientProfit),
      totalContractProfit: Math.round(totalContractProfit)
    };
  }, [inputs, isLng]);

  const terms = [1, 2, 3];

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col p-2 md:p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full animate-fade-in">
        
        <div className="self-start mb-4">
          <BackBtn />
        </div>

        <div className="flex flex-col items-center justify-center mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#1a202c] flex items-center gap-2">
            <Zap className="text-blue-600" size={24} fill="currentColor" /> Энергосервис
          </h1>
          <p className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider mt-1">
            РАСЧЕТ ВЫГОДЫ С СЕРВИСНЫМ ПЛАТЕЖОМ
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-md border border-surface-200 p-5 w-full">
          <div className="space-y-4">

            {/* Тип газа */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSystemType('cng')}
                className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 uppercase cursor-pointer ${!isLng
                  ? 'border-secondary bg-secondary-50 text-secondary-700 shadow-sm'
                  : 'border-surface-200 text-utility-muted hover:border-secondary-200'
                  }`}>
                КПГ (Метан)
              </button>
              <button onClick={() => setSystemType('lng')}
                className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 uppercase cursor-pointer ${isLng
                  ? 'border-primary bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-surface-200 text-utility-muted hover:border-primary-200'
                  }`}>
                СПГ (Метан)
              </button>
            </div>

            {/* Дизельное топливо */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-3 text-red-800 font-bold uppercase text-[10px]">
                <Fuel size={13} /> Дизельное топливо
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Расход (л/100 км)" name="dieselConsumption"
                  value={inputs.dieselConsumption}
                  onChange={handleChange} />
                <Field label="Цена (₽/л)" name="dieselPrice"
                  value={inputs.dieselPrice}
                  onChange={handleChange} />
              </div>
            </div>

            {/* Параметры газа */}
            <div className={`p-4 rounded-xl border ${gt.bg} ${gt.border}`}>
              <div className={`flex items-center gap-2 mb-3 ${gt.textDark} font-bold uppercase text-[10px]`}>
                <Gauge size={13} /> Параметры газа
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={`Цена (₽/${gasUnit})`}
                  name={isLng ? 'lngPrice' : 'cngPrice'}
                  value={isLng ? inputs.lngPrice : inputs.cngPrice}
                  onChange={handleChange} />
                <Field label="Коэф. расхода"
                  name={isLng ? 'lngCoefficient' : 'cngCoefficient'}
                  value={isLng ? inputs.lngCoefficient : inputs.cngCoefficient}
                  step="0.01"
                  onChange={handleChange} />
              </div>
            </div>

            {/* Пробег / замещение */}
            <div className="grid grid-cols-2 gap-3 px-4">
              
              <div className="flex flex-col h-full">
                <label className="flex flex-col justify-start min-h-[34px] mb-1">
                  <span className="text-[12px] text-gray-500 uppercase font-semibold">
                    ПРОБЕГ (КМ/МЕС)
                  </span>
                </label>
                <div className="relative mt-auto">
                  <input
                    type="number"
                    name="monthlyMileage"
                    value={inputs.monthlyMileage}
                    onChange={handleChange}
                    className="w-full p-2 md:p-2.5 bg-surface-50 border border-surface-300 rounded-lg font-bold text-lg text-graphite outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label className="flex flex-col justify-start min-h-[34px] mb-1">
                  <span className="text-[12px] text-gray-500 uppercase font-semibold">
                    % ЗАМЕЩЕНИЯ ДТ
                  </span>
                  <span className="block text-[11px] text-gray-400 normal-case font-normal mt-0.5 leading-tight">
                    [среднерыночное значение]
                  </span>
                </label>
                <div className="relative mt-auto">
                  <input
                    type="number"
                    name="baseSubstitutionRate"
                    value={inputs.baseSubstitutionRate}
                    onChange={handleChange}
                    className="w-full p-2 md:p-2.5 bg-surface-50 border border-surface-300 rounded-lg font-bold text-lg text-graphite outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200"
                  />
                </div>
              </div>

            </div>

            {/* Новые поля энергосервиса */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mt-4">
              
              {/* Слайдер */}
              <div>
                <label className="text-[12px] text-gray-500 uppercase font-semibold mb-2 block flex justify-between items-center">
                  Сервисный % замещения ДТ: <span className="text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded-md">{inputs.progressiveRate}%</span>
                </label>
                <input 
                  type="range" 
                  name="progressiveRate" 
                  min="40" max="100" step="1" 
                  value={inputs.progressiveRate} 
                  onChange={handleChange}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  style={{ background: `linear-gradient(to right, #2563eb ${((inputs.progressiveRate - 40) / 60) * 100}%, #e5e7eb ${((inputs.progressiveRate - 40) / 60) * 100}%)` }}
                />
                <div className="flex justify-between text-[12px] text-gray-500 uppercase font-semibold mt-2">
                  <span>Мин (40%)</span>
                  <span>Макс (100%)</span>
                </div>
              </div>

              {/* Срок контракта */}
              <div className="mt-3 sm:mt-4">
                <label className="text-[12px] text-gray-500 uppercase font-semibold mb-2 block">Срок контракта</label>
                <div className="flex w-full bg-gray-100 p-1 rounded-lg mt-2">
                  {terms.map(t => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={
                        inputs.contractTerm === t 
                          ? "flex-1 py-1.5 sm:py-2 text-center bg-white shadow-sm transition-all rounded-md text-[12px] text-blue-600 uppercase font-semibold"
                          : "flex-1 py-1.5 sm:py-2 text-center transition-all rounded-md text-[12px] text-gray-500 uppercase font-semibold hover:text-gray-800"
                      }
                    >
                      {t} {t === 1 ? 'год' : (t === 5 ? 'лет' : 'года')}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Вывод результатов */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-6 flex flex-col">
              
              {/* СЛОЙ 1 (Сравнение) */}
              <div className="grid grid-cols-2 border-b border-gray-200">
                <div className="py-2 px-3 sm:p-4 border-r border-gray-200 flex flex-col items-center text-center">
                  <div className="text-[9px] sm:text-[10px] uppercase text-gray-500 font-semibold mb-1 whitespace-nowrap">
                    ЭКОНОМИЯ ПРИ {inputs.baseSubstitutionRate}%
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-800">
                    {fmt(results.baseSav)}
                  </div>
                </div>
                <div className="py-2 px-3 sm:p-4 bg-blue-50/30 flex flex-col items-center text-center">
                  <div className="text-[9px] sm:text-[10px] uppercase text-blue-600 font-semibold mb-1 whitespace-nowrap">
                    ЭКОНОМИЯ ПРИ {inputs.progressiveRate}%
                  </div>
                  <div className="text-base sm:text-lg font-bold text-blue-700">
                    {fmt(results.progSav)}
                  </div>
                </div>
              </div>

              {/* Блок 1: Детализация расчетов (Стиль чека) */}
              <div className="flex flex-col gap-1.5 sm:gap-3 p-3 sm:p-5 border-t border-gray-100 bg-white rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Дополнительная экономия при сверх-замещении</span>
                  <span className="text-sm font-semibold text-gray-800">{fmt(results.progSav - results.baseSav)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800 block">Платеж по энергосервисному контракту</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 block mt-0.5">50% от сверх-экономии</span>
                  </div>
                  <span className="text-sm font-semibold text-red-500 whitespace-nowrap">- {fmt(results.serviceCashback)}</span>
                </div>
                <hr className="border-gray-200 my-2 sm:my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">ДОПОЛНИТЕЛЬНАЯ выгода в месяц</span>
                  <span className="text-xl font-bold text-blue-900">{fmt((results.progSav - results.baseSav) - results.serviceCashback)}</span>
                </div>

                {/* Блок 2: Итоговая выгода за срок (Яркий подвал) */}
                <div className="mt-2 sm:mt-4 p-3 sm:p-5 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">
                    ИТОГО ВЫГОДА ЗА {inputs.contractTerm} {inputs.contractTerm === 1 ? 'ГОД' : (inputs.contractTerm === 5 ? 'ЛЕТ' : 'ГОДА')}
                  </span>
                  <span className="text-3xl md:text-4xl font-extrabold text-blue-600">
                    {fmt(((results.progSav - results.baseSav) - results.serviceCashback) * 12 * inputs.contractTerm)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default EnergyServiceScreen;
