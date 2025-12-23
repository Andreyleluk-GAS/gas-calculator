import React, { useState, useEffect } from 'react';
import { 
  Fuel, Flame, Gauge, ChevronLeft, ChevronRight, ArrowRight, 
  FileText, Wallet, BarChart3, Copyright, Tag, Printer, CheckCircle2, 
  TrendingDown, Truck, Settings2, Layers 
} from 'lucide-react';

const App = () => {
  // Навигация: HOME, GAS_DIESEL, REMOT
  const [view, setView] = useState('HOME');
  const [step, setStep] = useState(1);
  const [systemType, setSystemType] = useState('cng'); 

  // --- ПОДДЕРЖКА КНОПКИ "НАЗАД" НА ТЕЛЕФОНЕ ---
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        setView(event.state.view);
        setStep(event.state.step);
      } else {
        setView('HOME');
        setStep(1);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView, newStep = 1) => {
    setView(newView);
    setStep(newStep);
    window.history.pushState({ view: newView, step: newStep }, "");
  };

  // --- СОСТОЯНИЕ ДАННЫХ ---
  const [inputs, setInputs] = useState({
    dieselConsumption: 36,    
    dieselPrice: 75,          
    lngCoefficient: 0.86,    
    lngPrice: 45,           
    cngCoefficient: 1.2,      
    cngPrice: 28,           
    monthlyMileage: 12000,    
    substitutionRate: 60      
  });

  const [remotInputs, setRemotInputs] = useState({
    dieselConsumption: 22,
    dieselPrice: 75,
    lngCoefficient: 0.86,
    lngPrice: 45,
    cngCoefficient: 1.2,
    cngPrice: 28,
    monthlyMileage: 12000
  });

  const [summary, setSummary] = useState({});
  const CALC_MONTHS = 12; 

  // --- ЛОГИКА РАСЧЕТОВ ---
  useEffect(() => {
    if (view === 'GAS_DIESEL') {
      const v = (val) => parseFloat(val) || 0;
      const subRate = v(inputs.substitutionRate) / 100;
      const gasCoef = systemType === 'lng' ? v(inputs.lngCoefficient) : v(inputs.cngCoefficient);
      const gasPrice = systemType === 'lng' ? v(inputs.lngPrice) : v(inputs.cngPrice);
      const gasPriceDiscounted = gasPrice * 0.8; 

      const qDiesel_100 = v(inputs.dieselConsumption);
      const qDualD_100 = qDiesel_100 * (1 - subRate);
      const qDualG_100 = (qDiesel_100 * subRate) * gasCoef;

      const costKmD = (qDiesel_100 * v(inputs.dieselPrice)) / 100;
      const costKmDual = ((qDualD_100 * v(inputs.dieselPrice)) + (qDualG_100 * gasPrice)) / 100;
      const costKmDualDiscounted = ((qDualD_100 * v(inputs.dieselPrice)) + (qDualG_100 * gasPriceDiscounted)) / 100;

      const totalM = v(inputs.monthlyMileage) * CALC_MONTHS;
      const totalCostD = totalM * costKmD;
      const totalCostDual = totalM * costKmDual;
      const totalCostDualDiscounted = totalM * costKmDualDiscounted;

      setSummary({
        totalD: Math.round(totalCostD),
        totalG: Math.round(totalCostDual),
        totalGDiscounted: Math.round(totalCostDualDiscounted),
        savings: Math.round(totalCostD - totalCostDual),
        savingsDiscounted: Math.round(totalCostD - totalCostDualDiscounted),
        kmD: costKmD,
        kmG: costKmDual,
        kmGDiscounted: costKmDualDiscounted,
        qD_100: qDiesel_100,
        qDualD_100: qDualD_100.toFixed(1),
        qDualG_100: qDualG_100.toFixed(1),
        monthlySav: Math.round((totalCostD - totalCostDual) / CALC_MONTHS),
        monthlySavDiscounted: Math.round((totalCostD - totalCostDualDiscounted) / CALC_MONTHS),
        gasCoef: gasCoef
      });
    } else if (view === 'REMOT') {
      const v = (val) => parseFloat(val) || 0;
      const dCons = v(remotInputs.dieselConsumption);
      const gasCoef = systemType === 'lng' ? v(remotInputs.lngCoefficient) : v(remotInputs.cngCoefficient);
      const gasPrice = systemType === 'lng' ? v(remotInputs.lngPrice) : v(remotInputs.cngPrice);
      const gasPriceDiscounted = gasPrice * 0.8;

      const qD_100 = dCons;
      const qG_100 = dCons * gasCoef;

      const costKmD = (qD_100 * v(remotInputs.dieselPrice)) / 100;
      const costKmG = (qG_100 * gasPrice) / 100;
      const costKmGDiscounted = (qG_100 * gasPriceDiscounted) / 100;

      const totalM = v(remotInputs.monthlyMileage) * CALC_MONTHS;
      const totalCostD = totalM * costKmD;
      const totalCostG = totalM * costKmG;
      const totalCostGDiscounted = totalM * costKmGDiscounted;

      setSummary({
        totalD: Math.round(totalCostD),
        totalG: Math.round(totalCostG),
        totalGDiscounted: Math.round(totalCostGDiscounted),
        savings: Math.round(totalCostD - totalCostG),
        savingsDiscounted: Math.round(totalCostD - totalCostGDiscounted),
        kmD: costKmD,
        kmG: costKmG,
        kmGDiscounted: costKmGDiscounted,
        qD_100: qD_100,
        qG_100: qG_100.toFixed(1),
        monthlySav: Math.round((totalCostD - totalCostG) / CALC_MONTHS),
        monthlySavDiscounted: Math.round((totalCostD - totalCostGDiscounted) / CALC_MONTHS),
        gasCoef: gasCoef
      });
    }
  }, [inputs, remotInputs, systemType, view]);

  const handleInputChange = (e, isRemot = false) => {
    const { name, value } = e.target;
    if (isRemot) {
      setRemotInputs(prev => ({ ...prev, [name]: value }));
    } else {
      setInputs(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatMoney = (num) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num || 0);

  const themeStyles = {
    text: systemType === 'lng' ? 'text-blue-700' : 'text-green-700',
    textDark: systemType === 'lng' ? 'text-blue-900' : 'text-green-900',
    bg: systemType === 'lng' ? 'bg-blue-50' : 'bg-green-50',
    border: systemType === 'lng' ? 'border-blue-200' : 'border-green-200',
    ring: systemType === 'lng' ? 'focus:ring-blue-500' : 'focus:ring-green-500',
    button: systemType === 'lng' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
    gradient: systemType === 'lng' ? 'from-blue-600 to-blue-800' : 'from-green-600 to-green-800',
  };

  const gasName = systemType === 'lng' ? 'СПГ' : 'КПГ';
  const gasUnit = systemType === 'lng' ? 'кг' : 'м³';

  // --- ЭКРАН 1: ГЛАВНЫЙ ---
  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2 font-sans text-slate-900">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-4 md:mb-10">
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-slate-900">Выберите тип расчета</h1>
            <p className="text-slate-700 font-medium text-xs md:text-base">Эффективность использования метана на ТС</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <div 
              onClick={() => navigateTo('GAS_DIESEL')}
              className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-300 hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl group flex flex-col"
            >
              <div className="bg-blue-100 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-700 mb-3 md:mb-6 group-hover:scale-105 transition-transform">
                <Settings2 className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-3 text-slate-900">Газодизельный режим</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                Частичное замещение дизеля метаном.
              </p>
              <div className="mt-auto flex items-center text-blue-700 font-bold text-xs md:text-sm">
                Открыть калькулятор <ChevronRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => navigateTo('REMOT')}
              className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-300 hover:border-amber-400 cursor-pointer transition-all hover:shadow-xl group flex flex-col"
            >
              <div className="bg-amber-100 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-700 mb-3 md:mb-6 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-3 text-slate-900">Ремоторизация ТС</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                Полная замена двигателя на газовый (100% газ).
              </p>
              <div className="mt-auto flex items-center text-amber-700 font-bold text-xs md:text-sm">
                Открыть калькулятор <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ЭКРАН 2: ВВОД ДАННЫХ ---
  if (step === 1) {
    const isRem = view === 'REMOT';
    const currentInputs = isRem ? remotInputs : inputs;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-2 font-sans text-slate-900">
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
          <button 
            onClick={() => navigateTo('HOME')} 
            className="flex items-center gap-1 mb-2 md:mb-6 self-start text-slate-700 hover:text-slate-900 transition-colors font-semibold text-xs"
          >
            <ChevronLeft size={16} /> На главную
          </button>

          <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-8 text-center uppercase tracking-tight font-sans">
            {isRem ? 'Ремоторизация ТС' : 'Газодизель ТС'}
          </h1>

          <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl p-4 md:p-6 w-full border border-slate-200">
            <div className="space-y-3 md:space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSystemType('cng')}
                  className={`py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold border-2 transition-all uppercase ${systemType === 'cng' ? 'border-green-500 bg-green-50 text-green-800 shadow-sm' : 'border-slate-200 text-slate-500'}`}
                >КПГ (Метан)</button>
                <button 
                  onClick={() => setSystemType('lng')}
                  className={`py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold border-2 transition-all uppercase ${systemType === 'lng' ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-200 text-slate-500'}`}
                >СПГ (Метан)</button>
              </div>

              <div className="p-3 md:p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-2 mb-2 md:mb-4 text-red-900 font-bold uppercase text-[9px] md:text-[10px]">
                  <Fuel size={12} /> Дизельное топливо
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-red-900/70 mb-1 uppercase">Расход (л/100км)</label>
                    <input 
                      type="number" name="dieselConsumption" 
                      value={currentInputs.dieselConsumption} 
                      onChange={(e) => handleInputChange(e, isRem)}
                      className="w-full p-2 md:p-3 bg-white border border-red-100 rounded-lg md:rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-red-900/70 mb-1 uppercase">Цена (₽/л)</label>
                    <input 
                      type="number" name="dieselPrice" 
                      value={currentInputs.dieselPrice} 
                      onChange={(e) => handleInputChange(e, isRem)}
                      className="w-full p-2 md:p-3 bg-white border border-red-100 rounded-lg md:rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                </div>
              </div>

              <div className={`p-3 md:p-4 rounded-xl border ${themeStyles.bg} ${themeStyles.border}`}>
                <div className={`flex items-center gap-2 mb-2 md:mb-4 ${themeStyles.textDark} font-bold uppercase text-[9px] md:text-[10px]`}>
                  <Flame size={12} /> Параметры газа
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[9px] font-bold ${themeStyles.textDark} mb-1 uppercase`}>Цена (₽/{gasUnit})</label>
                    <input 
                      type="number" 
                      name={systemType === 'lng' ? 'lngPrice' : 'cngPrice'} 
                      value={systemType === 'lng' ? currentInputs.lngPrice : currentInputs.cngPrice} 
                      onChange={(e) => handleInputChange(e, isRem)}
                      className={`w-full p-2 md:p-3 bg-white border rounded-lg md:rounded-xl font-bold text-sm outline-none focus:ring-2 ${themeStyles.ring}`} 
                    />
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold ${themeStyles.textDark} mb-1 uppercase`}>Коэф. расхода</label>
                    <input 
                      type="number" step="0.01"
                      name={systemType === 'lng' ? 'lngCoefficient' : 'cngCoefficient'} 
                      value={systemType === 'lng' ? currentInputs.lngCoefficient : currentInputs.cngCoefficient} 
                      onChange={(e) => handleInputChange(e, isRem)}
                      className={`w-full p-2 md:p-3 bg-white border rounded-lg md:rounded-xl font-bold text-sm outline-none focus:ring-2 ${themeStyles.ring}`} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="w-full">
                  <label className="block text-[9px] font-bold text-slate-700 mb-1 uppercase tracking-tight">Средний пробег (км/мес)</label>
                  <input type="number" name="monthlyMileage" value={currentInputs.monthlyMileage} onChange={(e) => handleInputChange(e, isRem)} className="w-full p-2 md:p-3 border border-slate-300 rounded-lg md:rounded-xl font-bold text-sm" />
                </div>
                {!isRem && (
                  <div className="w-full">
                    <label className="block text-[9px] font-bold text-slate-700 mb-1 uppercase tracking-tight">% замещения ДТ</label>
                    <input type="number" name="substitutionRate" value={inputs.substitutionRate} onChange={(e) => handleInputChange(e, false)} className="w-full p-2 md:p-3 border border-slate-300 rounded-lg md:rounded-xl font-bold text-sm text-blue-800" />
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigateTo(view, 2)}
                className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl text-white text-sm md:text-base font-bold shadow-lg transition-all active:scale-95 uppercase tracking-wider ${themeStyles.button}`}
              >Рассчитать экономию</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ЭКРАН 3: РЕЗУЛЬТАТЫ ---
  return (
    <div className="min-h-screen bg-slate-50 p-1.5 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-2 md:mb-4 flex items-center justify-between print-hidden">
          <button onClick={() => navigateTo(view, 1)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-[10px] md:text-xs font-bold text-slate-700 shadow-sm">
            <ChevronLeft size={14} /> Назад
          </button>
          <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 shadow-sm">
            <Printer size={16} /> Печать
          </button>
        </header>

        <div className="bg-white p-3 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
          
          <div className="relative z-10">
            <div className="mb-3 md:mb-8 text-center border-b border-slate-100 pb-2 md:pb-6 font-sans">
              <h1 className="text-sm md:text-2xl font-bold text-slate-900 uppercase tracking-tight leading-tight">
                {view === 'REMOT' ? (
                    `Отчет: Ремоторизация (100% ${systemType === 'cng' ? 'КПГ Метан' : 'СПГ Метан'})`
                ) : (
                    `Отчет: Газодизельный режим (ДТ ${100 - inputs.substitutionRate}% + ${systemType === 'cng' ? 'КПГ Метан' : 'СПГ Метан'} ${inputs.substitutionRate}%)`
                )}
              </h1>
              <p className="text-[8px] md:text-xs text-slate-700 mt-1 font-semibold uppercase font-sans">Период расчета: 12 месяцев</p>
            </div>

            {/* СЕТКА ПЛАШЕК */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-3 mb-3 md:mb-8 text-slate-900">
              <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-slate-900">
                <div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold font-sans">Пробег</div>
                <div className="font-bold text-[10px] md:text-base font-sans">{(view === 'REMOT' ? remotInputs.monthlyMileage : inputs.monthlyMileage).toLocaleString()} км/мес</div>
              </div>
              <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-slate-900">
                <div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold font-sans">Расход ДТ</div>
                <div className="font-bold text-[10px] md:text-base font-sans">{summary.qD_100} л/100км</div>
              </div>
              <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-slate-900">
                <div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold font-sans">Цена ДТ</div>
                <div className="font-bold text-[10px] md:text-base font-sans">{view === 'REMOT' ? remotInputs.dieselPrice : inputs.dieselPrice} ₽</div>
              </div>
              <div className={`p-2 md:p-3 rounded-xl border ${themeStyles.border} ${themeStyles.bg} font-sans`}>
                <div className={`${themeStyles.textDark} text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold font-sans`}>Цена {gasName}</div>
                <div className={`font-bold ${themeStyles.textDark} text-[10px] md:text-base font-sans`}>
                  {systemType === 'lng' ? (view === 'REMOT' ? remotInputs.lngPrice : inputs.lngPrice) : (view === 'REMOT' ? remotInputs.cngPrice : inputs.cngPrice)} ₽
                </div>
              </div>
              {/* СКРЫТА НА МОБИЛЬНЫХ */}
              <div className="hidden md:block p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-slate-900">
                <div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold tracking-tight font-sans">Коэф. расхода</div>
                <div className="font-bold text-[10px] md:text-base font-sans">{summary.gasCoef}</div>
              </div>
            </div>

            {/* ГЛАВНЫЕ КАРТОЧКИ ЭКОНОМИИ */}
            <div className={`grid grid-cols-1 ${systemType === 'cng' ? 'md:grid-cols-2' : ''} gap-2 md:gap-6 mb-3 md:mb-8 font-sans`}>
              
              {/* КАРТОЧКА: БАЗОВЫЙ РАСЧЕТ С ЛОГОТИПОМ */}
              <div className={`bg-gradient-to-br ${themeStyles.gradient} text-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl flex flex-row justify-between relative overflow-hidden font-sans`}>
                
                {/* Левая часть с текстом */}
                <div className="relative z-10 flex flex-col justify-between w-2/3 md:w-3/4 font-sans text-white">
                  <div>
                      <div className="text-[9px] md:text-xs font-bold uppercase tracking-wider opacity-90 font-sans">Экономия (Базовый расчет)</div>
                      <div className="text-xl md:text-5xl font-bold mb-2 md:mb-4 leading-tight font-sans">{formatMoney(summary.savings)}</div>
                  </div>
                  <div className="flex gap-2 md:gap-3 flex-wrap">
                      <div className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase font-sans">
                        {formatMoney(summary.monthlySav)} / мес
                      </div>
                      <div className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase font-sans">
                        - {Math.round((summary.savings / (summary.totalD || 1)) * 100)}% затрат
                      </div>
                  </div>
                </div>

                {/* Правая часть: logo.png с авто-масштабированием и отступами 10px */}
                <div className="absolute right-[10px] top-[10px] bottom-[10px] flex items-center justify-end w-2/5 md:w-1/3">
                   <img 
                      src="/logo.png" 
                      alt="Company Logo" 
                      className="h-full w-auto object-contain object-right select-none"
                      style={{ 
                        mixBlendMode: 'luminosity', 
                        opacity: 0.45,
                        filter: 'grayscale(1) contrast(1.3) brightness(1.2)',
                        pointerEvents: 'none'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }} 
                   />
                </div>
              </div>

              {systemType === 'cng' && (
                <div className="bg-white border-2 border-blue-100 p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg flex flex-col justify-between relative overflow-hidden font-sans text-slate-900">
                  {/* Контент: Текст и цифры */}
                  <div className="relative z-10 w-2/3 md:w-3/4">
                      <div className="absolute -top-4 -left-4 md:-top-8 md:-left-8 p-1.5 md:p-3 bg-blue-700 text-white rounded-br-xl md:rounded-br-3xl font-bold text-[8px] md:text-[10px] uppercase">Программа ГГМТ</div>
                      <div className="mt-2">
                          <div className="text-[9px] md:text-xs font-bold text-slate-700 mb-0.5 md:mb-1 flex items-center gap-1 uppercase tracking-wider font-sans"><Tag size={10} className="text-blue-600 font-sans" /> Со скидкой на метан 20%</div>
                          <div className="text-xl md:text-5xl font-bold text-blue-900 mb-2 md:mb-4 leading-tight font-sans">{formatMoney(summary.savingsDiscounted)}</div>
                      </div>
                      <div className="flex gap-2 md:gap-3 flex-wrap">
                          <div className="bg-blue-50 text-blue-900 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold border border-blue-200 uppercase font-sans">
                            {formatMoney(summary.monthlySavDiscounted)} / мес
                          </div>
                          <div className="bg-blue-50 text-blue-900 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold border border-blue-200 uppercase font-sans">
                            - {Math.round((summary.savingsDiscounted / (summary.totalD || 1)) * 100)}% затрат
                          </div>
                      </div>
                  </div>

                  {/* Логотип ГГМТ: позиционирование внизу справа с отступами 10px */}
                  <div className="absolute right-[10px] bottom-[10px] flex items-end justify-end pointer-events-none select-none max-h-[35%] w-2/5">
                      <img 
                        src="/logoGGMT.png" 
                        alt="GGMT Logo" 
                        className="h-auto max-h-full w-auto object-contain object-right-bottom"
                        style={{ 
                          mixBlendMode: 'luminosity', 
                          opacity: 0.35,
                          filter: 'grayscale(1) contrast(1.1) brightness(0.9)',
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mb-3 md:mb-8 font-sans text-slate-900">
              <div className="border border-red-200 rounded-xl md:rounded-[2rem] p-3 md:p-6 bg-red-50/30 font-sans text-slate-900">
                <div className="text-red-900 font-bold text-[10px] md:text-xs uppercase mb-2 md:mb-4 flex items-center gap-2 tracking-tighter font-sans"><Fuel size={12} className="font-sans" /> На дизеле (100%)</div>
                <div className="space-y-1.5 md:space-y-3 font-sans">
                  <div className="flex justify-between text-[10px] md:text-sm font-sans">
                    <span className="text-red-800 font-bold uppercase text-[8px] md:text-[10px] font-sans">Расход на 100км:</span>
                    <span className="font-bold text-red-900 font-sans">{summary.qD_100} л</span>
                  </div>
                  <div className="flex justify-between text-[10px] md:text-sm font-sans">
                    <span className="text-red-800 font-bold uppercase text-[8px] md:text-[10px] font-sans">Стоимость 1 км:</span>
                    <span className="font-bold text-red-900 font-sans">{summary.kmD?.toFixed(2)} ₽</span>
                  </div>
                  <div className="border-t border-red-200 pt-2 md:pt-3 flex justify-between font-bold text-red-700 text-sm md:text-2xl leading-none font-sans">
                    <span className="text-[8px] md:text-xs uppercase self-center font-bold text-red-600 font-sans">ИТОГО ЗА ГОД:</span>
                    <span className="font-black text-red-800 font-sans">{formatMoney(summary.totalD)}</span>
                  </div>
                </div>
              </div>

              <div className={`border ${themeStyles.border} rounded-xl md:rounded-[2rem] p-3 md:p-6 ${themeStyles.bg}/30 font-sans text-slate-900`}>
                <div className={`${themeStyles.textDark} font-bold text-[10px] md:text-xs uppercase mb-2 md:mb-4 flex items-center gap-2 tracking-tighter font-sans`}>
                  {systemType === 'lng' ? <Flame size={12} className="font-sans" /> : <Gauge size={12} className="font-sans" />} 
                  {view === 'REMOT' ? `На газе (${gasName} 100%)` : `Газодизель (${inputs.substitutionRate}% замещения)`}
                </div>
                <div className="space-y-1.5 md:space-y-3 font-sans">
                  <div className="flex justify-between text-[10px] md:text-sm font-sans">
                    <span className={`${themeStyles.textDark} font-bold uppercase text-[8px] md:text-[10px] font-sans`}>Расход на 100км:</span>
                    <span className={`font-bold ${themeStyles.textDark} font-sans`}>
                      {view === 'REMOT' ? `${summary.qG_100} ${gasUnit}` : `${summary.qDualD_100}л + ${summary.qDualG_100}${gasUnit}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] md:text-sm font-sans">
                    <span className={`${themeStyles.textDark} font-bold uppercase text-[8px] md:text-[10px] font-sans`}>Стоимость 1 км:</span>
                    <span className={`font-bold ${themeStyles.textDark} font-sans`}>{summary.kmG?.toFixed(2)} ₽</span>
                  </div>
                  <div className={`border-t ${themeStyles.border} pt-2 md:pt-3 flex justify-between font-bold ${themeStyles.textDark} text-sm md:text-2xl leading-none font-sans`}>
                    <span className="text-[8px] md:text-xs uppercase self-center font-bold font-sans">ИТОГО ЗА ГОД:</span>
                    <span className="font-black font-sans">{formatMoney(summary.totalG)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-3 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-200 font-sans text-slate-900">
              <h4 className="text-[8px] md:text-[10px] font-bold text-slate-800 uppercase mb-2 md:mb-6 flex items-center gap-2 tracking-widest font-sans">
                <BarChart3 size={12} className="font-sans" /> Доля затрат в {view === 'REMOT' ? 'газовом' : 'газодизельном'} режиме
              </h4>
              <div className="h-6 md:h-10 w-full bg-slate-300 rounded-lg md:rounded-2xl overflow-hidden flex shadow-inner font-sans">
                {view === 'REMOT' ? (
                  <div className={`${themeStyles.button} h-full transition-all duration-1000 font-sans`} style={{ width: '100%' }}></div>
                ) : (
                  <>
                    <div className="bg-red-600 h-full transition-all duration-1000 font-sans" style={{ width: `${(100 - inputs.substitutionRate)}%` }}></div>
                    <div className={`${themeStyles.button} h-full transition-all duration-1000 font-sans`} style={{ width: `${inputs.substitutionRate}%` }}></div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-2 text-[8px] md:text-[10px] font-bold uppercase tracking-tight font-sans">
                {view === 'REMOT' ? (
                  <span className={`${themeStyles.textDark} font-bold font-sans`}>100% {gasName} Метан</span>
                ) : (
                  <>
                    <span className="text-red-700 font-bold font-sans">ДИЗЕЛЬ: {formatMoney(summary.totalG * (1 - inputs.substitutionRate/100))}</span>
                    <span className={`${themeStyles.textDark} font-bold font-sans`}>{gasName}: {formatMoney(summary.totalG * (inputs.substitutionRate/100))}</span>
                  </>
                )}
              </div>
            </div>

            <footer className="mt-4 md:mt-10 text-center text-[8px] md:text-[10px] text-slate-800 font-bold flex items-center justify-center gap-2 opacity-80 font-sans">
              <Copyright size={10} className="font-sans" /> <span>ООО "ЭЛИТГАЗ" — 2025. Расчет носит справочный характер.</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
