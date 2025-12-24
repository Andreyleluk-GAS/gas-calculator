import React, { useState, useEffect, useMemo } from 'react';
import { 
  Fuel, Flame, Gauge, ChevronLeft, ChevronRight, ArrowRight, 
  FileText, Wallet, BarChart3, Copyright, Tag, Printer, CheckCircle2, 
  TrendingDown, Truck, Settings2, Layers, Car, Settings
} from 'lucide-react';

const App = () => {
  // --- НАВИГАЦИЯ ---
  // view: 'MAIN' (выбор), 'TRUCK' (грузовой), 'PASSENGER' (легковой)
  const [view, setView] = useState('MAIN');
  const [step, setStep] = useState(1); // Для грузового
  const [systemType, setSystemType] = useState('cng'); // Для грузового

  // Синхронизация с кнопкой "Назад" браузера/телефона
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        setView(event.state.view || 'MAIN');
        setStep(event.state.step || 1);
      } else {
        setView('MAIN');
        setStep(1);
      }
    };
    window.addEventListener('popstate', handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ view: 'MAIN', step: 1 }, "");
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView, newStep = 1) => {
    setView(newView);
    setStep(newStep);
    window.history.pushState({ view: newView, step: newStep }, "");
  };

  // --- СОСТОЯНИЕ ГРУЗОВОГО ТС (Version 1) ---
  const [truckInputs, setTruckInputs] = useState({
    dieselConsumption: 36, dieselPrice: 75,
    lngCoefficient: 0.86, lngPrice: 45,
    cngCoefficient: 1.2, cngPrice: 28,
    monthlyMileage: 12000, substitutionRate: 60      
  });

  const [remotInputs, setRemotInputs] = useState({
    dieselConsumption: 22, dieselPrice: 75,
    lngCoefficient: 0.86, lngPrice: 45,
    cngCoefficient: 1.2, cngPrice: 28,
    monthlyMileage: 12000
  });

  const [truckSubMode, setTruckSubMode] = useState('GAS_DIESEL'); // 'GAS_DIESEL' или 'REMOT'

  // --- СОСТОЯНИЕ ЛЕГКОВОГО ТС (Passenger) ---
  const [passInputs, setPassInputs] = useState({
    mileage: 1600,
    fuelNorm: 10,
    priceBenzin: 61.20,
    pricePropane: 32.80,
    priceMethane: 26.50
  });
  const [passCoeffs, setPassCoeffs] = useState({ propane: 1.2, methane: 0.9 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Определение текущей даты
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }, []);

  const handleTruckInputChange = (e, isRemot = false) => {
    const { name, value } = e.target;
    if (isRemot) setRemotInputs(prev => ({ ...prev, [name]: value }));
    else setTruckInputs(prev => ({ ...prev, [name]: value }));
  };

  const handlePassInputChange = (e) => {
    setPassInputs(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));
  };

  const formatMoney = (num) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num || 0);

  // --- ЛОГИКА РАСЧЕТОВ ГРУЗОВОГО ---
  const truckSummary = useMemo(() => {
    const v = (val) => parseFloat(val) || 0;
    const isRem = truckSubMode === 'REMOT';
    const active = isRem ? remotInputs : truckInputs;
    
    // Общие параметры газа
    const gasCoef = systemType === 'lng' ? v(active.lngCoefficient) : v(active.cngCoefficient);
    const gasPrice = systemType === 'lng' ? v(active.lngPrice) : v(active.cngPrice);
    
    // Дизель
    const dCons = v(active.dieselConsumption);
    const dPrice = v(active.dieselPrice);
    const totalM = v(active.monthlyMileage) * 12;

    let qD_res, qG_res, costD, costG, costGDisc;

    if (!isRem) {
      // Газодизель
      const sub = v(truckInputs.substitutionRate) / 100;
      qD_res = dCons * (1 - sub);
      qG_res = (dCons * sub) * gasCoef;
      costD = (dCons * dPrice) / 100;
      costG = (qD_res * dPrice + qG_res * gasPrice) / 100;
      costGDisc = (qD_res * dPrice + qG_res * (gasPrice * 0.8)) / 100;
    } else {
      // Ремоторизация (100% замещение)
      qD_res = dCons;
      qG_res = dCons * gasCoef;
      costD = (dCons * dPrice) / 100;
      costG = (qG_res * gasPrice) / 100;
      costGDisc = (qG_res * (gasPrice * 0.8)) / 100;
    }

    return {
      totalD: Math.round(totalM * costD),
      totalG: Math.round(totalM * costG),
      savings: Math.round(totalM * (costD - costG)),
      savingsDiscounted: Math.round(totalM * (costD - costGDisc)),
      kmD: costD, kmG: costG,
      qD_base: dCons,
      qD_result: qD_res.toFixed(1),
      qG_result: qG_res.toFixed(1),
      monthlySav: Math.round((totalM * (costD - costG)) / 12),
      monthlySavDiscounted: Math.round((totalM * (costD - costGDisc)) / 12),
      gasCoef: gasCoef
    };
  }, [truckInputs, remotInputs, systemType, truckSubMode]);

  // --- ЛОГИКА РАСЧЕТОВ ЛЕГКОВОГО ---
  const passResults = useMemo(() => {
    const { mileage, fuelNorm, priceBenzin, pricePropane, priceMethane } = passInputs;
    const costB = (mileage / 100) * fuelNorm * priceBenzin;
    const costP = (mileage / 100) * (fuelNorm * passCoeffs.propane) * pricePropane;
    const costM = (mileage / 100) * (fuelNorm * passCoeffs.methane) * priceMethane;
    return {
      costB, costP, costM,
      saveYearP: (costB - costP) * 12,
      saveYearM: (costB - costM) * 12
    };
  }, [passInputs, passCoeffs]);

  // --- ТЕМЫ ---
  const isLng = systemType === 'lng';
  const gasName = isLng ? 'СПГ' : 'КПГ';
  const gasUnit = isLng ? 'кг' : 'м³';

  const truckTheme = {
    text: systemType === 'lng' ? 'text-blue-700' : 'text-green-700',
    textDark: systemType === 'lng' ? 'text-blue-900' : 'text-green-900',
    bg: systemType === 'lng' ? 'bg-blue-50' : 'bg-green-50',
    border: systemType === 'lng' ? 'border-blue-200' : 'border-green-200',
    button: systemType === 'lng' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
    gradient: systemType === 'lng' ? 'from-blue-600 to-blue-800' : 'from-green-600 to-green-800',
  };

  // --- РЕНДЕР: ГЛАВНЫЙ ЭКРАН ---
  if (view === 'MAIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-4xl w-full text-center">
          <div className="mb-10">
            <div className="inline-flex p-4 bg-white rounded-3xl shadow-sm border border-slate-200 mb-6">
               <Flame className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Экономия на метане</h1>
            <p className="text-slate-700 text-lg max-w-xl mx-auto font-medium">Рассчитайте выгоду перехода на природный газ для вашего транспортного средства</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigateTo('TRUCK')}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center"
            >
              <Truck className="w-12 h-12 text-slate-700 mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold mb-2">Для грузового ТС</span>
              <p className="text-slate-600 text-sm">Газодизель и Ремоторизация</p>
            </button>
            <button 
              onClick={() => navigateTo('PASSENGER')}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center"
            >
              <Car className="w-12 h-12 text-slate-700 mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold mb-2">Для легкового ТС</span>
              <p className="text-slate-600 text-sm">Пропан и Метан (ГБО)</p>
            </button>
          </div>
          <footer className="mt-12 text-slate-400 text-sm flex items-center justify-center gap-2">
            <Copyright size={14} /> <span>ООО "ЭЛИТГАЗ"</span>
          </footer>
        </div>
      </div>
    );
  }

  // --- РЕНДЕР: ЛЕГКОВОЙ КАЛЬКУЛЯТОР ---
  if (view === 'PASSENGER') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-2 font-sans overflow-x-hidden">
        <div className="w-full max-w-lg lg:max-w-5xl flex flex-col gap-3">
          <header className="flex flex-col items-center text-center bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-slate-200 w-full relative">
            <button 
                onClick={() => navigateTo('MAIN')} 
                className="absolute left-3 top-3 p-2 text-slate-600 hover:bg-slate-50 rounded-full"
            >
                <ChevronLeft size={20} />
            </button>
            <div className="p-2 bg-slate-100 rounded-xl mb-2">
                <Car className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight">Топливный калькулятор</h1>
            <p className="text-slate-600 text-[10px] md:text-xs font-semibold mt-1">Данные на {currentDate} [Свердловскстат]</p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 uppercase mb-1 tracking-tight">Пробег в месяц (км)</label>
                <input type="number" name="mileage" value={passInputs.mileage} onChange={handlePassInputChange} className="w-full text-xl font-bold p-2 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 uppercase mb-1 tracking-tight">Расход бензина (л/100км)</label>
                <input type="number" name="fuelNorm" value={passInputs.fuelNorm} onChange={handlePassInputChange} className="w-full text-xl font-bold p-2 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full mb-3">
            {/* БЕНЗИН */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-amber-400">
                <div className="flex items-center gap-2 mb-3">
                    <Fuel size={18} className="text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase">Бензин</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">Цена/л</label>
                        <input type="number" name="priceBenzin" value={passInputs.priceBenzin} onChange={handlePassInputChange} className="w-20 bg-transparent text-right font-bold text-slate-900 outline-none" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Затраты в месяц</p>
                        <p className="text-2xl font-bold text-slate-900 leading-none">{formatMoney(passResults.costB)}</p>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-600 pt-2 border-t">Эталон сравнения</p>
                </div>
            </div>

            {/* ПРОПАН */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-emerald-500">
                <div className="flex items-center gap-2 mb-3">
                    <Flame size={18} className="text-emerald-500" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase">Пропан</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">Цена/л</label>
                        <input type="number" name="pricePropane" value={passInputs.pricePropane} onChange={handlePassInputChange} className="w-20 bg-transparent text-right font-bold text-slate-900 outline-none" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Затраты в месяц</p>
                        <p className="text-2xl font-bold text-emerald-700 leading-none">{formatMoney(passResults.costP)}</p>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-600 pt-2 border-t">Экономия в год: {formatMoney(passResults.saveYearP)}</p>
                </div>
            </div>

            {/* МЕТАН */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-blue-500">
                <div className="flex items-center gap-2 mb-3">
                    <Gauge size={18} className="text-blue-500" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase">Метан</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">Цена/м³</label>
                        <input type="number" name="priceMethane" value={passInputs.priceMethane} onChange={handlePassInputChange} className="w-20 bg-transparent text-right font-bold text-slate-900 outline-none" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Затраты в месяц</p>
                        <p className="text-2xl font-bold text-blue-700 leading-none">{formatMoney(passResults.costM)}</p>
                    </div>
                    <p className="text-[11px] font-bold text-blue-600 pt-2 border-t">Экономия в год: {formatMoney(passResults.saveYearM)}</p>
                </div>
            </div>
          </div>

          <footer className="flex flex-col items-center gap-2 py-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-700 font-semibold bg-white px-4 py-2 rounded-full border shadow-sm">
                <p>Коэф.: Пропан ×{passCoeffs.propane}, Метан ×{passCoeffs.methane}</p>
                <button onClick={() => setIsSettingsOpen(true)} className="p-1 hover:bg-slate-100 rounded-lg">
                    <Settings size={14} className="text-slate-800" />
                </button>
            </div>
            <p className="text-slate-800 text-[10px] font-bold opacity-60">ООО "ЭЛИТГАЗ" — 2025</p>
          </footer>
        </div>

        {/* MODAL SETTINGS */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-slate-900">
              <h2 className="text-xl font-bold mb-4">Настройки ГБО</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Коэффициент Пропан</label>
                  <input type="number" step="0.1" value={passCoeffs.propane} onChange={(e)=>setPassCoeffs({...passCoeffs, propane: parseFloat(e.target.value)||0})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Коэффициент Метан</label>
                  <input type="number" step="0.1" value={passCoeffs.methane} onChange={(e)=>setPassCoeffs({...passCoeffs, methane: parseFloat(e.target.value)||0})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
                </div>
                <button onClick={()=>setIsSettingsOpen(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-2 shadow-lg">Сохранить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- ЭКРАН: ГРУЗОВОЙ (STEP 1) ---
  if (view === 'TRUCK' && step === 1) {
    const isRem = truckSubMode === 'REMOT';
    const activeInp = isRem ? remotInputs : truckInputs;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-2 font-sans text-slate-900">
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
          <button onClick={() => navigateTo('MAIN')} className="flex items-center gap-1 mb-4 self-start text-slate-700 font-bold text-sm"><ChevronLeft size={20} /> На главную</button>
          <h1 className="text-2xl font-bold mb-6 text-center uppercase tracking-tight font-sans">Грузовое ТС</h1>
          
          <div className="bg-white rounded-[2rem] shadow-xl p-4 md:p-6 w-full border border-slate-200">
            <div className="space-y-4">
              {/* Вкладки Режим */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                  <button onClick={()=>setTruckSubMode('GAS_DIESEL')} className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${truckSubMode==='GAS_DIESEL'?'bg-white text-slate-900 shadow-sm':'text-slate-500'}`}>Газодизель</button>
                  <button onClick={()=>setTruckSubMode('REMOT')} className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${truckSubMode==='REMOT'?'bg-white text-slate-900 shadow-sm':'text-slate-500'}`}>Ремоторизация</button>
              </div>
              {/* Вкладки Газ */}
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>setSystemType('cng')} className={`py-3 border-2 rounded-2xl text-[10px] font-bold uppercase transition-all ${systemType==='cng'?'border-green-500 bg-green-50 text-green-900 shadow-sm':'border-slate-100 text-slate-400'}`}>КПГ Метан</button>
                  <button onClick={()=>setSystemType('lng')} className={`py-3 border-2 rounded-2xl text-[10px] font-bold uppercase transition-all ${systemType==='lng'?'border-blue-500 bg-blue-50 text-blue-900 shadow-sm':'border-slate-100 text-slate-400'}`}>СПГ Метан</button>
              </div>

              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-2 mb-3 text-red-900 font-bold uppercase text-[10px]"><Fuel size={14}/> Дизельное топливо</div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[10px] font-bold text-red-900/60 uppercase block mb-1">Расход (л/100км)</label>
                          <input type="number" name="dieselConsumption" value={activeInp.dieselConsumption} onChange={(e)=>handleTruckInputChange(e, isRem)} className="w-full p-2 bg-white rounded-xl font-bold border border-red-100 outline-none shadow-inner" />
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-red-900/60 uppercase block mb-1">Цена (₽/л)</label>
                          <input type="number" name="dieselPrice" value={activeInp.dieselPrice} onChange={(e)=>handleTruckInputChange(e, isRem)} className="w-full p-2 bg-white rounded-xl font-bold border border-red-100 outline-none shadow-inner" />
                      </div>
                  </div>
              </div>

              <div className={`p-4 rounded-2xl border ${truckTheme.bg} ${truckTheme.border}`}>
                  <div className={`flex items-center gap-2 mb-3 ${truckTheme.textDark} font-bold uppercase text-[10px]`}><Flame size={14}/> Параметры газа</div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[10px] font-bold opacity-60 uppercase block mb-1">Цена (₽/{gasUnit})</label>
                          <input type="number" name={systemType==='lng'?'lngPrice':'cngPrice'} value={systemType==='lng'?activeInp.lngPrice:activeInp.cngPrice} onChange={(e)=>handleTruckInputChange(e, isRem)} className="w-full p-2 bg-white rounded-xl font-bold border-none outline-none shadow-inner" />
                      </div>
                      <div>
                          <label className="text-[10px] font-bold opacity-60 uppercase block mb-1">Коэф. расхода</label>
                          <input type="number" step="0.01" name={systemType==='lng'?'lngCoefficient':'cngCoefficient'} value={systemType==='lng'?activeInp.lngCoefficient:activeInp.cngCoefficient} onChange={(e)=>handleTruckInputChange(e, isRem)} className="w-full p-2 bg-white rounded-xl font-bold border-none outline-none shadow-inner" />
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="text-[10px] font-bold text-slate-800 uppercase block mb-1 tracking-tight">Пробег (км/мес)</label>
                      <input type="number" name="monthlyMileage" value={activeInp.monthlyMileage} onChange={(e)=>handleTruckInputChange(e, isRem)} className="w-full p-3 border border-slate-300 rounded-xl font-bold" />
                  </div>
                  {!isRem && (
                    <div>
                        <label className="text-[10px] font-bold text-slate-800 uppercase block mb-1 tracking-tight">% замещения ДТ</label>
                        <input type="number" name="substitutionRate" value={truckInputs.substitutionRate} onChange={(e)=>handleTruckInputChange(e, false)} className="w-full p-3 border border-slate-300 rounded-xl font-bold text-blue-700" />
                    </div>
                  )}
              </div>

              <button onClick={() => navigateTo('TRUCK', 2)} className={`w-full py-4 rounded-2xl text-white font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all ${truckTheme.button}`}>Показать отчет</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ГРУЗОВОЙ: ШАГ 3 (ОТЧЕТ) ---
  if (globalView === 'TRUCK' && truckStep === 2) {
    return (
      <div className="min-h-screen bg-slate-50 p-1.5 md:p-8 font-sans text-slate-900 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <header className="mb-2 md:mb-4 flex items-center justify-between print-hidden">
            <button onClick={() => navigateTo('TRUCK', 1)} className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm"><ChevronLeft size={16} /> Назад</button>
            <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 shadow-sm"><Printer size={16} /> Печать</button>
          </header>

          <div className="bg-white p-3 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-3 md:mb-8 text-center border-b border-slate-100 pb-2 md:pb-6 font-sans">
                <h1 className="text-sm md:text-2xl font-bold text-slate-900 uppercase tracking-tight leading-tight">
                  {truckSubMode === 'REMOT' ? (
                      `Отчет: Ремоторизация (100% ${systemType === 'cng' ? 'КПГ Метан' : 'СПГ Метан'})`
                  ) : (
                      `Отчет: Газодизель (ДТ ${100 - truckInputs.substitutionRate}% + ${systemType === 'cng' ? 'КПГ Метан' : 'СПГ Метан'} ${truckInputs.substitutionRate}%)`
                  )}
                </h1>
                <p className="text-[8px] md:text-xs text-slate-700 mt-1 font-semibold uppercase">Период расчета: 12 месяцев</p>
              </div>

              {/* СЕТКА ПЛАШЕК */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-3 mb-3 md:mb-8 text-slate-900">
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold">Пробег</div><div className="font-bold text-[10px] md:text-base">{(truckSubMode === 'REMOT' ? remotInputs.monthlyMileage : truckInputs.monthlyMileage).toLocaleString()} км/мес</div></div>
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold">Расход ДТ</div><div className="font-bold text-[10px] md:text-base">{truckSummary.qD_base} л/100км</div></div>
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold">Цена ДТ</div><div className="font-bold text-[10px] md:text-base">{truckSubMode === 'REMOT' ? remotInputs.dieselPrice : truckInputs.dieselPrice} ₽</div></div>
                <div className={`p-2 md:p-3 rounded-xl border ${truckTheme.border} ${truckTheme.bg}`}><div className={`${truckTheme.textDark} text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold`}>Цена {gasName}</div><div className={`font-bold ${truckTheme.textDark} text-[10px] md:text-base`}>{systemType === 'lng' ? (truckSubMode === 'REMOT' ? remotInputs.lngPrice : truckInputs.lngPrice) : (truckSubMode === 'REMOT' ? remotInputs.cngPrice : truckInputs.cngPrice)} ₽</div></div>
                <div className="hidden md:block p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold tracking-tight">Коэф. расхода</div><div className="font-bold text-[10px] md:text-base">{truckSummary.gasCoef}</div></div>
              </div>

              {/* ГЛАВНЫЕ КАРТОЧКИ */}
              <div className={`grid grid-cols-1 ${systemType === 'cng' ? 'md:grid-cols-2' : ''} gap-2 md:gap-6 mb-3 md:mb-8`}>
                <div className={`bg-gradient-to-br ${truckTheme.gradient} text-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl flex flex-row justify-between relative overflow-hidden`}>
                  <div className="relative z-10 flex flex-col justify-between w-2/3 md:w-3/4">
                    <div><div className="text-[9px] md:text-xs font-bold uppercase tracking-wider opacity-90">Экономия (Базовый)</div><div className="text-xl md:text-5xl font-bold mb-2 md:mb-4 leading-tight">{formatMoney(truckSummary.savings)}</div></div>
                    <div className="flex gap-2 md:gap-3 flex-wrap">
                        <div className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase">{formatMoney(truckSummary.monthlySav)} / мес</div>
                        <div className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase">- {Math.round((truckSummary.savings / (truckSummary.totalD || 1)) * 100)}% затрат</div>
                    </div>
                  </div>
                  <div className="absolute right-[10px] top-[10px] bottom-[10px] flex items-center justify-end w-2/5 md:w-1/3">
                     <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain object-right select-none" style={{ mixBlendMode: 'luminosity', opacity: 0.45, filter: 'grayscale(1) contrast(1.3) brightness(1.2)', pointerEvents: 'none' }} onError={(e)=>{e.target.style.display='none'}} />
                  </div>
                </div>

                {systemType === 'cng' && (
                  <div className="bg-white border-2 border-blue-100 p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg flex flex-col justify-between relative overflow-hidden text-slate-900">
                    <div className="absolute top-0 right-0 p-1.5 md:p-3 bg-blue-700 text-white rounded-bl-xl md:rounded-bl-3xl font-bold text-[8px] md:text-[10px] uppercase z-20">Программа ГГМТ</div>
                    <div className="relative z-10 w-2/3 md:w-3/4">
                        <div className="mt-2">
                            <div className="text-[9px] md:text-xs font-bold text-slate-700 mb-0.5 md:mb-1 flex items-center gap-1 uppercase tracking-wider font-sans"><Tag size={10} className="text-blue-600 font-sans" /> Со скидкой на метан 20%</div>
                            <div className="text-xl md:text-5xl font-bold text-blue-900 mb-2 md:mb-4 leading-tight font-sans">{formatMoney(truckSummary.savingsDiscounted)}</div>
                        </div>
                        <div className="flex gap-2 md:gap-3 flex-wrap">
                            <div className="bg-blue-50 text-blue-900 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold border border-blue-200 uppercase font-sans">{formatMoney(truckSummary.monthlySavDiscounted)} / мес</div>
                            <div className="bg-blue-50 text-blue-900 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold border border-blue-200 uppercase font-sans">- {Math.round((truckSummary.savingsDiscounted / (truckSummary.totalD || 1)) * 100)}% затрат</div>
                        </div>
                    </div>
                    <div className="absolute right-[10px] bottom-[10px] flex items-end justify-end pointer-events-none select-none max-h-[35%] w-2/5">
                        <img src="/logoGGMT.png" alt="GGMT" className="h-auto max-h-full w-auto object-contain object-right-bottom" style={{ opacity: 0.5 }} onError={(e)=>{e.target.style.display='none'}} />
                    </div>
                  </div>
                )}
              </div>

              {/* ДЕТАЛИЗАЦИЯ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mb-3 md:mb-8 font-sans">
                <div className="border border-red-200 rounded-xl md:rounded-[2rem] p-3 md:p-6 bg-red-50/30">
                  <div className="text-red-900 font-bold text-[10px] md:text-xs uppercase mb-2 md:mb-4 flex items-center gap-2"><Fuel size={14}/> На дизеле (100%)</div>
                  <div className="space-y-1.5 md:space-y-3">
                    <div className="flex justify-between text-[10px] md:text-sm font-bold opacity-80"><span>Расход на 100км:</span><span>{truckSummary.qD_base} л</span></div>
                    <div className="flex justify-between text-[10px] md:text-sm font-bold opacity-80"><span>Стоимость 1 км:</span><span>{truckSummary.kmD?.toFixed(2)} ₽</span></div>
                    <div className="border-t border-red-200 pt-2 md:pt-3 flex justify-between font-bold text-red-700 text-sm md:text-2xl leading-none">
                      <span className="text-[8px] md:text-xs uppercase self-center font-bold text-red-600 tracking-tighter">ИТОГО ЗА ГОД:</span>
                      <span className="font-black text-red-800">{formatMoney(truckSummary.totalD)}</span>
                    </div>
                  </div>
                </div>

                <div className={`border ${truckTheme.border} rounded-xl md:rounded-[2rem] p-3 md:p-6 ${truckTheme.bg}/30`}>
                  <div className={`${truckTheme.textDark} font-bold text-[10px] md:text-xs uppercase mb-2 md:mb-4 flex items-center gap-2`}>
                    {systemType === 'lng' ? <Flame size={14}/> : <Gauge size={14}/>} 
                    {truckSubMode === 'REMOT' ? `На газе (${gasName} 100%)` : `Газодизель (${truckInputs.substitutionRate}% замещения)`}
                  </div>
                  <div className="space-y-1.5 md:space-y-3">
                    <div className="flex justify-between text-[10px] md:text-sm font-bold opacity-80"><span>На 100км:</span><span>{truckSubMode === 'REMOT' ? `${truckSummary.qG_result} ${gasUnit}` : `${truckSummary.qD_result}л + ${truckSummary.qG_result}${gasUnit}`}</span></div>
                    <div className="flex justify-between text-[10px] md:text-sm font-bold opacity-80"><span>Стоимость 1 км:</span><span>{truckSummary.kmG?.toFixed(2)} ₽</span></div>
                    <div className={`border-t ${truckTheme.border} pt-2 md:pt-3 flex justify-between font-bold ${truckTheme.textDark} text-sm md:text-2xl leading-none`}>
                      <span className="text-[8px] md:text-xs uppercase self-center font-bold tracking-tighter">ИТОГО ЗА ГОД:</span>
                      <span className="font-black">{formatMoney(truckSummary.totalG)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 p-3 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-200">
                <h4 className="text-[8px] md:text-[10px] font-bold text-slate-800 uppercase mb-2 md:mb-6 flex items-center gap-2 tracking-widest font-sans"><BarChart3 size={12}/> Структура затрат</h4>
                <div className="h-6 md:h-10 w-full bg-slate-300 rounded-lg md:rounded-2xl overflow-hidden flex shadow-inner">
                  {truckSubMode === 'REMOT' ? (
                    <div className={`${truckTheme.button} h-full w-full`}></div>
                  ) : (
                    <>
                      <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${(100 - truckInputs.substitutionRate)}%` }}></div>
                      <div className={`${truckTheme.button} h-full transition-all duration-1000`} style={{ width: `${truckInputs.substitutionRate}%` }}></div>
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-[8px] md:text-[10px] font-bold uppercase tracking-tight">
                  {truckSubMode === 'REMOT' ? (
                    <span className={`${truckTheme.textDark} font-bold`}>100% {gasName} Метан</span>
                  ) : (
                    <>
                      <span className="text-red-700 font-bold">ДИЗЕЛЬ: {formatMoney(truckSummary.totalG * (1 - truckInputs.substitutionRate/100))}</span>
                      <span className={`${truckTheme.textDark} font-bold`}>{gasName}: {formatMoney(truckSummary.totalG * (truckInputs.substitutionRate/100))}</span>
                    </>
                  )}
                </div>
              </div>

              <footer className="mt-4 md:mt-10 text-center text-[8px] md:text-[10px] text-slate-800 font-bold flex items-center justify-center gap-2 opacity-80">
                <Copyright size={10} /> <span>ООО "ЭЛИТГАЗ" — 2025. Расчет носит справочный характер.</span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
