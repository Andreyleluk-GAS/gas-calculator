import React, { useState, useMemo, useEffect } from 'react';
import { Fuel, Gauge, Zap, Check, Camera,  ChevronLeft, ShieldCheck, Map, Droplet, Flame, Calculator, Coins, CheckCircle, TrendingDown, ArrowDownToLine, Truck, Settings } from 'lucide-react';
import { ds, fmt, v, Field, AppFooter, BackBtn, captureDesktopScreenshot } from './App';

const EnergyServiceScreen = () => {
  const [showReport, setShowReport] = useState(false);
  const [screenshotCopied, setScreenshotCopied] = useState(false);
  const [isEliteTheme, setIsEliteTheme] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showReport]);

  const handleTakeScreenshot = async () => {
    try {
      const blob = await captureDesktopScreenshot('report-capture-area', 1200);
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setScreenshotCopied(true);
          setTimeout(() => setScreenshotCopied(false), 2000);
        } catch(e) {
          console.error('Clipboard write error:', e);
          alert('Ваш браузер не поддерживает копирование картинок в буфер.');
        }
      }
    } catch (err) {
      console.error('Failed to capture screenshot', err);
      alert('Ошибка при создании скриншота.');
    }
  };

  const [inputs, setInputs] = useState({
    systemType: 'cng',
    dieselConsumption: 36,
    dieselPrice: 82,
    cngPrice: 31.5,
    lngPrice: 54,
    cngCoefficient: 1.2,
    lngCoefficient: 0.86,
    monthlyMileage: 15000,
    baseSubstitutionRate: 40,
    progressiveRate: 70,
    contractTerm: 3,
    conversionCost: 1100000
  });

  const formatNumber = (val) => {
    if (val === undefined || val === null || val === '') return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  
  const parseNumber = (val) => val.toString().replace(/\s/g, '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'monthlyMileage' || name === 'conversionCost') {
      const clean = parseNumber(value);
      if (clean === '') {
        setInputs(p => ({ ...p, [name]: '' }));
      } else if (!isNaN(Number(clean))) {
        setInputs(p => ({ ...p, [name]: Number(clean) }));
      }
    } else {
      setInputs(p => ({ ...p, [name]: value }));
    }
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
      totalContractProfit: Math.round(totalContractProfit),
      
      // Табличные расчеты
      dFuelM_base: (totalM / 100) * dCons,
      dCostM_base: ((totalM / 100) * dCons) * dPrice,
      
      dFuelM_base_gas: (totalM / 100) * (dCons * (1 - baseRate)),
      gFuelM_base_gas: (totalM / 100) * (dCons * baseRate * gCoef),
      dCostM_base_gas: ((totalM / 100) * (dCons * (1 - baseRate))) * dPrice,
      gCostM_base_gas: ((totalM / 100) * (dCons * baseRate * gCoef)) * gPrice,
      totalCost_base_gas: (((totalM / 100) * (dCons * (1 - baseRate))) * dPrice) + (((totalM / 100) * (dCons * baseRate * gCoef)) * gPrice),
      
      dFuelM_prog_gas: (totalM / 100) * (dCons * (1 - progRate)),
      gFuelM_prog_gas: (totalM / 100) * (dCons * progRate * gCoef),
      dCostM_prog_gas: ((totalM / 100) * (dCons * (1 - progRate))) * dPrice,
      gCostM_prog_gas: ((totalM / 100) * (dCons * progRate * gCoef)) * gPrice,
      totalCost_prog_gas: (((totalM / 100) * (dCons * (1 - progRate))) * dPrice) + (((totalM / 100) * (dCons * progRate * gCoef)) * gPrice)
    };
  }, [inputs, isLng]);

  const terms = [1, 2, 3];

  if (showReport) {
    const dPrice = v(inputs.dieselPrice);
    const gPrice = isLng ? v(inputs.lngPrice) : v(inputs.cngPrice);
    const dCons = v(inputs.dieselConsumption);
    const baseRate = v(inputs.baseSubstitutionRate) / 100;
    const progRate = v(inputs.progressiveRate) / 100;
    const gCoef = isLng ? v(inputs.lngCoefficient) : v(inputs.cngCoefficient);
    const maxBar = Math.max(results.dCostM_base, results.totalCost_base_gas, results.totalCost_prog_gas);
    const fmtNum = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(n || 0);
    
    const termYears = v(inputs.contractTerm);
    const months = termYears * 12;
    const EQUIPMENT_COST = v(inputs.conversionCost);

    const var1TotalCost = results.dCostM_base * months;
    const var1DieselCost = results.dCostM_base * months;
    const var1GasCost = 0;
    
    const var2FuelCost = results.totalCost_base_gas * months;
    const var2DieselCost = results.dCostM_base_gas * months;
    const var2GasCost = results.gCostM_base_gas * months;
    const var2TotalCost = var2FuelCost + EQUIPMENT_COST;
    const var2Saving = var1TotalCost - var2TotalCost;

    const var3FuelCost = results.totalCost_prog_gas * months;
    const var3DieselCost = results.dCostM_prog_gas * months;
    const var3GasCost = results.gCostM_prog_gas * months;
    const var3InvestorCost = results.serviceCashback * months;
    const var3TotalCost = var3FuelCost + EQUIPMENT_COST + var3InvestorCost;
    const var3Saving = var1TotalCost - var3TotalCost;

    const Row = ({ icon: Icon, label, value, bold }) => (
      <div className="flex justify-between items-center px-1 border-b border-gray-100 last:border-0 py-0.5 min-h-[1.5rem]">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Icon size={14} className="text-gray-400 shrink-0" />
          <span className="text-sm leading-tight">{label}</span>
        </div>
        <span className={`text-sm whitespace-nowrap ml-2 ${bold ? 'font-bold text-gray-900' : 'text-gray-800'}`}>{value}</span>
      </div>
    );


    const monthlySave2 = results.dCostM_base - results.totalCost_base_gas;
    const monthlySave3 = results.dCostM_base - results.totalCost_prog_gas;
    const monthlyDiff = monthlySave3 - monthlySave2;
    const yearlyDiff = var3Saving - var2Saving;


    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-2 md:p-6 overflow-x-hidden font-sans">
        <div className="max-w-[1200px] mx-auto w-full">
          
          <header className="mb-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">
            
            {/* 1. Кнопка Назад (Слева) */}
            <button onClick={() => setShowReport(false)}
              className="order-1 w-[120px] sm:w-[130px] md:w-[160px] md:mr-auto h-10 shrink-0 flex justify-center items-center gap-1.5 px-2 md:px-4 bg-white border border-surface-200 rounded-xl text-[11px] md:text-xs font-bold text-graphite shadow-sm hover:border-primary hover:text-primary active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={14} /> Назад
            </button>

            {/* 2. Ползунок переключения тем (По центру) */}
            <div className="order-2 flex-1 md:flex-none flex items-center justify-center gap-3 px-2">
              <span className={`hidden md:block text-[10px] font-bold uppercase tracking-wider ${!isEliteTheme ? 'text-gray-900' : 'text-gray-400'}`}>
                Стандарт
              </span>
              
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isEliteTheme} 
                  onChange={(e) => setIsEliteTheme(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>

              <span className={`hidden md:block text-[10px] font-bold uppercase tracking-wider ${isEliteTheme ? 'text-[#2d7e44]' : 'text-gray-400'}`}>
                Elite Gas
              </span>
            </div>

            {/* 3. Кнопка Скриншот (Справа) */}
            <button 
              onClick={handleTakeScreenshot}
              className={`order-3 w-[120px] sm:w-[130px] md:w-[160px] h-10 shrink-0 flex justify-center items-center gap-1.5 px-2 md:px-4 border rounded-xl text-[11px] md:text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer ${
                screenshotCopied 
                  ? 'bg-green-50 border-green-400 text-green-700 scale-105 shadow-md' 
                  : 'bg-white border-surface-200 text-graphite hover:border-primary hover:text-primary active:scale-95'
              }`}
            >
              {screenshotCopied ? <Check size={14} /> : <Camera size={14} />}
              <span className="truncate">{screenshotCopied ? 'Скопировано!' : 'Скриншот'}</span>
            </button>
          </header>

          <div id="report-capture-area" className={`rounded-3xl md:rounded-[40px] shadow-2xl border-0 animate-fade-in p-3 sm:p-5 pt-5 max-w-full relative overflow-hidden ${isEliteTheme ? 'bg-[#fbf9f6]' : 'bg-white'}`}>
            
            {/* Elite Theme Background Pattern */}
            {isEliteTheme && (
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-[150px] -left-[150px] w-[400px] h-[400px] rounded-full border-[30px] border-[#bb1a2c] opacity-[0.03]"></div>
                <div className="absolute top-[20%] right-[-200px] w-[500px] h-[500px] rounded-full border-[40px] border-[#2d7e44] opacity-[0.03]"></div>
                <div className="absolute -bottom-[200px] -left-[100px] w-[600px] h-[600px] rounded-full border-[50px] border-[#bb1a2c] opacity-[0.03]"></div>
                <div className="absolute -bottom-[100px] -right-[100px] w-[350px] h-[350px] rounded-full border-[25px] border-[#2d7e44] opacity-[0.03]"></div>
              </div>
            )}

            {/* Header Redesign */}
            <div className="flex flex-col xl:flex-row justify-between items-center mb-4 gap-3 border-b border-gray-100 pb-3 relative z-10">
              <div className="hidden md:flex items-center gap-3">

                <h1 className="hidden md:block text-xl md:text-[24px] font-bold uppercase text-center xl:text-left tracking-wide shrink-0 text-[#064e3b]">
                  РАСЧЕТ ЗАТРАТ НА ТОПЛИВО (ЭНЕРГОСЕРВИС)
                </h1>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full xl:w-auto xl:flex xl:flex-nowrap">
                
                {/* 1. Пробег (Полная ширина на мобилке, 1-й ряд) */}
                <div className={`col-span-2 xl:col-span-1 flex items-center justify-center gap-3 px-5 py-2 rounded-full shadow-sm w-full ${isEliteTheme ? 'bg-[#bb1a2c]' : 'bg-[#8fa1b4]'}`}>
                  <Truck className="text-white shrink-0" size={24} strokeWidth={1.5} />
                  <div className="flex flex-col text-white">
                    <span className="text-[10px] font-medium leading-none mb-1">Пробег</span>
                    <span className="font-bold leading-none whitespace-nowrap text-sm">{fmtNum(v(inputs.monthlyMileage))} км</span>
                  </div>
                </div>
                
                {/* 2. Цена дизеля (Половина ширины на мобилке, 2-й ряд) */}
                <div className={`col-span-1 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full shadow-sm w-full ${isEliteTheme ? 'bg-[#2d7e44]' : 'bg-[#2a7bca]'}`}>
                  <Droplet className="text-white shrink-0" size={20} strokeWidth={1.5} />
                  <div className="flex flex-col text-white overflow-hidden">
                    <span className="text-[10px] font-medium leading-none mb-1">Цена дизеля</span>
                    <span className="font-bold leading-none whitespace-nowrap text-[11px] sm:text-sm truncate">{dPrice} ₽/л</span>
                  </div>
                </div>
                
                {/* 3. Цена газа (Половина ширины на мобилке, 2-й ряд) */}
                <div className={`col-span-1 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full shadow-sm w-full ${isEliteTheme ? 'bg-[#e7f3eb] border border-[#2d7e44]' : 'bg-[#10a886]'}`}>
                  <Flame className={`shrink-0 ${isEliteTheme ? 'text-[#2d7e44]' : 'text-white'}`} size={20} strokeWidth={1.5} />
                  <div className={`flex flex-col overflow-hidden ${isEliteTheme ? 'text-[#2d7e44]' : 'text-white'}`}>
                    <span className="text-[10px] font-medium leading-none mb-1">Цена газа</span>
                    <span className="font-bold leading-none whitespace-nowrap text-[11px] sm:text-sm truncate">{gPrice} ₽/{gasUnit}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Section 1: ЕЖЕМЕСЯЧНЫЙ РАСЧЕТ */}
            <div className="mb-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10 items-stretch mb-0">
                
                {/* Column 1 */}
                <div className="flex flex-col w-full relative">
                  <div className={`bg-white rounded-3xl shadow-md flex flex-col border overflow-hidden relative z-10 h-full ${isEliteTheme ? 'border-[#bb1a2c]' : 'border-gray-100'}`}>
                    <div className={`${isEliteTheme ? 'bg-[#bb1a2c]' : 'bg-[#546476]'} text-white text-center flex flex-col justify-center items-center h-[64px]`}>
                      <span className="font-bold uppercase text-[13px] tracking-wide">1. ЧИСТЫЙ ДИЗЕЛЬ</span>
                    </div>
                    <div className="p-3 sm:p-4 flex-1 flex flex-col gap-0 text-[13px]">
                      <Row icon={Map} label="Пробег в месяц" value={`${fmtNum(v(inputs.monthlyMileage))} км`} />
                      <Row icon={Droplet} label="Дизель на 100 км" value={`${fmtNum(dCons)} л`} />
                      <Row icon={Calculator} label="Дизель в месяц" value={`${fmtNum(results.dFuelM_base)} л`} />
                      <Row icon={Coins} label="Стоимость дизеля" value={fmt(results.dCostM_base)} bold />
                      <Row icon={Flame} label="Газ на 100 км" value="0" />
                      <Row icon={Calculator} label="Газ в месяц" value="0" />
                      <Row icon={Coins} label="Стоимость газа" value={fmt(0)} bold />
                    </div>
                    <div className={`${isEliteTheme ? 'bg-[#fdf2f3] text-[#bb1a2c]' : 'bg-[#546476] text-white'} p-3 flex justify-between items-center`}>
                      <span className={`text-[13px] font-bold uppercase tracking-wider ${isEliteTheme ? 'text-[#bb1a2c]' : ''}`}>ИТОГО В МЕСЯЦ:</span>
                      <span className="text-[18px] font-black">{fmt(results.dCostM_base)}</span>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col w-full relative">
                  <div className={`bg-white rounded-3xl shadow-md flex flex-col border overflow-hidden relative z-10 h-full ${isEliteTheme ? 'border-[#2d7e44]' : 'border-gray-100'}`}>
                    <div className={`${isEliteTheme ? 'bg-[#2d7e44]' : 'bg-[#2a7bca]'} text-white text-center flex flex-col justify-center items-center h-[64px]`}>
                      <span className="font-bold uppercase text-[13px] tracking-wide">2. ГАЗОДИЗЕЛЬ</span>
                      <span className="font-bold uppercase text-[13px] tracking-wide">[СТАНДАРТ]</span>
                      <span className="text-xs font-normal text-blue-100">(ЗАМЕЩЕНИЕ {inputs.baseSubstitutionRate}%)</span>
                    </div>
                    <div className="p-3 sm:p-4 flex-1 flex flex-col gap-0 text-[13px]">
                      <Row icon={Map} label="Пробег в месяц" value={`${fmtNum(v(inputs.monthlyMileage))} км`} />
                      <Row icon={Droplet} label="Дизель на 100 км" value={`${fmtNum(dCons * (1 - baseRate))} л`} />
                      <Row icon={Calculator} label="Дизель в месяц" value={`${fmtNum(results.dFuelM_base_gas)} л`} />
                      <Row icon={Coins} label="Стоимость дизеля" value={fmt(results.dCostM_base_gas)} bold />
                      <Row icon={Flame} label="Газ на 100 км" value={`${fmtNum(dCons * baseRate * gCoef)} ${gasUnit}`} />
                      <Row icon={Calculator} label="Газ в месяц" value={`${fmtNum(results.gFuelM_base_gas)} ${gasUnit}`} />
                      <Row icon={Coins} label="Стоимость газа" value={fmt(results.gCostM_base_gas)} bold />
                    </div>
                    <div className={`${isEliteTheme ? 'bg-[#e7f3eb] text-[#2d7e44]' : 'bg-[#dce9f6] text-[#2a7bca]'} p-3 flex justify-between items-center`}>
                      <span className={`text-[13px] font-bold uppercase tracking-wider ${isEliteTheme ? 'text-[#2d7e44]' : 'text-gray-800'}`}>ИТОГО В МЕСЯЦ:</span>
                      <span className="text-[18px] font-black">{fmt(results.totalCost_base_gas)}</span>
                    </div>
                  </div>
                  {/* Floating attachment */}
                  <div className={`absolute -bottom-12 left-4 right-4 bg-[#f8fafc] rounded-b-2xl px-4 py-1.5 flex justify-end items-center text-[15px] font-bold shadow-sm z-0 border-b border-l border-r border-gray-200 pt-6 pb-2 ${isEliteTheme ? 'text-[#2d7e44]' : 'text-gray-900'}`}>
                    ▼ Экономия vs ДТ: {fmt(monthlySave2)}
                  </div>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col w-full relative">
                  <div className={`bg-white rounded-3xl shadow-md flex flex-col border overflow-hidden relative z-10 h-full ${isEliteTheme ? 'border-[#3b8c52]' : 'border-gray-100'}`}>

                    <div className={`${isEliteTheme ? 'bg-[#3b8c52]' : 'bg-[#10a886]'} text-white text-center flex flex-col justify-center items-center h-[64px] relative z-10`}>
                      <span className="font-bold uppercase text-[13px] tracking-wide">3. ГАЗОДИЗЕЛЬ "ELITEGAS"</span>
                      <span className="font-bold uppercase text-[13px] tracking-wide">[ЭНЕРГОСЕРВИС]</span>
                      <span className="text-xs font-normal text-emerald-100">(ЗАМЕЩЕНИЕ {inputs.progressiveRate}%)</span>
                    </div>
                    <div className="p-3 sm:p-4 flex-1 flex flex-col gap-0 text-[13px] relative z-10">
                      <Row icon={Map} label="Пробег в месяц" value={`${fmtNum(v(inputs.monthlyMileage))} км`} />
                      <Row icon={Droplet} label="Дизель на 100 км" value={`${fmtNum(dCons * (1 - progRate))} л`} />
                      <Row icon={Calculator} label="Дизель в месяц" value={`${fmtNum(results.dFuelM_prog_gas)} л`} />
                      <Row icon={Coins} label="Стоимость дизеля" value={fmt(results.dCostM_prog_gas)} bold />
                      <Row icon={Flame} label="Газ на 100 км" value={`${fmtNum(dCons * progRate * gCoef)} ${gasUnit}`} />
                      <Row icon={Calculator} label="Газ в месяц" value={`${fmtNum(results.gFuelM_prog_gas)} ${gasUnit}`} />
                      <Row icon={Coins} label="Стоимость газа" value={fmt(results.gCostM_prog_gas)} bold />
                    </div>
                    <div className={`${isEliteTheme ? 'bg-[#e7f3eb]' : 'bg-[#67d9bc]'} p-3 flex justify-between items-center text-gray-900`}>
                      <span className={`text-[13px] font-bold uppercase tracking-wider ${isEliteTheme ? 'text-[#3b8c52]' : 'text-gray-800'}`}>ИТОГО В МЕСЯЦ:</span>
                      <span className={`text-[18px] font-black ${isEliteTheme ? 'text-[#3b8c52]' : ''}`}>{fmt(results.totalCost_prog_gas)}</span>
                    </div>
                  </div>
                  {/* Floating attachment */}
                  <div className="absolute -bottom-[72px] left-4 right-4 bg-[#f8fafc] rounded-b-2xl px-4 py-1.5 flex flex-col items-end text-[15px] font-bold shadow-sm z-0 border-b border-l border-r border-gray-200 pt-6 pb-2">
                    <div className={`${isEliteTheme ? 'text-[#2d7e44]' : 'text-gray-900'}`}>▼ Экономия vs ДТ: {fmt(monthlySave3)}</div>
                    <div className={`${isEliteTheme ? 'text-[#3b8c52]' : 'text-[#2a7bca]'} mt-0.5`}>▼ Экономия vs {inputs.baseSubstitutionRate}%: {fmt(monthlyDiff)}</div>
                  </div>
                </div>

              </div>
            </div>

            <div className="h-[45px] w-full shrink-0" aria-hidden="true"></div>
            {/* Section 2: ГОДОВАЯ АНАЛИТИКА */}
            <div className="mt-4 relative z-10 pt-2">
              <div className="flex items-center gap-4 mb-3">
                <h2 className="text-xl md:text-[22px] font-bold uppercase text-[#064e3b]">
                  ГОДОВАЯ АНАЛИТИКА (за период {termYears} {termYears === 1 ? 'год' : (termYears >= 2 && termYears <= 4 ? 'года' : 'лет')})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch mb-[90px]">
                
                {/* Column 1 */}
                <div className={`bg-white rounded-3xl shadow-md border flex flex-col overflow-hidden h-full ${isEliteTheme ? 'border-[#bb1a2c]' : 'border-gray-100'}`}>
                  <div className={`${isEliteTheme ? 'bg-[#bb1a2c]' : 'bg-[#546476]'} text-white text-center flex flex-col justify-center items-center h-[64px]`}>
                    <span className="font-bold uppercase text-[13px] tracking-wide">1. ЧИСТЫЙ ДИЗЕЛЬ</span>
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col text-[13px]">
                    <div className="flex justify-between items-end text-sm mb-1">
                      <span className="text-gray-700">Затраты на топливо:</span>
                      <span className="font-bold text-gray-900">{fmt(var1TotalCost)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 pl-3">
                      <span>↳ из них ДТ:</span>
                      <span className="font-medium">{fmt(var1DieselCost)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 pl-3 mb-1 border-b border-gray-100 pb-1">
                      <span>↳ стоимость газа:</span>
                      <span className="font-medium">—</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-700">Вложения в оборудование:</span>
                      <span className="font-bold text-gray-900">—</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 mb-3">
                      <span className="text-gray-700">Платежи по контракту:</span>
                      <span className="font-bold text-gray-900">—</span>
                    </div>
                    
                    <div className="text-center mt-1 mb-2">
                      <div className="text-[12px] font-bold text-gray-600 uppercase mb-1 min-h-[34px] flex items-end justify-center leading-tight">ИТОГО ЗАТРАТЫ НА ДТ ЗА {termYears} {termYears === 1 ? 'ГОД' : (termYears >= 2 && termYears <= 4 ? 'ГОДА' : 'ЛЕТ')}:</div>
                      <div className={`text-[22px] font-black ${isEliteTheme ? 'text-[#bb1a2c]' : 'text-gray-900'}`}>{fmt(var1TotalCost)}</div>
                    </div>
                    
                    <div className="mt-auto flex justify-center pt-2 pb-2">
                      <div className={`rounded-full w-[95%] h-[54px] flex flex-col justify-center items-center text-[11px] font-bold tracking-wider ${isEliteTheme ? 'bg-[#fdf2f3] text-[#bb1a2c]' : 'bg-[#eef2f5] text-gray-500'}`}>
                        БАЗОВЫЙ ВАРИАНТ
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col w-full relative">
                  <div className={`bg-white rounded-3xl shadow-md border flex flex-col overflow-hidden relative z-10 h-full ${isEliteTheme ? 'border-[#2d7e44]' : 'border-gray-100'}`}>
                    <div className={`${isEliteTheme ? 'bg-[#2d7e44]' : 'bg-[#2a7bca]'} text-white text-center flex flex-col justify-center items-center h-[64px] leading-tight`}>
                      <span className="font-bold uppercase text-[13px] tracking-wide">2. ГАЗОДИЗЕЛЬ</span>
                      <span className="font-bold uppercase text-[13px] tracking-wide">[СТАНДАРТ]</span>
                      <span className="text-xs font-normal text-blue-100">(ЗАМЕЩЕНИЕ {inputs.baseSubstitutionRate}%)</span>
                    </div>
                    <div className="p-3 sm:p-4 flex-1 flex flex-col text-[13px]">
                      <div className="flex justify-between items-end text-sm mb-1">
                        <span className="text-gray-700">Затраты на топливо:</span>
                        <span className="font-bold text-gray-900">{fmt(var2FuelCost)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500 pl-3">
                        <span>↳ из них ДТ:</span>
                        <span className="font-medium">{fmt(var2DieselCost)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500 pl-3 mb-1 border-b border-gray-100 pb-1">
                        <span>↳ стоимость газа:</span>
                        <span className="font-medium">{fmt(var2GasCost)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-700">Вложения в оборудование:</span>
                        <span className="font-bold text-gray-900">{fmt(EQUIPMENT_COST)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 mb-3">
                        <span className="text-gray-700">Платежи по контракту:</span>
                        <span className="font-bold text-gray-900">—</span>
                      </div>
                      
                      <div className="text-center mt-1 mb-2">
                        <div className="text-[12px] font-bold text-gray-600 uppercase mb-1 min-h-[34px] flex items-end justify-center leading-tight">ИТОГО ЗАТРАТЫ НА ДТ, ГАЗ и стоимость переоборудования ЗА {termYears} {termYears === 1 ? 'ГОД' : (termYears >= 2 && termYears <= 4 ? 'ГОДА' : 'ЛЕТ')}:</div>
                        <div className={`text-[22px] font-black ${isEliteTheme ? 'text-[#2d7e44]' : 'text-[#2a7bca]'}`}>{fmt(var2TotalCost)}</div>
                      </div>
                      
                      <div className="mt-auto flex justify-center pt-2 pb-2">
                        <div className={`rounded-full w-[95%] h-[54px] flex flex-col justify-center items-center text-[12px] font-bold ${isEliteTheme ? 'bg-[#e7f3eb] text-[#2d7e44]' : 'bg-[#dce9f6] text-[#2a7bca]'}`}>
                          <div>▼ Экономия vs ДТ:</div>
                          <div className="text-[16px]">{fmt(var2Saving)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col w-full relative">
                  <div className={`bg-white rounded-3xl shadow-md border flex flex-col overflow-hidden relative z-10 h-full ${isEliteTheme ? 'border-[#3b8c52]' : 'border-gray-100'}`}>

                    <div className={`${isEliteTheme ? 'bg-[#3b8c52]' : 'bg-[#10a886]'} text-white text-center flex flex-col justify-center items-center h-[64px] leading-tight relative z-10`}>
                      <span className="font-bold uppercase text-[13px] tracking-wide">3. ГАЗОДИЗЕЛЬ 'ELITEGAS'</span>
                      <span className="font-bold uppercase text-[13px] tracking-wide">[ЭНЕРГОСЕРВИС]</span>
                      <span className="text-xs font-normal text-emerald-100">(ЗАМЕЩЕНИЕ {inputs.progressiveRate}%)</span>
                    </div>
                    <div className="p-3 sm:p-4 flex-1 flex flex-col text-[13px] relative z-10">
                      <div className="flex justify-between items-end text-sm mb-1">
                        <span className="text-gray-700">Затраты на топливо:</span>
                        <span className="font-bold text-gray-900">{fmt(var3FuelCost)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500 pl-3">
                        <span>↳ из них ДТ:</span>
                        <span className="font-medium">{fmt(var3DieselCost)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500 pl-3 mb-1 border-b border-gray-100 pb-1">
                        <span>↳ стоимость газа:</span>
                        <span className="font-medium">{fmt(var3GasCost)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-700">Вложения в оборудование:</span>
                        <span className="font-bold text-gray-900">{fmt(EQUIPMENT_COST)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 mb-3">
                        <span className="text-gray-700">Платежи по контракту:</span>
                        <span className="font-bold text-gray-900">{fmt(var3InvestorCost)}</span>
                      </div>
                      
                      <div className="text-center mt-1 mb-2">
                        <div className="text-[12px] font-bold text-gray-600 uppercase mb-1 min-h-[34px] flex items-end justify-center leading-tight">ИТОГО ЗАТРАТЫ НА ДТ, ГАЗ и стоимость переоборудования ЗА {termYears} {termYears === 1 ? 'ГОД' : (termYears >= 2 && termYears <= 4 ? 'ГОДА' : 'ЛЕТ')}:</div>
                        <div className={`text-[22px] font-black ${isEliteTheme ? 'text-[#3b8c52]' : 'text-[#10a886]'}`}>{fmt(var3TotalCost)}</div>
                      </div>
                      
                      <div className="mt-auto flex justify-center pt-2 pb-2">
                        <div className={`rounded-full w-[95%] h-[54px] flex flex-col justify-center items-center text-[12px] font-bold ${isEliteTheme ? 'bg-[#e7f3eb] text-[#3b8c52]' : 'bg-[#d2f3e8] text-[#0f5132]'}`}>
                          <div className={`${isEliteTheme ? 'text-[#3b8c52]' : 'text-[#10a886]'}`}>▼ Экономия vs ДТ:</div>
                          <div className="text-[16px]">{fmt(var3Saving)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating attachment */}
                  <div className={`absolute -bottom-[54px] left-6 right-6 bg-[#f8fafc] rounded-b-2xl px-4 py-2 flex justify-end items-center text-[15px] font-bold shadow-sm z-0 border-b border-l border-r border-gray-200 pt-6 pb-2 ${isEliteTheme ? 'text-[#3b8c52]' : 'text-[#2a7bca]'}`}>
                    ▼ Экономия vs {inputs.baseSubstitutionRate}%: {fmt(yearlyDiff)}
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="px-4 md:px-8 pb-4 md:pb-8 pt-2">
            <AppFooter showDisclaimer />
          </div>
        </div>
      </div>
    );
  }

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
                    type="text"
                    inputMode="numeric"
                    name="monthlyMileage"
                    value={formatNumber(inputs.monthlyMileage)}
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

            {/* Стоимость оборудования */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mt-4">
              <div className="flex flex-col">
                <label className="text-[12px] text-gray-500 uppercase font-semibold mb-2 block">
                  Стоимость переоборудования (₽)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="conversionCost"
                  value={formatNumber(inputs.conversionCost)}
                  onChange={handleChange}
                  className="w-full p-2 md:p-2.5 bg-surface-50 border border-surface-300 rounded-lg font-bold text-lg text-graphite outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200"
                />
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
                          : "flex-1 py-1.5 sm:py-2 text-center transition-all rounded-md text-[12px] text-gray-500 uppercase font-semibold hover:text-gray-800 cursor-pointer"
                      }
                    >
                      {t} {t === 1 ? 'год' : (t === 5 ? 'лет' : 'года')}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Вывод результатов */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-2 sm:mt-4 flex flex-col">
              
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
              <div className="flex flex-col gap-1 p-3 sm:p-5 border-t border-gray-100 bg-white rounded-b-2xl">
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
                <hr className="border-gray-200 my-1 sm:my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">ДОПОЛНИТЕЛЬНАЯ выгода в месяц</span>
                  <span className="text-xl font-bold text-blue-900">{fmt((results.progSav - results.baseSav) - results.serviceCashback)}</span>
                </div>

                {/* Блок 2: Итоговая выгода за срок (Яркий подвал) */}
                <div className="mt-1 sm:mt-2 py-3 px-4 sm:py-4 sm:px-5 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">
                    ИТОГО ВЫГОДА ЗА {inputs.contractTerm} {inputs.contractTerm === 1 ? 'ГОД' : (inputs.contractTerm === 5 ? 'ЛЕТ' : 'ГОДА')}
                  </span>
                  <span className="text-3xl md:text-4xl font-extrabold text-blue-600">
                    {fmt(((results.progSav - results.baseSav) - results.serviceCashback) * 12 * inputs.contractTerm)}
                  </span>
                </div>
              </div>
            </div>

            {/* Кнопка "ПОКАЗАТЬ ОТЧЁТ" */}
            <div className="mt-6 flex justify-center pb-2">
              <button onClick={() => setShowReport(true)}
                className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 text-sm tracking-wide uppercase flex items-center justify-center gap-2">
                ПОКАЗАТЬ ОТЧЁТ <ChevronLeft size={16} className="rotate-180" />
              </button>
            </div>

          </div>
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default EnergyServiceScreen;
