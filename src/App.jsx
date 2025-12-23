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

  // --- ЛОГИКА РАСЧЕТОВ (ГАЗОДИЗЕЛЬ) ---
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
    }
  }, [inputs, systemType, view]);

  // --- ЛОГИКА РЕМОТОРИЗАЦИИ ---
  useEffect(() => {
    if (view === 'REMOT') {
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
  }, [remotInputs, systemType, view]);

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
    text: systemType === 'lng' ? 'text-blue-600' : 'text-green-600',
    textDark: systemType === 'lng' ? 'text-blue-900' : 'text-green-900',
    bg: systemType === 'lng' ? 'bg-blue-50' : 'bg-green-50',
    border: systemType === 'lng' ? 'border-blue-200' : 'border-green-200',
    ring: systemType === 'lng' ? 'focus:ring-blue-500' : 'focus:ring-green-500',
    button: systemType === 'lng' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
    gradient: systemType === 'lng' ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700',
  };

  const gasName = systemType === 'lng' ? 'СПГ' : 'КПГ';
  const gasUnit = systemType === 'lng' ? 'кг' : 'м³';

  // --- ЭКРАН 1: ГЛАВНЫЙ ---
  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Выберите тип расчета</h1>
            <p className="text-slate-500 font-medium">Экономическая эффективность использования метана на ТС</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => navigateTo('GAS_DIESEL')}
              className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl group relative overflow-hidden flex flex-col"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Settings2 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-sans">Газодизельный режим</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Расчет экономии при частичном замещении дизельного топлива природным газом (Метаном).
              </p>
              <div className="mt-auto flex items-center text-blue-600 font-bold text-sm uppercase tracking-wider">
                Открыть калькулятор <ChevronRight size={18} className="ml-1" />
              </div>
            </div>

            <div 
              onClick={() => navigateTo('REMOT')}
              className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-amber-400 cursor-pointer transition-all hover:shadow-xl group relative overflow-hidden flex flex-col"
            >
              <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <Truck size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-sans text-slate-800">Ремоторизация ТС</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Расчет при полной замене дизельного двигателя на газовый (100% работа на метане).
              </p>
              <div className="mt-auto flex items-center text-amber-600 font-bold text-sm uppercase tracking-wider">
                Открыть калькулятор <ChevronRight size={18} className="ml-1" />
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
      <div className="min-h-screen bg-slate-50 flex flex-col p-4 font-sans">
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
          <button 
            onClick={() => navigateTo('HOME')} 
            className="flex items-center gap-2 mb-6 self-start text-slate-400 hover:text-slate-800 transition-colors font-medium text-sm"
          >
            <ChevronLeft size={18} /> На главную
          </button>

          <h1 className="text-xl font-bold text-slate-900 mb-8 text-center uppercase tracking-tight">
            {isRem ? 'Ремоторизация ТС' : 'Газодизель ТС'}
          </h1>

          <div className="bg-white rounded-[2rem] shadow-xl p-6 w-full border border-slate-200">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSystemType('cng')}
                  className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all uppercase ${systemType === 'cng' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-slate-100 text-slate-400'}`}
                >КПГ (Метан)</button>
                <button 
                  onClick={() => setSystemType('lng')}
                  className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all uppercase ${systemType === 'lng' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 text-slate-400'}`}
                >СПГ (Метан)</button>
              </div>

              {/* ДИЗЕЛЬ */}
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-center gap-2 mb-4 text-red-800 font-bold uppercase text-[10px]">
                  <Fuel size={14} /> Дизельное топливо
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-red-900/50 mb-1 uppercase">Расход (л/100км)</label>
                    <input 
                      type="number" name="dieselConsumption" 
                      value={currentInputs.dieselConsumption} 
                      onChange={(e) => handleInputChange(e, isRem)}
                      className="w-full p-3 bg-white border border-red-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-red-900/40 mb-1 uppercase">Цена (₽/л)</label>
                    <input 
                      type="number" name="dieselPrice" 
                      value={currentInputs.dieselPrice} 
                      onChange={(e) => handleInputChange(e, isRem)}
                      className="w-full p-3 bg-white border border-red-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                </div>
              </div>

              {/* ГАЗ */}
              <div className={`p-4 rounded-2xl border ${themeStyles.bg} ${themeStyles.border}`}>
                <div className={`flex items-center gap-2 mb-4 ${themeStyles.textDark} font-bold uppercase text-[10px]`}>
                  <Flame size={14} /> Параметры газа
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] font-semibold ${themeStyles.textDark} opacity-50 mb-1 uppercase`}>Цена (₽/{gasUnit})</label>
                    <input 
                      type="number" 
                      name={systemType === 'lng' ? 'lngPrice' : 'cngPrice'} 
                      value={systemType === 'lng' ? currentInputs.lngPrice : currentInputs.cngPrice} 
                      onChange={(e) => handleInputChange(e, isRem)}
                      className={`w-full p-3 bg-white border rounded-xl font-bold text-sm outline-none focus:ring-2 ${themeStyles.ring}`} 
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold ${themeStyles.textDark} opacity-50 mb-1 uppercase`}>Коэф. расхода</label>
                    <input 
                      type="number" step="0.01"
                      name={systemType === 'lng' ? 'lngCoefficient' : 'cngCoefficient'} 
                      value={systemType === 'lng' ? currentInputs.lngCoefficient : currentInputs.cngCoefficient} 
                      onChange={(e) => handleInputChange(e, isRem)}
                      className={`w-full p-3 bg-white border rounded-xl font-bold text-sm outline-none focus:ring-2 ${themeStyles.ring}`} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Средний пробег (км/мес)</label>
                  <input type="number" name="monthlyMileage" value={currentInputs.monthlyMileage} onChange={(e) => handleInputChange(e, isRem)} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-sm" />
                </div>
                {!isRem && (
                  <div className="w-full">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">% замещения ДТ</label>
                    <input type="number" name="substitutionRate" value={inputs.substitutionRate} onChange={(e) => handleInputChange(e, false)} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-sm text-blue-600" />
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigateTo(view, 2)}
                className={`w-full py-4 rounded-2xl text-white text-base font-bold shadow-lg transition-all active:scale-95 uppercase tracking-wider ${themeStyles.button}`}
              >Рассчитать экономию</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ЭКРАН 3: РЕЗУЛЬТАТЫ ---
  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-4 flex items-center justify-between print-hidden">
          <button onClick={() => navigateTo(view, 1)} className="flex items-center gap-1 px-4 py-2 bg-white border rounded-xl text-xs font-bold text-slate-500 shadow-sm">
            <ChevronLeft size={16} /> Назад
          </button>
          <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-5 py-2 bg-white border rounded-xl text-sm font-bold text-slate-700 shadow-sm">
            <Printer size={16} /> Печать
          </button>
        </header>

        <div className="bg-white p-4 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="mb-8 text-center border-b border-slate-50 pb-6">
            <h1 className="text-lg md:text-2xl font-bold text-slate-900 uppercase tracking-tight">
              {view === 'REMOT' ? (
                  `Отчет: Ремоторизация (100% ${systemType === 'cng' ? 'КПГ Метан' : 'СПГ Метан'})`
              ) : (
                  `Отчет: Газодизельный режим (ДТ ${100 - inputs.substitutionRate}% + ${systemType === 'cng' ? 'КПГ Метан' : 'СПГ Метан'} ${inputs.substitutionRate}%)`
              )}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 mt-2 font-medium">Период расчета: 12 месяцев</p>
          </div>

          {/* СЕТКА ПЛАШЕК */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase mb-1 font-medium">Пробег</div>
              <div className="font-bold text-slate-900 text-xs md:text-base">{(view === 'REMOT' ? remotInputs.monthlyMileage : inputs.monthlyMileage).toLocaleString()} км/мес</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase mb-1 font-medium">Расход ДТ</div>
              <div className="font-bold text-slate-900 text-xs md:text-base">{summary.qD_100} л/100км</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase mb-1 font-medium">Цена ДТ</div>
              <div className="font-bold text-slate-900 text-xs md:text-base">{view === 'REMOT' ? remotInputs.dieselPrice : inputs.dieselPrice} ₽</div>
            </div>
            <div className={`p-3 rounded-2xl border ${themeStyles.border} ${themeStyles.bg}`}>
              <div className={`${themeStyles.textDark} text-[10px] opacity-60 uppercase mb-1 font-medium`}>Цена {gasName}</div>
              <div className={`font-bold ${themeStyles.textDark} text-xs md:text-base`}>
                {systemType === 'lng' ? (view === 'REMOT' ? remotInputs.lngPrice : inputs.lngPrice) : (view === 'REMOT' ? remotInputs.cngPrice : inputs.cngPrice)} ₽
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="text-slate-400 text-[10px] uppercase mb-1 font-medium tracking-tight">Коэф. расхода</div>
               <div className="font-bold text-slate-900 text-xs md:text-base">{summary.gasCoef}</div>
            </div>
          </div>

          {/* ГЛАВНЫЕ КАРТОЧКИ ЭКОНОМИИ */}
          <div className={`grid grid-cols-1 ${systemType === 'cng' ? 'md:grid-cols-2' : ''} gap-6 mb-8`}>
            <div className={`bg-gradient-to-br ${themeStyles.gradient} text-white p-8 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden`}>
               <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4"><TrendingDown size={200}/></div>
               <div className="relative z-10">
                  <div className="text-xs font-medium opacity-80 mb-1 uppercase tracking-wider">Экономия (Базовый расчет)</div>
                  <div className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{formatMoney(summary.savings)}</div>
               </div>
               <div className="relative z-10 flex gap-3 flex-wrap">
                  <div className="bg-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase">
                    {formatMoney(summary.monthlySav)} / мес
                  </div>
                  <div className="bg-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase">
                    - {Math.round((summary.savings / (summary.totalD || 1)) * 100)}% затрат
                  </div>
               </div>
            </div>

            {systemType === 'cng' && (
              <div className="bg-white border-2 border-blue-50 p-8 rounded-[2rem] shadow-lg flex flex-col justify-between relative overflow-hidden font-sans">
                 <div className="absolute top-0 right-0 p-3 bg-blue-600 text-white rounded-bl-3xl font-bold text-[10px] uppercase">Программа ГГМТ</div>
                 <div>
                    <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider"><Tag size={12} className="text-blue-500" /> Со скидкой на метан 20%</div>
                    <div className="text-3xl md:text-5xl font-bold text-blue-900 mb-4 leading-tight">{formatMoney(summary.savingsDiscounted)}</div>
                 </div>
                 <div className="flex gap-3 flex-wrap">
                    <div className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-blue-100 uppercase">
                      {formatMoney(summary.monthlySavDiscounted)} / мес
                    </div>
                    <div className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-blue-100 uppercase">
                      - {Math.round((summary.savingsDiscounted / (summary.totalD || 1)) * 100)}% затрат
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-red-100 rounded-[2rem] p-6 bg-red-50/20">
              <div className="text-red-800 font-bold text-xs uppercase mb-4 flex items-center gap-2"><Fuel size={14}/> На дизеле (100%)</div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-slate-400 font-medium uppercase text-[10px]">Расход на 100км:</span>
                  <span className="font-bold text-red-900">{summary.qD_100} л</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-slate-400 font-medium uppercase text-[10px]">Стоимость 1 км:</span>
                  <span className="font-bold text-red-900">{summary.kmD?.toFixed(2)} ₽</span>
                </div>
                <div className="border-t border-red-100 pt-3 flex justify-between font-bold text-red-600 text-base md:text-2xl leading-none">
                  <span className="text-xs uppercase self-center opacity-60">ИТОГО ЗА ГОД:</span>
                  <span>{formatMoney(summary.totalD)}</span>
                </div>
              </div>
            </div>

            <div className={`border ${themeStyles.border} rounded-[2rem] p-6 ${themeStyles.bg}/20`}>
              <div className={`${themeStyles.textDark} font-bold text-xs uppercase mb-4 flex items-center gap-2`}>
                {systemType === 'lng' ? <Flame size={14}/> : <Gauge size={14}/>} 
                {view === 'REMOT' ? `На газе (${gasName} 100%)` : `Газодизель (${inputs.substitutionRate}% замещения)`}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-slate-400 font-medium uppercase text-[10px]">Расход на 100км:</span>
                  <span className={`font-bold ${themeStyles.textDark}`}>
                    {view === 'REMOT' ? `${summary.qG_100} ${gasUnit}` : `${summary.qDualD_100}л + ${summary.qDualG_100}${gasUnit}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-slate-400 font-medium uppercase text-[10px]">Стоимость 1 км:</span>
                  <span className={`font-bold ${themeStyles.textDark}`}>{summary.kmG?.toFixed(2)} ₽</span>
                </div>
                <div className={`border-t ${themeStyles.border} pt-3 flex justify-between font-bold ${themeStyles.textDark} text-base md:text-2xl leading-none`}>
                  <span className="text-xs uppercase self-center opacity-60">ИТОГО ЗА ГОД:</span>
                  <span>{formatMoney(summary.totalG)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem]">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <BarChart3 size={14}/> Доля затрат в {view === 'REMOT' ? 'газовом' : 'газодизельном'} режиме
            </h4>
            <div className="h-10 w-full bg-slate-200 rounded-2xl overflow-hidden flex shadow-inner">
              {view === 'REMOT' ? (
                <div className={`${themeStyles.button} h-full transition-all duration-1000`} style={{ width: '100%' }}></div>
              ) : (
                <>
                  <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(100 - inputs.substitutionRate)}%` }}></div>
                  <div className={`${themeStyles.button} h-full transition-all duration-1000`} style={{ width: `${inputs.substitutionRate}%` }}></div>
                </>
              )}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-tight">
              {view === 'REMOT' ? (
                 <span className={themeStyles.text}>100% {gasName} Метан</span>
              ) : (
                <>
                  <span className="text-red-600">ДИЗЕЛЬ: {formatMoney(summary.totalG * (1 - inputs.substitutionRate/100))}</span>
                  <span className={themeStyles.text}>{gasName}: {formatMoney(summary.totalG * (inputs.substitutionRate/100))}</span>
                </>
              )}
            </div>
          </div>

          <footer className="mt-10 text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-2 opacity-60">
            <Copyright size={12} /> <span>ООО "ЭЛИТГАЗ" — 2025. Расчет носит справочный характер.</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
