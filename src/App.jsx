import React, { useState, useEffect } from 'react';
// Исправлен импорт: добавлен ChevronRight
import { 
  Fuel, Flame, Gauge, ChevronLeft, ChevronRight, ArrowRight, 
  FileText, Wallet, BarChart3, Copyright, Tag, Printer, CheckCircle2, TrendingDown 
} from 'lucide-react';

const App = () => {
  const [step, setStep] = useState(1); 
  const [systemType, setSystemType] = useState('cng'); 

  const [inputs, setInputs] = useState({
    dieselConsumption: 36,    // Норма расхода Дизель
    dieselPrice: 75,          // Стоимость Дизеля
    
    lngCoefficient: 0.857,    // Коэффициент СПГ
    lngPrice: 43.5,           // Стоимость СПГ
    
    cngCoefficient: 1.2,      // Коэффициент КПГ
    cngPrice: 27.5,           // Стоимость КПГ
    
    monthlyMileage: 15000,    // Пробег в месяц
    months: 12,               // Период расчета
    substitutionRate: 60      // Процент замещения
  });

  const [summary, setSummary] = useState({
    dieselOnlyTotal: 0,
    dualTotal: 0,
    dualDieselPart: 0,
    dualGasPart: 0,
    savings: 0,
    costPerKmDiesel: 0,
    costPerKmDual: 0,
    monthlySavings: 0,
    dualTotalDiscounted: 0,
    dualGasPartDiscounted: 0,
    savingsDiscounted: 0,
    monthlySavingsDiscounted: 0,
    qtyDieselOnly_100: 0,
    qtyDualDiesel_100: 0,
    qtyDualGas_100: 0
  });

  useEffect(() => {
    calculateResults();
  }, [inputs, systemType]);

  const calculateResults = () => {
    // Вспомогательная функция для безопасного преобразования в число
    const val = (v) => {
        const parsed = parseFloat(v);
        return isNaN(parsed) ? 0 : parsed;
    };

    const substitutionPercent = val(inputs.substitutionRate) / 100;
    const dieselRate = 1 - substitutionPercent;

    const gasCoefficient = systemType === 'lng' ? val(inputs.lngCoefficient) : val(inputs.cngCoefficient);
    const gasPrice = systemType === 'lng' ? val(inputs.lngPrice) : val(inputs.cngPrice);
    const gasPriceDiscounted = gasPrice * 0.8; 

    const qtyDieselOnly_100 = val(inputs.dieselConsumption); 
    const qtyDualDiesel_100 = val(inputs.dieselConsumption) * dieselRate; 
    const qtyDualGas_100 = (val(inputs.dieselConsumption) * substitutionPercent) * gasCoefficient;

    const costDieselOnly_Km = (qtyDieselOnly_100 * val(inputs.dieselPrice)) / 100;
    const costDualDiesel_Km = (qtyDualDiesel_100 * val(inputs.dieselPrice)) / 100;
    
    const costDualGas_Km = (qtyDualGas_100 * gasPrice) / 100;
    const costDualTotal_Km = costDualDiesel_Km + costDualGas_Km;

    const costDualGasDiscounted_Km = (qtyDualGas_100 * gasPriceDiscounted) / 100;
    const costDualTotalDiscounted_Km = costDualDiesel_Km + costDualGasDiscounted_Km;

    const totalMileage = val(inputs.monthlyMileage) * val(inputs.months);
    const totalCostDiesel = totalMileage * costDieselOnly_Km;
    
    const totalCostDualDiesel = totalMileage * costDualDiesel_Km;
    const totalCostDualGas = totalMileage * costDualGas_Km;
    const totalCostDual = totalCostDualDiesel + totalCostDualGas;
    const totalSavings = totalCostDiesel - totalCostDual;

    const totalCostDualGasDiscounted = totalMileage * costDualGasDiscounted_Km;
    const totalCostDualDiscounted = totalCostDualDiesel + totalCostDualGasDiscounted;
    const totalSavingsDiscounted = totalCostDiesel - totalCostDualDiscounted;

    const monthsDivider = val(inputs.months) || 1;

    setSummary({
      dieselOnlyTotal: Math.round(totalCostDiesel),
      dualTotal: Math.round(totalCostDual),
      dualDieselPart: Math.round(totalCostDualDiesel),
      dualGasPart: Math.round(totalCostDualGas),
      savings: Math.round(totalSavings),
      costPerKmDiesel: costDieselOnly_Km,
      costPerKmDual: costDualTotal_Km,
      monthlySavings: Math.round(totalSavings / monthsDivider),
      dualTotalDiscounted: Math.round(totalCostDualDiscounted),
      dualGasPartDiscounted: Math.round(totalCostDualGasDiscounted),
      savingsDiscounted: Math.round(totalSavingsDiscounted),
      monthlySavingsDiscounted: Math.round(totalSavingsDiscounted / monthsDivider),
      qtyDieselOnly_100: parseFloat(qtyDieselOnly_100.toFixed(1)),
      qtyDualDiesel_100: parseFloat(qtyDualDiesel_100.toFixed(1)),
      qtyDualGas_100: parseFloat(qtyDualGas_100.toFixed(1))
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (value === '') {
        setInputs(prev => ({ ...prev, [name]: '' }));
        return;
    }

    let finalValue = parseFloat(value);
    
    if (!isNaN(finalValue) && name === 'substitutionRate') {
      if (finalValue > 100) finalValue = 100;
      if (finalValue < 0) finalValue = 0;
    }

    setInputs(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (num) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num);
  };
  
  const getVal = (val) => val === '' ? 0 : val;

  const isLng = systemType === 'lng';
  const gasName = isLng ? 'СПГ (LNG)' : 'КПГ (CNG)';
  const gasUnit = isLng ? 'кг' : 'м³';
  
  // Расчет процентов для диаграммы
  const dieselPercent = summary.dualTotal > 0 ? (summary.dualDieselPart / summary.dualTotal) * 100 : 0;
  const gasPercent = summary.dualTotal > 0 ? (summary.dualGasPart / summary.dualTotal) * 100 : 0;

  const themeStyles = {
    text: isLng ? 'text-blue-600' : 'text-green-600',
    textDark: isLng ? 'text-blue-900' : 'text-green-900',
    bg: isLng ? 'bg-blue-50' : 'bg-green-50',
    border: isLng ? 'border-blue-200' : 'border-green-200',
    ring: isLng ? 'focus:ring-blue-500' : 'focus:ring-green-500',
    gradient: isLng ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700',
    button: isLng ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
    subtleBg: isLng ? 'bg-blue-50/50' : 'bg-green-50/50',
    separatorBg: isLng ? 'bg-blue-900' : 'bg-green-900', 
  };

  const printStyles = `
    @media print {
      @page {
        size: A4;
        margin: 5mm;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        background-color: white !important;
        font-size: 11px;
      }
      .print-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        zoom: 0.9;
      }
      .print-hidden {
        display: none !important;
      }
      .bg-gradient-to-br {
        background: ${isLng ? 'linear-gradient(to bottom right, #2563eb, #1d4ed8)' : 'linear-gradient(to bottom right, #16a34a, #15803d)'} !important;
      }
      .break-inside-avoid {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  `;

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4">
        <style>{printStyles}</style>
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl w-full animate-fade-in">
            <div className="text-center mb-6"> 
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Калькулятор Эффективности</h1> 
              <p className="text-lg text-slate-600">Выберите тип оборудования</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> 
              <div onClick={() => setSystemType('cng')} className={`cursor-pointer group relative p-6 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${systemType === 'cng' ? 'border-green-500 bg-white shadow-lg ring-4 ring-green-500/10' : 'border-slate-200 bg-white hover:border-green-300'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${systemType === 'cng' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 group-hover:bg-green-50 group-hover:text-green-500'}`}><Gauge className="w-8 h-8" /></div>
                  {systemType === 'cng' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Метан КПГ</h3>
                <p className="text-slate-500 text-sm">Компримированный газ (CNG)</p>
              </div>
              <div onClick={() => setSystemType('lng')} className={`cursor-pointer group relative p-6 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${systemType === 'lng' ? 'border-blue-500 bg-white shadow-lg ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${systemType === 'lng' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}><Flame className="w-8 h-8" /></div>
                  {systemType === 'lng' && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Метан СПГ</h3>
                <p className="text-slate-500 text-sm">Сжиженный газ (LNG)</p>
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-3 px-10 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-slate-900/20">Начать расчет <ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
        <footer className="text-center text-slate-400 text-xs py-2 flex items-center justify-center gap-1">
          <Copyright className="w-3 h-3" />
          <span>ООО "Элитгаз". Все права защищены.</span>
        </footer>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4">
        <style>{printStyles}</style>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full">
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center gap-3 mb-3 w-full text-left group hover:opacity-80 transition-opacity"
              >
                  <div className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-500 shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                  <h1 className="text-lg font-bold text-slate-900">Ввод параметров</h1>
              </button>

              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5">
                <div className="space-y-4">
                  
                  {/* Дизель */}
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                    <div className="flex items-center gap-2 mb-2 text-red-800 font-bold uppercase tracking-wide border-b border-red-200 pb-1 text-sm">
                      <Fuel className="w-4 h-4 text-red-600" /> Дизель (Базовый)
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-red-900/70">Расход (л/100км)</label>
                        <input type="number" name="dieselConsumption" value={inputs.dieselConsumption} onChange={handleInputChange} className="w-20 px-2 py-1 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bold text-right text-red-900 text-sm" />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-red-900/70">Стоимость (₽/л)</label>
                        <input type="number" name="dieselPrice" value={inputs.dieselPrice} onChange={handleInputChange} className="w-20 px-2 py-1 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bold text-right text-red-900 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Газ */}
                  <div className={`p-3 rounded-2xl border ${themeStyles.bg} ${themeStyles.border}`}>
                    <div className={`flex items-center gap-2 mb-2 text-sm font-bold uppercase tracking-wide border-b ${themeStyles.border} pb-1 ${themeStyles.textDark}`}>
                      {isLng ? <Flame className="w-4 h-4" /> : <Gauge className="w-4 h-4" />} {gasName}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className={`text-xs font-semibold ${themeStyles.textDark}`}>Коэф. расхода</label>
                        <input type="number" step="0.001" name={isLng ? "lngCoefficient" : "cngCoefficient"} value={isLng ? inputs.lngCoefficient : inputs.cngCoefficient} onChange={handleInputChange} className={`w-20 px-2 py-1 bg-white border rounded-lg outline-none font-bold text-right text-sm ${themeStyles.border} ${themeStyles.ring} ${themeStyles.textDark}`} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <label className={`text-xs font-semibold ${themeStyles.textDark}`}>Стоимость (₽/{gasUnit})</label>
                        <input type="number" step="0.1" name={isLng ? "lngPrice" : "cngPrice"} value={isLng ? inputs.lngPrice : inputs.cngPrice} onChange={handleInputChange} className={`w-20 px-2 py-1 bg-white border rounded-lg outline-none font-bold text-right text-sm ${themeStyles.border} ${themeStyles.ring} ${themeStyles.textDark}`} />
                      </div>
                    </div>
                  </div>

                  {/* Общие (низ) */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Пробег (км/мес)</label>
                        <input type="number" name="monthlyMileage" value={inputs.monthlyMileage} onChange={handleInputChange} className={`w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg outline-none font-bold text-sm ${themeStyles.ring}`} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">% замещения ДТ</label>
                        <input type="number" name="substitutionRate" min="0" max="100" value={inputs.substitutionRate} onChange={handleInputChange} className={`w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg outline-none font-bold text-sm ${themeStyles.ring}`} />
                      </div>
                  </div>

                  <button onClick={() => setStep(3)} className={`w-full flex items-center justify-center gap-2 text-white text-base font-bold py-2.5 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg ${themeStyles.button}`}>
                    Рассчитать экономию <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
          </div>
        </div>
        <footer className="text-center text-slate-400 text-sm py-4 flex items-center justify-center gap-1">
          <Copyright className="w-4 h-4" />
          <span>ООО "Элитгаз". Все права защищены.</span>
        </footer>
      </div>
    );
  }

  // --- ЭКРАН 3: РЕЗУЛЬТАТЫ ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-2 md:p-8 relative flex flex-col justify-between">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto w-full print-container">
        
        <header className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-2 print-hidden">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(2)} className="group flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors font-medium text-sm"><ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Назад</button>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium"><Printer className="w-4 h-4" /> Печать</button>
          </div>
        </header>

        {/* Контейнер отчета */}
        <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm relative overflow-hidden">
            
            <div className="relative z-10">
                <div className="mb-2 md:mb-4 text-center border-b border-slate-100 pb-2">
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900 leading-none">Отчет по эффективности газодизеля</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-4 mb-2 md:mb-4 print:shadow-none print:border print:mb-2 print:p-2 break-inside-avoid">
                    <h3 className="text-sm md:text-base font-bold text-slate-800 mb-2 flex items-center gap-2 leading-none">
                        <FileText className="w-4 h-4 text-slate-500" />
                        Исходные данные для расчета
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-1.5 md:gap-3 text-xs print:gap-2">
                        <div className="p-1.5 md:p-2 bg-slate-50 rounded-lg border border-slate-200">
                            {/* УВЕЛИЧЕННЫЕ ШРИФТЫ */}
                            <div className="text-slate-500 text-xs md:text-sm mb-0.5 leading-none">Пробег в месяц</div>
                            <div className="font-bold text-slate-900 text-sm md:text-lg leading-none">{getVal(inputs.monthlyMileage).toLocaleString()} км</div>
                        </div>
                        <div className="p-1.5 md:p-2 bg-slate-50 rounded-lg border border-red-100">
                            <div className="text-red-800/60 text-xs md:text-sm mb-0.5 leading-none">Расход Дизеля (Норма)</div>
                            <div className="font-bold text-red-900 text-sm md:text-lg leading-none">{getVal(inputs.dieselConsumption)} л/100км</div>
                        </div>
                        <div className="p-1.5 md:p-2 bg-slate-50 rounded-lg border border-red-100">
                            <div className="text-red-800/60 text-xs md:text-sm mb-0.5 leading-none">Цена ДТ</div>
                            <div className="font-bold text-red-900 text-sm md:text-lg leading-none">{getVal(inputs.dieselPrice)} ₽/л</div>
                        </div>

                        <div className={`p-1.5 md:p-2 rounded-lg ${themeStyles.subtleBg} border ${themeStyles.border}`}>
                            <div className={`${themeStyles.textDark} text-xs md:text-sm mb-0.5 leading-none`}>Процент замещения</div>
                            <div className={`font-bold ${themeStyles.textDark} text-sm md:text-lg leading-none`}>{getVal(inputs.substitutionRate)}% Газ</div>
                        </div>
                        
                        <div className={`p-1.5 md:p-2 rounded-lg border ${themeStyles.border} ${themeStyles.bg} flex items-center justify-between`}>
                            <div>
                                <div className={`${themeStyles.textDark} opacity-60 text-xs md:text-sm mb-0.5 leading-none`}>Коэффициент</div>
                                <div className={`font-bold ${themeStyles.textDark} text-sm md:text-lg leading-none`}>{systemType === 'lng' ? getVal(inputs.lngCoefficient) : getVal(inputs.cngCoefficient)}</div>
                            </div>
                            <div className={`w-px h-6 ${isLng ? 'bg-blue-200' : 'bg-green-200'}`}></div>
                            <div className="text-right">
                                <div className={`${themeStyles.textDark} opacity-60 text-xs md:text-sm mb-0.5 leading-none`}>Расход Газа</div>
                                <div className={`font-bold ${themeStyles.textDark} text-sm md:text-lg leading-none`}>
                                    {((getVal(inputs.dieselConsumption) * getVal(inputs.substitutionRate) / 100) * (systemType === 'lng' ? getVal(inputs.lngCoefficient) : getVal(inputs.cngCoefficient))).toFixed(1)} {gasUnit}/100км
                                </div>
                            </div>
                        </div>

                        <div className={`p-1.5 md:p-2 rounded-lg border ${themeStyles.border} ${themeStyles.bg}`}>
                            <div className={`${themeStyles.textDark} opacity-60 text-xs md:text-sm mb-0.5 leading-none`}>Цена {gasName}</div>
                            <div className={`font-bold ${themeStyles.textDark} text-sm md:text-lg leading-none`}>{systemType === 'lng' ? getVal(inputs.lngPrice) : getVal(inputs.cngPrice)} ₽/{gasUnit}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 md:space-y-4 print:space-y-3">
                    <div className={`grid grid-cols-1 ${!isLng ? 'md:grid-cols-2 print:grid-cols-2' : ''} gap-2 md:gap-4 items-stretch break-inside-avoid print:gap-3`}>
                        
                        {/* КАРТОЧКА: Базовый расчет */}
                        <div className={`bg-gradient-to-br ${themeStyles.gradient} text-white p-3 md:p-4 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between h-full print:p-4`}>
                            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                            {isLng ? <Flame size={200} /> : <Gauge size={200} />}
                            </div>
                            
                            <div className="relative z-10 flex-1">
                                <h2 className="text-base md:text-xl font-bold text-white mb-1 md:mb-2 leading-tight">Базовый расчет</h2>
                                <div className="flex items-center gap-1.5 bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-medium w-fit mb-2 md:mb-3 backdrop-blur-sm leading-none">
                                    <Fuel className="w-3 h-3" />
                                    Стандартные условия
                                </div>

                                <div className="text-sm md:text-lg text-white/80 font-medium mb-0.5 md:mb-1 leading-none">Итоговая экономия</div>
                                <div className="text-3xl md:text-5xl font-bold tracking-tight mb-2 md:mb-3 leading-none">{formatMoney(summary.savings)}</div>
                            </div>
                            
                            <div className="relative z-10 flex gap-2 flex-wrap">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm border border-white/10 leading-none">
                                <Wallet className="w-3 h-3" />
                                <span>{formatMoney(summary.monthlySavings)} в месяц</span>
                                </div>
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm border border-white/10 leading-none">
                                <TrendingDown className="w-3 h-3" />
                                <span>- {((summary.savings / summary.dieselOnlyTotal) * 100).toFixed(1)}% расходов</span>
                                </div>
                            </div>
                        </div>

                        {!isLng && (
                        <div className="bg-white rounded-2xl shadow-lg relative overflow-hidden border border-blue-200 p-3 md:p-4 flex flex-col justify-between h-full print:p-4">
                            <div className="relative z-10 flex-1">
                                <h2 className="text-base md:text-xl font-bold text-blue-900 mb-1 md:mb-2 leading-tight">Программа ООО "ГГМТ"</h2>
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-medium w-fit mb-2 md:mb-3 leading-none">
                                    <Tag className="w-3 h-3" />
                                    Скидка на метан 20%
                                </div>
                                
                                <div className="text-sm md:text-lg text-slate-600 font-medium mb-0.5 md:mb-1 leading-none">Итоговая экономия со скидкой</div>
                                <div className="text-3xl md:text-5xl font-bold tracking-tight text-blue-900 mb-2 md:mb-3 leading-none">{formatMoney(summary.savingsDiscounted)}</div>
                            </div>
                            
                            <div className="relative z-10 flex gap-2 flex-wrap">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 bg-blue-50 rounded-full text-[10px] text-blue-800 border border-blue-100 leading-none">
                                <Wallet className="w-3 h-3" />
                                <span>{formatMoney(summary.monthlySavingsDiscounted)} в месяц</span>
                                </div>
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 bg-blue-50 rounded-full text-[10px] text-blue-800 border border-blue-100 leading-none">
                                <TrendingDown className="w-3 h-3" />
                                <span>- {((summary.savingsDiscounted / summary.dieselOnlyTotal) * 100).toFixed(1)}% расходов</span>
                                </div>
                            </div>
                        </div>
                        )}

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-2 md:gap-4 print:gap-3 break-inside-avoid">
                        
                        {/* КАРТОЧКА: ТОЛЬКО ДИЗЕЛЬ */}
                        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-3 relative overflow-hidden print:p-3">
                            <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-bl-full -mr-4 -mt-4 md:-mr-6 md:-mt-6 z-0"></div>
                            <h3 className="text-sm md:text-xl font-bold text-red-900 mb-2 relative z-10 flex items-center gap-1.5 md:gap-2 leading-none">
                                <Fuel className="w-4 h-4 md:w-5 md:h-5" />
                                Только Дизель (100%)
                            </h3>
                            
                            <div className="space-y-1 relative z-10">
                                
                                {/* Ряд 1: Расход */}
                                <div className="flex justify-between items-end border-b border-red-100 pb-1 h-9 md:h-12">
                                    <span className="text-red-900/60 text-xs md:text-sm leading-none mb-0.5 whitespace-nowrap">Расход топлива на 100км</span>
                                    <span className="text-base md:text-xl font-bold text-red-900 leading-none">{summary.qtyDieselOnly_100} л</span>
                                </div>

                                {/* Ряд 2: Стоимость 1 км */}
                                <div className="flex justify-between items-end border-b border-red-100 pb-1 h-10 md:h-14">
                                    <span className="text-red-900/60 text-xs md:text-sm leading-none mb-0.5">Стоимость 1 км</span>
                                    <div className="text-right">
                                        <span className="text-base md:text-xl font-bold text-red-900 leading-none block">{summary.costPerKmDiesel.toFixed(2)} ₽</span>
                                        <span className="text-[10px] text-transparent block font-medium mt-0.5 leading-none">.</span>
                                    </div>
                                </div>

                                {/* Ряд 3: Затраты в месяц */}
                                <div className="flex justify-between items-end border-b border-red-100 pb-1 h-9 md:h-12">
                                    <span className="text-red-900/60 text-xs md:text-sm leading-none mb-0.5">Затраты в месяц</span>
                                    <span className="text-base md:text-xl font-bold text-red-900 leading-none">{formatMoney(summary.dieselOnlyTotal / inputs.months)}</span>
                                </div>

                                {/* Ряд 4: Итого */}
                                <div className="flex justify-between items-end pt-1 h-9 md:h-12">
                                    <span className="text-red-900/60 text-xs md:text-sm font-medium leading-none mb-0.5">ИТОГО за период</span>
                                    <span className="text-lg md:text-4xl font-bold text-red-900 leading-none">{formatMoney(summary.dieselOnlyTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* КАРТОЧКА: ГАЗОДИЗЕЛЬ */}
                        <div className={`bg-white rounded-2xl shadow-sm border ${themeStyles.border} p-3 relative overflow-hidden print:p-3`}>
                            <div className={`absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 ${themeStyles.bg} rounded-bl-full -mr-4 -mt-4 md:-mr-6 md:-mt-6 z-0`}></div>
                            <h3 className={`text-sm md:text-xl font-bold ${themeStyles.textDark} mb-2 relative z-10 flex items-center gap-1.5 md:gap-2 leading-none`}>
                                {isLng ? <Flame className="w-4 h-4 md:w-5 md:h-5" /> : <Gauge className="w-4 h-4 md:w-5 md:h-5" />}
                                Газодизель ({gasName})
                            </h3>
                            
                            <div className="space-y-1 relative z-10">
                                
                                {/* Ряд 1: Расход */}
                                <div className={`flex justify-between items-end border-b ${themeStyles.border} pb-1 h-9 md:h-12`}>
                                    <span className={`${themeStyles.textDark} opacity-60 text-xs md:text-sm leading-none mb-0.5 whitespace-nowrap`}>Расход топлива на 100км</span>
                                    <div className="flex items-center">
                                        <span className="text-base md:text-xl font-bold text-red-900 whitespace-nowrap leading-none">
                                            {summary.qtyDualDiesel_100} л
                                        </span>
                                        <div className={`h-6 w-px mx-2 ${themeStyles.separatorBg} opacity-20`}></div>
                                        <span className={`text-base md:text-xl font-bold ${themeStyles.textDark} whitespace-nowrap leading-none`}>
                                            {summary.qtyDualGas_100} {gasUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Ряд 2: Стоимость 1 км */}
                                <div className={`flex justify-between items-end border-b ${themeStyles.border} pb-1 h-10 md:h-14`}>
                                    <span className={`${themeStyles.textDark} opacity-60 text-xs md:text-sm leading-none mb-0.5`}>Стоимость 1 км</span>
                                    <div className="text-right">
                                        <span className={`text-base md:text-xl font-bold ${themeStyles.textDark} leading-none block`}>{summary.costPerKmDual.toFixed(2)} ₽</span>
                                        <span className="text-[9px] md:text-[10px] text-green-600 block font-medium mt-0.5 leading-none">Выгоднее на {(summary.costPerKmDiesel - summary.costPerKmDual).toFixed(2)} ₽</span>
                                    </div>
                                </div>

                                {/* Ряд 3: Затраты в месяц */}
                                <div className={`flex justify-between items-end border-b ${themeStyles.border} pb-1 h-9 md:h-12`}>
                                    <span className={`${themeStyles.textDark} opacity-60 text-xs md:text-sm leading-none mb-0.5`}>Затраты в месяц</span>
                                    <span className={`text-base md:text-xl font-bold ${themeStyles.textDark} leading-none`}>{formatMoney(summary.dualTotal / inputs.months)}</span>
                                </div>

                                {/* Ряд 4: Итого */}
                                <div className="flex justify-between items-end pt-1 h-9 md:h-12">
                                    <span className={`${themeStyles.textDark} opacity-60 text-xs md:text-sm font-medium leading-none mb-0.5`}>ИТОГО за период</span>
                                    <span className={`text-lg md:text-4xl font-bold ${themeStyles.textDark} leading-none`}>{formatMoney(summary.dualTotal)}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 print:p-3 break-inside-avoid">
                        <h4 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 leading-none">
                            <BarChart3 className="w-3 h-3" />
                            Структура затрат в газодизельном режиме (Без учета скидки)
                        </h4>
                        
                        <div className="flex h-8 md:h-10 rounded-lg overflow-hidden mb-1.5">
                            <div 
                                className="bg-red-500 flex items-center justify-center text-white font-bold text-xs md:text-base relative group" 
                                style={{ width: `${dieselPercent}%` }}
                            >
                                <span className="z-10 truncate px-2">Дизель</span>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div 
                                className={`${isLng ? 'bg-blue-600' : 'bg-green-600'} flex items-center justify-center text-white font-bold text-xs md:text-base relative group`} 
                                style={{ width: `${gasPercent}%` }}
                            >
                                <span className="z-10 truncate px-2">Газ</span>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between text-[10px] md:text-xs leading-none">
                            <div className="text-red-700 font-medium">
                                Дизельное топливо: {formatMoney(summary.dualDieselPart)} <span className="text-slate-400">({dieselPercent.toFixed(0)}%)</span>
                            </div>
                            <div className={`${themeStyles.text} font-medium`}>
                                {gasName}: {formatMoney(summary.dualGasPart)} <span className="text-slate-400">({gasPercent.toFixed(0)}%)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center pt-2">
                        <p className="text-slate-400 text-[10px] max-w-2xl text-center leading-tight">
                        * Расчет носит информационный характер. Реальная экономия зависит от фактического процента замещения, который может варьироваться в зависимости от нагрузки двигателя и манеры вождения.
                        </p>
                    </div>

                    {/* Moved Footer inside the report area */}
                    <div className="text-center text-slate-400 text-[10px] pt-3 flex items-center justify-center gap-1">
                        <Copyright className="w-3 h-3" />
                        <span>ООО "Элитгаз". Все права защищены.</span>
                    </div>

                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;