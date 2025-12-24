import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Fuel, Flame, Gauge, ChevronLeft, ChevronRight, ArrowRight, 
  FileText, Wallet, BarChart3, Copyright, Tag, Printer, CheckCircle2, 
  TrendingDown, Truck, Settings2, Layers, Car, Settings, X, Phone, MapPin
} from 'lucide-react';

const App = () => {
  // --- ГЛОБАЛЬНОЕ СОСТОЯНИЕ НАВИГАЦИИ ---
  const [currentScreen, setCurrentScreen] = useState('MAIN_SELECTION');

  // --- СОСТОЯНИЯ ГРУЗОВОГО (ВЕРСИЯ 1) ---
  const [truckSubMode, setTruckSubMode] = useState('GAS_DIESEL'); 
  const [systemType, setSystemType] = useState('cng'); 
  
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

  // --- СОСТОЯНИЯ ЛЕГКОВОГО ---
  const [passInputs, setPassInputs] = useState({
    mileage: 1600,
    fuelNorm: 10,
    priceBenzin: 61.20,
    pricePropane: 32.80,
    priceMethane: 26.50
  });
  const [passCoeffs, setPassCoeffs] = useState({ propane: 1.2, methane: 0.9 });
  const [isPassSettingsOpen, setIsPassSettingsOpen] = useState(false);

  // --- НАВИГАЦИЯ И ИСТОРИЯ ---
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ screen: 'MAIN_SELECTION' }, "");
    }

    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        setCurrentScreen(event.state.screen);
      } else {
        setCurrentScreen('MAIN_SELECTION');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (screen, extraState = {}) => {
    setCurrentScreen(screen);
    window.history.pushState({ screen, ...extraState }, "");
  };

  // --- ЛОГИКА ГРУЗОВОГО (ВЕРСИЯ 1) ---
  const formatMoney = (num) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num || 0);
  const getVal = (val) => { const v = parseFloat(val); return isNaN(v) ? 0 : v; };

  const truckSummary = useMemo(() => {
    const v = getVal;
    const isRem = truckSubMode === 'REMOT';
    const active = isRem ? remotInputs : truckInputs;
    
    const gasCoef = systemType === 'lng' ? v(active.lngCoefficient) : v(active.cngCoefficient);
    const gasPrice = systemType === 'lng' ? v(active.lngPrice) : v(active.cngPrice);
    const dCons = v(active.dieselConsumption);
    const dPrice = v(active.dieselPrice);
    const totalM = v(active.monthlyMileage) * 12;

    let qD_res, qG_res, costD, costG, costGDisc;
    if (!isRem) {
      const sub = v(truckInputs.substitutionRate) / 100;
      qD_res = dCons * (1 - sub);
      qG_res = (dCons * sub) * gasCoef;
      costD = (dCons * dPrice) / 100;
      costG = (qD_res * dPrice + qG_res * gasPrice) / 100;
      costGDisc = (qD_res * dPrice + qG_res * (gasPrice * 0.8)) / 100;
    } else {
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

  const handleTruckInputChange = (e, isRemot) => {
    const { name, value } = e.target;
    if (isRemot) setRemotInputs(prev => ({ ...prev, [name]: value }));
    else setTruckInputs(prev => ({ ...prev, [name]: value }));
  };

  // --- ЛОГИКА ЛЕГКОВОГО ---
  const currentDate = useMemo(() => new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), []);

  const passResults = useMemo(() => {
    const v = (val) => parseFloat(val) || 0;
    const { mileage, fuelNorm, priceBenzin, pricePropane, priceMethane } = passInputs;
    
    const costB = (v(mileage) / 100) * v(fuelNorm) * v(priceBenzin);
    const costP = (v(mileage) / 100) * (v(fuelNorm) * passCoeffs.propane) * v(pricePropane);
    const costM = (v(mileage) / 100) * (v(fuelNorm) * passCoeffs.methane) * v(priceMethane);

    return {
      costB: Math.round(costB),
      costP: Math.round(costP),
      costM: Math.round(costM),
      saveYearP: Math.round((costB - costP) * 12),
      saveYearM: Math.round((costB - costM) * 12)
    };
  }, [passInputs, passCoeffs]);

  const handlePassInputChange = (e) => {
    setPassInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- КОМПОНЕНТ ПОДВАЛА ---
  const AppFooter = ({ showDisclaimer = false }) => (
    <footer className="mt-8 mb-4 flex flex-col items-center text-center gap-1.5 font-sans">
      {showDisclaimer && (
        <p className="text-[10px] text-slate-400 max-w-md mb-2 italic">
          * Расчет носит справочный характер. Реальная экономия зависит от манеры вождения и состояния ТС.
        </p>
      )}
      <p className="text-slate-900 font-bold text-xs md:text-sm uppercase tracking-tight">Установочный центр «ЭлитГаз»</p>
      <div className="flex items-center gap-1.5 text-slate-600 text-[10px] md:text-xs">
        <MapPin size={12} className="text-slate-400" />
        <span>г. Екатеринбург, ул. Шефская, 3АВ</span>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-0.5 text-slate-800 font-bold text-[10px] md:text-xs">
        <a href="tel:+73432532888" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <Phone size={12} className="text-blue-500" /> +7 (343) 253-28-88
        </a>
        <a href="tel:+73433289888" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <Phone size={12} className="text-blue-500" /> +7 (343) 328-98-88
        </a>
      </div>
      <p className="text-slate-400 text-[9px] mt-2 uppercase tracking-widest font-medium opacity-60">© {new Date().getFullYear()}</p>
    </footer>
  );

  const isLng = systemType === 'lng';
  const gasName = isLng ? 'СПГ' : 'КПГ';
  const gasUnit = isLng ? 'кг' : 'м³';
  const truckTheme = {
    text: isLng ? 'text-blue-700' : 'text-green-700',
    textDark: isLng ? 'text-blue-900' : 'text-green-900',
    bg: isLng ? 'bg-blue-50' : 'bg-green-50',
    border: isLng ? 'border-blue-200' : 'border-green-200',
    ring: isLng ? 'focus:ring-blue-500' : 'focus:ring-green-500',
    button: isLng ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
    gradient: isLng ? 'from-blue-600 to-blue-800' : 'from-green-600 to-green-800',
  };

  // --- ЭКРАН 1: СТАРТОВЫЙ ВЫБОР ---
  if (currentScreen === 'MAIN_SELECTION') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900 relative">
        <div className="max-w-xl w-full relative z-10 flex flex-col items-center">
          
          {/* ПЛАШКА С ЛОГОТИПОМ (ПО ЦЕНТРУ СВЕРХУ) С КРАСНОЙ ОБОДКОЙ И ВЫСОКОЙ ВИДИМОСТЬЮ */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-red-600 shadow-sm flex items-center justify-center mb-8 w-full">
            <img 
              src="/logo-start.png" 
              alt="EliteGas Logo" 
              className="h-auto w-full max-h-16 md:max-h-24 object-contain select-none pointer-events-none"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-3 text-slate-900">Калькулятор Экономии</h1>
            <p className="text-slate-500 text-sm md:text-base font-bold uppercase tracking-widest opacity-70">Рассчитайте выгоду перехода на газ</p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full">
            <button 
              onClick={() => navigateTo('TRUCK_HOME')}
              className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border-2 border-slate-100 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex items-center gap-6 text-left"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                <Truck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Для грузового ТС</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Газодизель и Ремоторизация</p>
              </div>
              <ChevronRight className="ml-auto text-slate-300" />
            </button>

            <button 
              onClick={() => navigateTo('PASSENGER_CALC')}
              className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all group flex items-center gap-6 text-left"
            >
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
                <Car size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Для легкового ТС</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Пропан и Метан (ГБО)</p>
              </div>
              <ChevronRight className="ml-auto text-slate-300" />
            </button>
          </div>
          <AppFooter />
        </div>
      </div>
    );
  }

  // --- ЭКРАН 2: ЛЕГКОВОЙ КАЛЬКУЛЯТОР ---
  if (currentScreen === 'PASSENGER_CALC') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-1 md:p-8 font-sans overflow-x-hidden text-slate-900">
        <div className="w-full max-w-lg lg:max-w-4xl flex flex-col gap-2 md:gap-3">
          <header className="flex flex-col items-center text-center bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-200 w-full relative mt-2 text-slate-900">
            <button 
                onClick={() => window.history.back()} 
                className="absolute left-2 top-2 md:left-3 md:top-4 p-2 text-slate-600 hover:bg-slate-50 rounded-full"
            >
                <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <div className="p-1.5 md:p-2 bg-slate-100 rounded-xl mb-1 md:mb-2"><Car className="w-5 h-5 md:w-6 md:h-6 text-slate-700" /></div>
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Топливный калькулятор</h1>
            <div className="flex items-center gap-2 mt-1 md:mt-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Свердловскстат</span>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Данные на {currentDate}</p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-2 md:gap-3 w-full">
            <div className="bg-white p-2 md:p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-700 uppercase mb-0.5 md:mb-1 tracking-tight">Пробег (мес)</label>
                <div className="relative">
                   <input type="number" name="mileage" value={passInputs.mileage} onChange={handlePassInputChange} className="w-full text-base md:text-xl font-bold p-1 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" />
                   <span className="absolute right-2 top-1.5 text-[9px] text-slate-400 font-bold">км</span>
                </div>
            </div>
            <div className="bg-white p-2 md:p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-700 uppercase mb-0.5 md:mb-1 tracking-tight">Расход бензина</label>
                <div className="relative">
                    <input type="number" name="fuelNorm" value={passInputs.fuelNorm} onChange={handlePassInputChange} className="w-full text-base md:text-xl font-bold p-1 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" />
                    <span className="absolute right-2 top-1.5 text-[9px] text-slate-400 font-bold">л/100</span>
                </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-3 w-full mb-3 text-slate-900">
            {/* БЕНЗИН */}
            <div className="bg-white rounded-2xl p-2.5 md:p-5 shadow-sm border-t-4 border-amber-400">
                <div className="flex items-center gap-2 mb-1.5 md:mb-4">
                    <Fuel size={16} className="text-amber-500 md:w-5 md:h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Бензин</h3>
                </div>
                <div className="space-y-1.5 md:space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-1.5 md:p-2 rounded-xl border border-slate-100">
                        <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase">Цена/литр</label>
                        <div className="flex items-baseline gap-1">
                            <input type="number" name="priceBenzin" value={passInputs.priceBenzin} onChange={handlePassInputChange} className="w-14 bg-transparent text-right font-bold text-base md:text-lg outline-none" />
                            <span className="text-[10px] font-bold text-slate-400">₽</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-0.5">Затраты / мес</p>
                        <p className="text-xl md:text-2xl font-black leading-none">{formatMoney(passResults.costB)}</p>
                    </div>
                    <p className="text-[9px] md:text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-100">Эталон для сравнения</p>
                </div>
            </div>

            {/* ПРОПАН */}
            <div className="bg-white rounded-2xl p-2.5 md:p-5 shadow-sm border-t-4 border-emerald-500 bg-emerald-50/30">
                <div className="flex items-center gap-2 mb-1.5 md:mb-4">
                    <Flame size={16} className="text-emerald-500 md:w-5 md:h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Пропан</h3>
                </div>
                <div className="space-y-1.5 md:space-y-3">
                    <div className="flex justify-between items-center bg-white p-1.5 md:p-2 rounded-xl border border-emerald-100">
                        <label className="text-[9px] md:text-[10px] font-bold text-emerald-800 uppercase">Цена/литр</label>
                        <div className="flex items-baseline gap-1">
                            <input type="number" name="pricePropane" value={passInputs.pricePropane} onChange={handlePassInputChange} className="w-14 bg-transparent text-right font-bold text-base md:text-lg outline-none" />
                            <span className="text-[10px] font-bold text-emerald-600">₽</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-emerald-800/60 uppercase mb-0.5">Затраты / мес</p>
                        <p className="text-xl md:text-2xl font-black text-emerald-900 leading-none">{formatMoney(passResults.costP)}</p>
                    </div>
                    <p className="text-[9px] md:text-[11px] font-bold text-emerald-600 pt-2 border-t border-emerald-200">Экономия в год: +{formatMoney(passResults.saveYearP)}</p>
                </div>
            </div>

            {/* МЕТАН */}
            <div className="bg-white rounded-2xl p-2.5 md:p-5 shadow-sm border-t-4 border-blue-500 bg-blue-50/30">
                <div className="flex items-center gap-2 mb-1.5 md:mb-4">
                    <Gauge size={16} className="text-blue-500 md:w-5 md:h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Метан</h3>
                </div>
                <div className="space-y-1.5 md:space-y-3">
                    <div className="flex justify-between items-center bg-white p-1.5 md:p-2 rounded-xl border border-blue-100">
                        <label className="text-[9px] md:text-[10px] font-bold text-blue-800 uppercase">Цена / м³</label>
                        <div className="flex items-baseline gap-1">
                             <input type="number" name="priceMethane" value={passInputs.priceMethane} onChange={handlePassInputChange} className="w-14 bg-transparent text-right font-bold text-base md:text-lg outline-none" />
                             <span className="text-[10px] font-bold text-blue-600">₽</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-blue-800/60 uppercase mb-0.5">Затраты / мес</p>
                        <p className="text-xl md:text-2xl font-black text-blue-900 leading-none">{formatMoney(passResults.costM)}</p>
                    </div>
                    <p className="text-[9px] md:text-[11px] font-bold text-blue-600 pt-2 border-t border-blue-200">Экономия в год: +{formatMoney(passResults.saveYearM)}</p>
                </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] text-slate-900 font-bold bg-white px-4 py-2 rounded-full border shadow-sm mx-auto w-fit mb-4">
                <p>Коэф.: Пропан ×{passCoeffs.propane}, Метан ×{passCoeffs.methane}</p>
                <button onClick={() => setIsPassSettingsOpen(true)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-900"><Settings size={14} /></button>
            </div>
            <AppFooter />
          </div>
        </div>

        {/* MODAL SETTINGS PASSENGER */}
        {isPassSettingsOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900 text-slate-900">
            <div className="bg-white rounded-3xl p-6 w-full max-sm shadow-2xl relative">
               <button onClick={() => setIsPassSettingsOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-6">Настройки ГБО</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Коэффициент Пропан</label>
                  <input type="number" step="0.1" value={passCoeffs.propane} onChange={(e)=>setPassCoeffs({...passCoeffs, propane: parseFloat(e.target.value)||0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Коэффициент Метан</label>
                  <input type="number" step="0.1" value={passCoeffs.methane} onChange={(e)=>setPassCoeffs({...passCoeffs, methane: parseFloat(e.target.value)||0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={()=>setIsPassSettingsOpen(false)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 shadow-lg uppercase tracking-wider text-xs">Сохранить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- ЭКРАНЫ ГРУЗОВОГО (ВЕРСИЯ 1) ---
  if (currentScreen === 'TRUCK_HOME') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-4xl w-full">
          <button onClick={() => window.history.back()} className="flex items-center gap-1 mb-6 text-slate-900 font-bold text-sm hover:opacity-70"><ChevronLeft size={20} /> Назад</button>
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Грузовой транспорт</h1>
            <p className="text-slate-600 font-medium">Выберите технологию переоборудования</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div 
              onClick={() => { setTruckSubMode('GAS_DIESEL'); navigateTo('TRUCK_INPUTS', { truckSubMode: 'GAS_DIESEL' }); }}
              className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-blue-500 cursor-pointer shadow-sm transition-all group"
            >
              <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4 text-blue-600 group-hover:scale-105 transition-transform"><Settings2 size={32} /></div>
              <h3 className="text-xl font-bold mb-1">Газодизельный режим</h3>
              <p className="text-slate-500 text-sm">Частичное замещение ДТ метаном</p>
            </div>
            <div 
              onClick={() => { setTruckSubMode('REMOT'); navigateTo('TRUCK_INPUTS', { truckSubMode: 'REMOT' }); }}
              className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-amber-400 cursor-pointer shadow-sm transition-all group"
            >
              <div className="p-3 bg-amber-50 rounded-2xl w-fit mb-4 text-amber-500 group-hover:scale-105 transition-transform"><Truck size={32} /></div>
              <h3 className="text-xl font-bold mb-1 text-slate-800 tracking-tight">Ремоторизация ТС</h3>
              <p className="text-slate-500 text-sm">Полная замена двигателя на газовый</p>
            </div>
          </div>
          <AppFooter />
        </div>
      </div>
    );
  }

  if (currentScreen === 'TRUCK_INPUTS') {
    const isRem = truckSubMode === 'REMOT';
    const activeInp = isRem ? remotInputs : truckInputs;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-2 font-sans text-slate-900">
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
          <button onClick={() => window.history.back()} className="flex items-center gap-1 mb-4 self-start text-slate-900 font-bold text-xs"><ChevronLeft size={18} /> Назад</button>
          <h1 className="text-xl font-bold mb-6 text-center uppercase tracking-tight font-sans">{isRem ? 'Ремоторизация ТС' : 'Газодизель ТС'}</h1>
          <div className="bg-white rounded-[2rem] shadow-xl p-5 w-full border border-slate-200">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-slate-900">
                <button onClick={() => setSystemType('cng')} className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all uppercase ${systemType === 'cng' ? 'border-green-500 bg-green-50 text-green-800 shadow-sm' : 'border-slate-100 text-slate-500'}`}>КПГ (Метан)</button>
                <button onClick={() => setSystemType('lng')} className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all uppercase ${systemType === 'lng' ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-100 text-slate-500'}`}>СПГ (Метан)</button>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-slate-900">
                <div className="flex items-center gap-2 mb-3 text-red-900 font-bold uppercase text-[10px]"><Fuel size={14} /> Дизельное топливо</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-bold text-red-900/70 mb-1 uppercase tracking-tighter font-sans">Расход (л/100км)</label><input type="number" name="dieselConsumption" value={activeInp.dieselConsumption} onChange={(e) => handleTruckInputChange(e, isRem)} className="w-full p-2 bg-white border border-red-100 rounded-lg font-bold text-sm outline-none shadow-inner" /></div>
                  <div><label className="block text-[10px] font-bold text-red-900/70 mb-1 uppercase tracking-tighter font-sans">Цена (₽/л)</label><input type="number" name="dieselPrice" value={activeInp.dieselPrice} onChange={(e) => handleTruckInputChange(e, isRem)} className="w-full p-2 bg-white border border-red-100 rounded-lg font-bold text-sm outline-none shadow-inner" /></div>
                </div>
              </div>
              <div className={`p-4 rounded-2xl border ${truckTheme.bg} ${truckTheme.border} text-slate-900`}>
                <div className={`flex items-center gap-2 mb-3 ${truckTheme.textDark} font-bold uppercase text-[10px]`}><Flame size={14} /> Параметры газа</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={`block text-[10px] font-bold ${truckTheme.textDark} opacity-60 mb-1 uppercase`}>Цена (₽/{gasUnit})</label><input type="number" name={isLng ? 'lngPrice' : 'cngPrice'} value={isLng ? activeInp.lngPrice : activeInp.cngPrice} onChange={(e) => handleTruckInputChange(e, isRem)} className={`w-full p-2 bg-white border rounded-lg font-bold text-sm outline-none focus:ring-2 ${truckTheme.ring}`} /></div>
                  <div><label className={`block text-[10px] font-bold ${truckTheme.textDark} opacity-60 mb-1 uppercase`}>Коэф. расхода</label><input type="number" step="0.01" name={isLng ? 'lngCoefficient' : 'cngCoefficient'} value={isLng ? activeInp.lngCoefficient : activeInp.cngCoefficient} onChange={(e) => handleTruckInputChange(e, isRem)} className={`w-full p-2 bg-white border rounded-lg font-bold text-sm outline-none focus:ring-2 ${truckTheme.ring}`} /></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900">
                <div><label className="block text-[10px] font-bold text-slate-800 uppercase block mb-1 tracking-tight font-sans">Пробег (км/мес)</label><input type="number" name="monthlyMileage" value={activeInp.monthlyMileage} onChange={(e) => handleTruckInputChange(e, isRem)} className="w-full p-3 border border-slate-300 rounded-xl font-bold text-sm" /></div>
                {!isRem && (
                  <div><label className="block text-[10px] font-bold text-slate-800 uppercase block mb-1 tracking-tight font-sans">% замещения ДТ</label><input type="number" name="substitutionRate" value={truckInputs.substitutionRate} onChange={(e) => handleTruckInputChange(e, false)} className="w-full p-3 border border-slate-300 rounded-xl font-bold text-sm text-blue-700" /></div>
                )}
              </div>
              <button onClick={() => navigateTo('TRUCK_REPORT')} className={`w-full py-4 rounded-2xl text-white text-sm md:text-base font-bold shadow-lg transition-all uppercase tracking-wider ${truckTheme.button}`}>Показать отчет</button>
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'TRUCK_REPORT') {
    return (
      <div className="min-h-screen bg-slate-50 p-1.5 md:p-8 font-sans text-slate-900 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <header className="mb-2 md:mb-4 flex items-center justify-between print-hidden">
            <button onClick={() => window.history.back()} className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-sm font-sans text-slate-900"><ChevronLeft size={14} /> Назад</button>
            <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 shadow-sm font-sans"><Printer size={16} /> Печать</button>
          </header>

          <div className="bg-white p-3 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03] select-none">
                 <img src="/logo.png" alt="Watermark" className="w-3/4 md:w-1/2 object-contain transform -rotate-12" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div className="relative z-10 text-slate-900">
              <div className="mb-3 md:mb-8 text-center border-b border-slate-100 pb-2 md:pb-6 font-sans">
                <h1 className="text-sm md:text-2xl font-bold uppercase tracking-tight leading-tight">
                  {truckSubMode === 'REMOT' ? (
                      `Отчет: Ремоторизация (100% ${systemType === 'cng' ? 'КПГ Метан' : 'СПГ Метан'})`
                  ) : (
                      `Отчет: Газодизель (ДТ ${100 - truckInputs.substitutionRate}% + ${systemType === 'cng' ? 'КПГ Метан' : 'СПГ Метан'} ${truckInputs.substitutionRate}%)`
                  )}
                </h1>
                <p className="text-[8px] md:text-xs text-slate-700 mt-1 font-semibold uppercase">Период расчета: 12 месяцев</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-3 mb-3 md:mb-8 font-bold">
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold">Пробег</div><div className="font-bold text-[10px] md:text-base">{(truckSubMode === 'REMOT' ? remotInputs.monthlyMileage : truckInputs.monthlyMileage).toLocaleString()} км/мес</div></div>
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold">Расход ДТ</div><div className="font-bold text-[10px] md:text-base">{truckSummary.qD_base} л/100км</div></div>
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold">Цена ДТ</div><div className="font-bold text-[10px] md:text-base">{truckSubMode === 'REMOT' ? remotInputs.dieselPrice : truckInputs.dieselPrice} ₽</div></div>
                <div className={`p-2 md:p-3 rounded-xl border ${truckTheme.border} ${truckTheme.bg} font-sans`}><div className={`${truckTheme.textDark} text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold`}>Цена {gasName}</div><div className={`font-bold ${truckTheme.textDark} text-[10px] md:text-base`}>{isLng ? (truckSubMode === 'REMOT' ? remotInputs.lngPrice : truckInputs.lngPrice) : (truckSubMode === 'REMOT' ? remotInputs.cngPrice : truckInputs.cngPrice)} ₽</div></div>
                <div className="hidden md:block p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold tracking-tight">Коэф. расхода</div><div className="font-bold text-[10px] md:text-base">{truckSummary.gasCoef}</div></div>
              </div>
              <div className={`grid grid-cols-1 ${systemType === 'cng' ? 'md:grid-cols-2' : ''} gap-2 md:gap-6 mb-3 md:mb-8 font-sans`}>
                <div className={`bg-gradient-to-br ${truckTheme.gradient} text-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl flex flex-row justify-between relative overflow-hidden font-sans`}>
                  <div className="relative z-10 flex flex-col justify-between w-2/3 md:w-3/4">
                    <div><div className="text-[9px] md:text-xs font-bold uppercase tracking-wider opacity-90 font-sans">Экономия (Базовый)</div><div className="text-xl md:text-5xl font-bold mb-2 md:mb-4 leading-tight font-sans">{formatMoney(truckSummary.savings)}</div></div>
                    <div className="flex gap-2 md:gap-3 flex-wrap">
                        <div className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase font-sans">{formatMoney(truckSummary.monthlySav)} / мес</div>
                        <div className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase font-sans">- {Math.round((truckSummary.savings / (truckSummary.totalD || 1)) * 100)}% затрат</div>
                    </div>
                  </div>
                  <div className="absolute right-[10px] top-[10px] bottom-[10px] flex items-center justify-end w-2/5 md:w-1/3 select-none">
                    <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain object-right" style={{ mixBlendMode: 'luminosity', opacity: 0.45, filter: 'grayscale(1) contrast(1.3) brightness(1.2)', pointerEvents: 'none' }} onError={(e)=>{e.target.style.display='none'}} />
                  </div>
                </div>
                {systemType === 'cng' && (
                  <div className="bg-white border-2 border-blue-100 p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg flex flex-col justify-between relative overflow-hidden text-slate-900 font-sans">
                    <div className="absolute top-0 right-0 p-1.5 md:p-3 bg-blue-700 text-white rounded-bl-xl md:rounded-bl-3xl font-bold text-[8px] md:text-[10px] uppercase z-20 font-sans font-bold">Программа ГГМТ</div>
                    <div className="relative z-10 w-2/3 md:w-3/4 mt-2 font-bold text-slate-900">
                        <div>
                            <div className="text-[9px] md:text-xs font-bold text-slate-700 mb-0.5 md:mb-1 flex items-center gap-1 uppercase tracking-wider font-sans"><Tag size={10} className="text-blue-600 font-sans" /> Со скидкой на метан 20%</div>
                            <div className="text-xl md:text-5xl font-bold text-blue-900 mb-2 md:mb-4 leading-tight font-sans">{formatMoney(truckSummary.savingsDiscounted)}</div>
                        </div>
                        <div className="flex gap-2 md:gap-3 flex-wrap text-slate-900">
                            <div className="bg-blue-50 text-blue-900 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold border border-blue-200 uppercase font-sans">{formatMoney(truckSummary.monthlySavDiscounted)} / мес</div>
                            <div className="bg-blue-50 text-blue-900 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold border border-blue-200 uppercase font-sans">- {Math.round((truckSummary.savingsDiscounted / (truckSummary.totalD || 1)) * 100)}% затрат</div>
                        </div>
                    </div>
                    <div className="absolute right-[10px] bottom-[10px] flex items-end justify-end max-h-[35%] w-[28%] select-none">
                        <img src="/logoGGMT.png" alt="GGMT" className="h-auto max-h-full w-auto object-contain object-right-bottom" style={{ opacity: 0.5 }} onError={(e)=>{e.target.style.display='none'}} />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mb-3 md:mb-8 font-sans font-bold text-slate-900">
                <div className="border border-red-200 rounded-xl md:rounded-[2rem] p-3 md:p-6 bg-red-50/30 font-sans">
                  <div className="text-red-900 font-bold text-[10px] md:text-xs uppercase mb-2 md:mb-4 flex items-center gap-2 font-sans"><Fuel size={12}/> На дизеле (100%)</div>
                  <div className="space-y-1.5 md:space-y-3 text-slate-900">
                    <div className="flex justify-between text-[10px] md:text-sm font-bold opacity-80 font-sans"><span>Расход на 100км:</span><span>{truckSummary.qD_base} л</span></div>
                    <div className="flex justify-between text-[10px] md:text-sm font-bold opacity-80 font-sans"><span>Стоимость 1 км:</span><span>{truckSummary.kmD?.toFixed(2)} ₽</span></div>
                    <div className="border-t border-red-200 pt-2 md:pt-3 flex justify-between font-bold text-red-700 text-sm md:text-2xl leading-none font-sans">
                      <span className="text-[8px] md:text-xs uppercase self-center font-bold text-red-600 tracking-tighter">ИТОГО ЗА ГОД:</span>
                      <span className="font-black text-red-800">{formatMoney(truckSummary.totalD)}</span>
                    </div>
                  </div>
                </div>
                <div className={`border ${truckTheme.border} rounded-xl md:rounded-[2rem] p-3 md:p-6 ${truckTheme.bg}/30 font-sans`}>
                  <div className={`${truckTheme.textDark} font-bold text-[10px] md:text-xs uppercase mb-2 md:mb-4 flex items-center gap-2 font-sans`}>
                    {systemType === 'lng' ? <Flame size={12}/> : <Gauge size={12}/>} 
                    {truckSubMode === 'REMOT' ? `На газе (${gasName} 100%)` : `Газодизель (${truckInputs.substitutionRate}% замещения)`}
                  </div>
                  <div className="space-y-1.5 md:space-y-3 font-bold text-slate-900">
                    <div className="flex justify-between text-[10px] md:text-sm opacity-80"><span>На 100км:</span><span>{truckSubMode === 'REMOT' ? `${truckSummary.qG_result} ${gasUnit}` : `${truckSummary.qD_result}л + ${truckSummary.qG_result}${gasUnit}`}</span></div>
                    <div className="flex justify-between text-[10px] md:text-sm opacity-80"><span>Стоимость 1 км:</span><span>{truckSummary.kmG?.toFixed(2)} ₽</span></div>
                    <div className={`border-t ${truckTheme.border} pt-2 md:pt-3 flex justify-between font-bold ${truckTheme.textDark} text-sm md:text-2xl leading-none font-sans`}>
                      <span className="text-[8px] md:text-xs uppercase self-center font-bold tracking-tighter">ИТОГО ЗА ГОД:</span>
                      <span className="font-black">{formatMoney(truckSummary.totalG)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 p-3 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-200 font-bold text-slate-900">
                <h4 className="text-[8px] md:text-[10px] font-bold text-slate-800 uppercase mb-2 md:mb-6 flex items-center gap-2 tracking-widest font-sans font-sans"><BarChart3 size={12}/> Структура затрат</h4>
                <div className="h-6 md:h-10 w-full bg-slate-300 rounded-lg md:rounded-2xl overflow-hidden flex shadow-inner">
                  {truckSubMode === 'REMOT' ? (<div className={`${truckTheme.button} h-full w-full`}></div>) : (
                    <>
                      <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${(100 - truckInputs.substitutionRate)}%` }}></div>
                      <div className={`${truckTheme.button} h-full transition-all duration-1000`} style={{ width: `${truckInputs.substitutionRate}%` }}></div>
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-[8px] md:text-[10px] font-bold uppercase tracking-tight text-slate-900">
                  {truckSubMode === 'REMOT' ? (<span className={`${truckTheme.textDark} font-bold`}>100% {gasName} Метан</span>) : (
                    <>
                      <span className="text-red-700 font-bold">ДИЗЕЛЬ: {formatMoney(truckSummary.totalG * (1 - truckInputs.substitutionRate/100))}</span>
                      <span className={`${truckTheme.textDark} font-bold`}>{gasName}: {formatMoney(truckSummary.totalG * (truckInputs.substitutionRate/100))}</span>
                    </>
                  )}
                </div>
              </div>
              <AppFooter showDisclaimer />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
