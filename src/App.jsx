import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Save, RefreshCw, TrendingDown, Fuel, Truck, Flame, Gauge, Info, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, X, ArrowRight, FileText, Wallet, BarChart3, Copyright, Tag, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const App = () => {
  const reportRef = useRef(null); 
  const [step, setStep] = useState(1); 
  const [systemType, setSystemType] = useState('cng'); 

  const [inputs, setInputs] = useState({
    dieselConsumption: 30,    
    dieselPrice: 75,          
    
    lngCoefficient: 0.857,    
    lngPrice: 43.5,           
    
    cngCoefficient: 1.2,      
    cngPrice: 27.5,           
    
    monthlyMileage: 18000,    
    months: 12,               
    substitutionRate: 60      
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
    const substitutionPercent = inputs.substitutionRate / 100;
    const dieselRate = 1 - substitutionPercent;

    const gasCoefficient = systemType === 'lng' ? inputs.lngCoefficient : inputs.cngCoefficient;
    const gasPrice = systemType === 'lng' ? inputs.lngPrice : inputs.cngPrice;
    const gasPriceDiscounted = gasPrice * 0.8; 

    const qtyDieselOnly_100 = inputs.dieselConsumption; 
    const qtyDualDiesel_100 = inputs.dieselConsumption * dieselRate; 
    const qtyDualGas_100 = (inputs.dieselConsumption * substitutionPercent) * gasCoefficient;

    const costDieselOnly_Km = (qtyDieselOnly_100 * inputs.dieselPrice) / 100;
    const costDualDiesel_Km = (qtyDualDiesel_100 * inputs.dieselPrice) / 100;
    
    const costDualGas_Km = (qtyDualGas_100 * gasPrice) / 100;
    const costDualTotal_Km = costDualDiesel_Km + costDualGas_Km;

    const costDualGasDiscounted_Km = (qtyDualGas_100 * gasPriceDiscounted) / 100;
    const costDualTotalDiscounted_Km = costDualDiesel_Km + costDualGasDiscounted_Km;

    const totalMileage = inputs.monthlyMileage * inputs.months;
    const totalCostDiesel = totalMileage * costDieselOnly_Km;
    
    const totalCostDualDiesel = totalMileage * costDualDiesel_Km;
    const totalCostDualGas = totalMileage * costDualGas_Km;
    const totalCostDual = totalCostDualDiesel + totalCostDualGas;
    const totalSavings = totalCostDiesel - totalCostDual;

    const totalCostDualGasDiscounted = totalMileage * costDualGasDiscounted_Km;
    const totalCostDualDiscounted = totalCostDualDiesel + totalCostDualGasDiscounted;
    const totalSavingsDiscounted = totalCostDiesel - totalCostDualDiscounted;

    setSummary({
      dieselOnlyTotal: Math.round(totalCostDiesel),
      dualTotal: Math.round(totalCostDual),
      dualDieselPart: Math.round(totalCostDualDiesel),
      dualGasPart: Math.round(totalCostDualGas),
      savings: Math.round(totalSavings),
      costPerKmDiesel: costDieselOnly_Km,
      costPerKmDual: costDualTotal_Km,
      monthlySavings: Math.round(totalSavings / inputs.months),
      dualTotalDiscounted: Math.round(totalCostDualDiscounted),
      dualGasPartDiscounted: Math.round(totalCostDualGasDiscounted),
      savingsDiscounted: Math.round(totalSavingsDiscounted),
      monthlySavingsDiscounted: Math.round(totalSavingsDiscounted / inputs.months),
      qtyDieselOnly_100: parseFloat(qtyDieselOnly_100.toFixed(1)),
      qtyDualDiesel_100: parseFloat(qtyDualDiesel_100.toFixed(1)),
      qtyDualGas_100: parseFloat(qtyDualGas_100.toFixed(1))
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = Number(value);
    
    if (name === 'substitutionRate') {
      if (finalValue > 100) finalValue = 100;
      if (finalValue < 0) finalValue = 0;
    }

    setInputs(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleDownloadImage = () => {
    if (reportRef.current) {
        html2canvas(reportRef.current, {
            scale: 2, // Высокое качество
            backgroundColor: "#ffffff",
            useCORS: true
        }).then(canvas => {
            const image = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement("a");
            link.href = image;
            link.download = `raschet-${systemType}.jpg`;
            link.click();
        }).catch(err => {
            console.error("Ошибка генерации изображения:", err);
            alert("Ошибка при создании изображения. Попробуйте обновить страницу.");
        });
    }
  };

  const formatMoney = (num) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num);
  };
  
  const isLng = systemType === 'lng';
  const gasName = isLng ? 'СПГ (LNG)' : 'КПГ (CNG)';
  const gasUnit = isLng ? 'кг' : 'м³';
  
  const themeStyles = {
    text: isLng ? 'text-blue-600' : 'text-green-600',
    textDark: isLng ? 'text-blue-900' : 'text-green-900',
    bg: isLng ? 'bg-blue-50' : 'bg-green-50',
    border: isLng ? 'border-blue-200' : 'border-green-200',
    ring: isLng ? 'focus:ring-blue-500' : 'focus:ring-green-500',
    gradient: isLng ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700',
    button: isLng ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
    subtleBg: isLng ? 'bg-blue-50/50' : 'bg-green-50/50',
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
        font-size: 12px;
      }
      .print-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
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
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Калькулятор Эффективности Газодизеля</h1>
              <p className="text-xl text-slate-600">Выберите тип оборудования для расчета по методике</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div onClick={() => setSystemType('cng')} className={`cursor-pointer group relative p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${systemType === 'cng' ? 'border-green-500 bg-white shadow-lg ring-4 ring-green-500/10' : 'border-slate-200 bg-white hover:border-green-300'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${systemType === 'cng' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 group-hover:bg-green-50 group-hover:text-green-500'}`}><Gauge className="w-10 h-10" /></div>
                  {systemType === 'cng' && <CheckCircle2 className="w-8 h-8 text-green-500" />}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Метан КПГ</h3>
                <p className="text-slate-500">Компримированный газ (CNG)</p>
              </div>
              <div onClick={() => setSystemType('lng')} className={`cursor-pointer group relative p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${systemType === 'lng' ? 'border-blue-500 bg-white shadow-lg ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${systemType === 'lng' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}><Flame className="w-10 h-10" /></div>
                  {systemType === 'lng' && <CheckCircle2 className="w-8 h-8 text-blue-500" />}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Метан СПГ</h3>
                <p className="text-slate-500">Сжиженный газ (LNG)</p>
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={() => setStep(2)} className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-4 px-12 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-slate-900/20">Начать расчет <ChevronRight className="w-6 h-6" /></button>
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

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4">
        <style>{printStyles}</style>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full">
              <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setStep(1)} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                  <h1 className="text-2xl font-bold text-slate-900">Ввод параметров</h1>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                    <div className="flex items-center gap-2 mb-4 text-red-800 font-bold uppercase tracking-wide border-b border-red-200 pb-2"><Fuel className="w-5 h-5 text-red-600" /> Дизель (Базовый)</div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4"><label className="text-sm font-semibold text-red-900/70">Расход (л/100км)</label><input type="number" name="dieselConsumption" value={inputs.dieselConsumption} onChange={handleInputChange} className="w-32 px-4 py-2 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bold text-right text-red-900 text-lg" /></div>
                      <div className="flex items-center justify-between gap-4"><label className="text-sm font-semibold text-red-900/70">Стоимость (₽/л)</label><input type="number" name="dieselPrice" value={inputs.dieselPrice} onChange={handleInputChange} className="w-32 px-4 py-2 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bold text-right text-red-900 text-lg" /></div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${themeStyles.bg} ${themeStyles.border}`}>
                    <div className={`flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-wide border-b ${themeStyles.border} pb-2 ${themeStyles.textDark}`}>{isLng ? <Flame className="w-5 h-5" /> : <Gauge className="w-5 h-5" />} {gasName}</div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4"><label className={`text-sm font-semibold ${themeStyles.textDark}`}>Коэф. расхода</label><input type="number" step="0.001" name={isLng ? "lngCoefficient" : "cngCoefficient"} value={isLng ? inputs.lngCoefficient : inputs.cngCoefficient} onChange={handleInputChange} className={`w-32 px-4 py-2 bg-white border rounded-lg outline-none font-bold text-right text-lg ${themeStyles.border} ${themeStyles.ring} ${themeStyles.textDark}`} /></div>
                      <div className="flex items-center justify-between gap-4"><label className={`text-sm font-semibold ${themeStyles.textDark}`}>Стоимость (₽/{gasUnit})</label><input type="number" step="0.1" name={isLng ? "lngPrice" : "cngPrice"} value={isLng ? inputs.lngPrice : inputs.cngPrice} onChange={handleInputChange} className={`w-32 px-4 py-2 bg-white border rounded-lg outline-none font-bold text-right text-lg ${themeStyles.border} ${themeStyles.ring} ${themeStyles.textDark}`} /></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                      <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Пробег (км/мес)</label><input type="number" name="monthlyMileage" value={inputs.monthlyMileage} onChange={handleInputChange} className={`w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none font-bold text-lg ${themeStyles.ring}`} /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">% замещения ДТ</label><input type="number" name="substitutionRate" min="0" max="100" value={inputs.substitutionRate} onChange={handleInputChange} className={`w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none font-bold text-lg ${themeStyles.ring}`} /></div>
                  </div>
                  <button onClick={() => setStep(3)} className={`w-full flex items-center justify-center gap-3 text-white text-lg font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg ${themeStyles.button}`}>Рассчитать экономию <ArrowRight className="w-6 h-6" /></button>
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 relative flex flex-col justify-between">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto w-full print-container">
        
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print-hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setStep(2)} className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors font-medium"><ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Изменить параметры</button>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleDownloadImage} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium"><Download className="w-4 h-4" /> Сохранить как картинку</button>
          </div>
        </header>

        <div ref={reportRef} className="bg-white p-4 rounded-xl">
            
            <div className="mb-6 text-center border-b border-slate-100 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Отчет по эффективности газодизеля</h1>
                <p className="text-slate-500 text-sm mt-1">Сформировано: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 print:shadow-none print:border print:mb-4 print:p-4 break-inside-avoid">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500" />
                    Исходные данные для расчета
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 text-sm print:gap-2">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500 text-xs mb-1">Пробег в месяц</div>
                        <div className="font-bold text-slate-900">{inputs.monthlyMileage.toLocaleString()} км</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-red-100">
                        <div className="text-red-800/60 text-xs mb-1">Расход Дизеля (Норма)</div>
                        <div className="font-bold text-red-900">{inputs.dieselConsumption} л/100км</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-red-100">
                        <div className="text-red-800/60 text-xs mb-1">Цена ДТ</div>
                        <div className="font-bold text-red-900">{inputs.dieselPrice} ₽/л</div>
                    </div>

                    <div className={`p-3 rounded-lg ${themeStyles.subtleBg} border ${themeStyles.border}`}>
                        <div className={`${themeStyles.textDark} text-xs mb-1`}>Процент замещения</div>
                        <div className={`font-bold ${themeStyles.textDark}`}>{inputs.substitutionRate}% Газ</div>
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${themeStyles.border} ${themeStyles.bg} flex items-center justify-between`}>
                        <div>
                            <div className={`${themeStyles.textDark} opacity-60 text-xs mb-1`}>Коэффициент</div>
                            <div className={`font-bold ${themeStyles.textDark}`}>{systemType === 'lng' ? inputs.lngCoefficient : inputs.cngCoefficient}</div>
                        </div>
                        <div className={`w-px h-8 ${isLng ? 'bg-blue-200' : 'bg-green-200'}`}></div>
                        <div className="text-right">
                            <div className={`${themeStyles.textDark} opacity-60 text-xs mb-1`}>Расход Газа</div>
                            <div className={`font-bold ${themeStyles.textDark}`}>
                                {((inputs.dieselConsumption * inputs.substitutionRate / 100) * (systemType === 'lng' ? inputs.lngCoefficient : inputs.cngCoefficient)).toFixed(1)} {gasUnit}/100км
                            </div>
                        </div>
                    </div>

                    <div className={`p-3 rounded-lg border ${themeStyles.border} ${themeStyles.bg}`}>
                        <div className={`${themeStyles.textDark} opacity-60 text-xs mb-1`}>Цена {gasName}</div>
                        <div className={`font-bold ${themeStyles.textDark}`}>{systemType === 'lng' ? inputs.lngPrice : inputs.cngPrice} ₽/{gasUnit}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 print:space-y-4">
                <div className={`grid grid-cols-1 ${!isLng ? 'md:grid-cols-2 print:grid-cols-2' : ''} gap-6 items-stretch break-inside-avoid print:gap-4`}>
                    
                    <div className={`bg-gradient-to-br ${themeStyles.gradient} text-white p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-full print:p-6`}>
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        {isLng ? <Flame size={300} /> : <Gauge size={300} />}
                        </div>
                        
                        <div className="relative z-10 flex-1">
                            <h2 className="text-xl font-bold text-white mb-4">Базовый расчет</h2>
                            <div className="flex items-center gap-2 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-medium w-fit mb-6 backdrop-blur-sm">
                                <Fuel className="w-4 h-4" />
                                Стандартные условия
                            </div>

                            <div className="text-xl text-white/80 font-medium mb-2">Итоговая экономия</div>
                            <div className="text-5xl font-bold tracking-tight mb-4">{formatMoney(summary.savings)}</div>
                        </div>
                        
                        <div className="relative z-10 flex gap-3 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/10">
                            <Wallet className="w-4 h-4" />
                            <span>{formatMoney(summary.monthlySavings)} в месяц</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/10">
                            <TrendingDown className="w-4 h-4" />
                            <span>- {((summary.savings / summary.dieselOnlyTotal) * 100).toFixed(1)}% расходов</span>
                            </div>
                        </div>
                    </div>

                    {!isLng && (
                    <div className="bg-white rounded-3xl shadow-lg relative overflow-hidden border border-blue-200 p-8 flex flex-col justify-between h-full print:p-6">
                        <div className="relative z-10 flex-1">
                            <h2 className="text-xl font-bold text-blue-900 mb-4">Программа ООО "ГГМТ"</h2>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium w-fit mb-6">
                                <Tag className="w-4 h-4" />
                                Скидка на метан 20%
                            </div>
                            
                            <div className="text-xl text-slate-600 font-medium mb-2">Итоговая экономия со скидкой</div>
                            <div className="text-5xl font-bold tracking-tight text-blue-900 mb-4">{formatMoney(summary.savingsDiscounted)}</div>
                        </div>
                        
                        <div className="relative z-10 flex gap-3 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-800 border border-blue-100">
                            <Wallet className="w-4 h-4" />
                            <span>{formatMoney(summary.monthlySavingsDiscounted)} в месяц</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-800 border border-blue-100">
                            <TrendingDown className="w-4 h-4" />
                            <span>- {((summary.savingsDiscounted / summary.dieselOnlyTotal) * 100).toFixed(1)}% расходов</span>
                            </div>
                        </div>
                    </div>
                    )}

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4 break-inside-avoid">
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 relative overflow-hidden print:p-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                        <h3 className="text-lg font-bold text-red-900 mb-6 relative z-10 flex items-center gap-2">
                            <Fuel className="w-5 h-5" />
                            Только Дизель (100%)
                        </h3>
                        
                        <div className="space-y-3 relative z-10">
                            
                            <div className="flex justify-between items-end border-b border-red-100 pb-2">
                                <span className="text-red-900/60 text-sm">Расход топлива на 100км</span>
                                <span className="text-xl font-bold text-red-900">{summary.qtyDieselOnly_100} л ДТ</span>
                            </div>

                            <div className="flex justify-between items-end border-b border-red-100 pb-2">
                                <span className="text-red-900/60 text-sm">Стоимость 1 км</span>
                                <span className="text-xl font-bold text-red-900">{summary.costPerKmDiesel.toFixed(2)} ₽</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-red-100 pb-2">
                                <span className="text-red-900/60 text-sm">Затраты в месяц</span>
                                <span className="text-xl font-bold text-red-900">{formatMoney(summary.dieselOnlyTotal / inputs.months)}</span>
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-red-900/60 text-sm font-medium">ИТОГО за период</span>
                                <span className="text-3xl font-bold text-red-900">{formatMoney(summary.dieselOnlyTotal)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white rounded-2xl shadow-sm border ${themeStyles.border} p-6 relative overflow-hidden print:p-4`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${themeStyles.bg} rounded-bl-full -mr-10 -mt-10 z-0`}></div>
                        <h3 className={`text-lg font-bold ${themeStyles.textDark} mb-6 relative z-10 flex items-center gap-2`}>
                            {isLng ? <Flame className="w-5 h-5" /> : <Gauge className="w-5 h-5" />}
                            Газодизель ({gasName})
                        </h3>
                        
                        <div className="space-y-3 relative z-10">
                            
                            <div className={`flex justify-between items-end border-b ${themeStyles.border} pb-2`}>
                                <span className={`${themeStyles.textDark} opacity-60 text-sm`}>Расход топлива на 100км</span>
                                <div className="flex items-center">
                                    <span className="text-xl font-bold text-red-700 whitespace-nowrap">
                                        {summary.qtyDualDiesel_100} л ДТ
                                    </span>
                                    <div className={`h-5 w-px mx-2 ${themeStyles.bg} opacity-40`}></div>
                                    <span className={`text-xl font-bold ${themeStyles.textDark} whitespace-nowrap`}>
                                        {summary.qtyDualGas_100} {gasUnit} {isLng ? 'СПГ' : 'КПГ'}
                                    </span>
                                </div>
                            </div>

                            <div className={`flex justify-between items-end border-b ${themeStyles.border} pb-2`}>
                                <span className={`${themeStyles.textDark} opacity-60 text-sm`}>Стоимость 1 км</span>
                                <div className="text-right">
                                    <span className={`text-xl font-bold ${themeStyles.textDark}`}>{summary.costPerKmDual.toFixed(2)} ₽</span>
                                    <span className="text-xs text-green-600 block font-medium">Выгоднее на {(summary.costPerKmDiesel - summary.costPerKmDual).toFixed(2)} ₽</span>
                                </div>
                            </div>
                             <div className={`flex justify-between items-end border-b ${themeStyles.border} pb-2`}>
                                <span className={`${themeStyles.textDark} opacity-60 text-sm`}>Затраты в месяц</span>
                                <span className={`text-xl font-bold ${themeStyles.textDark}`}>{formatMoney(summary.dualTotal / inputs.months)}</span>
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className={`${themeStyles.textDark} opacity-60 text-sm font-medium`}>ИТОГО за период</span>
                                <span className={`text-3xl font-bold ${themeStyles.textDark}`}>{formatMoney(summary.dualTotal)}</span>
                            </div>
                        </div>
                    </div>

                </div>

                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:p-4 break-inside-avoid">
                     <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                         <BarChart3 className="w-4 h-4" />
                         Структура затрат в газодизельном режиме (Без учета скидки)
                     </h4>
                     
                     <div className="flex h-12 rounded-xl overflow-hidden mb-3">
                         <div 
                            className="bg-red-500 flex items-center justify-center text-white font-bold text-sm relative group"
                            style={{ width: `${(summary.dualDieselPart / summary.dualTotal) * 100}%` }}
                         >
                             <span className="z-10 truncate px-2">Дизель</span>
                             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </div>
                         <div 
                            className={`${isLng ? 'bg-blue-600' : 'bg-green-600'} flex items-center justify-center text-white font-bold text-sm relative group`}
                            style={{ width: `${(summary.dualGasPart / summary.dualTotal) * 100}%` }}
                         >
                             <span className="z-10 truncate px-2">Газ</span>
                             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </div>
                     </div>
                     
                     <div className="flex justify-between text-sm">
                         <div className="text-red-700 font-medium">
                             Дизельное топливо: {formatMoney(summary.dualDieselPart)} <span className="text-slate-400">({((summary.dualDieselPart / summary.dualTotal) * 100).toFixed(0)}%)</span>
                         </div>
                         <div className={`${themeStyles.text} font-medium`}>
                             {gasName}: {formatMoney(summary.dualGasPart)} <span className="text-slate-400">({((summary.dualGasPart / summary.dualTotal) * 100).toFixed(0)}%)</span>
                         </div>
                     </div>
                 </div>
                 
                 <div className="flex justify-center pb-8 pt-4">
                    <p className="text-slate-400 text-xs max-w-2xl text-center">
                      * Расчет носит информационный характер. Реальная экономия зависит от фактического процента замещения, который может варьироваться в зависимости от нагрузки двигателя и манеры вождения.
                    </p>
                 </div>

            </div>
        </div>

      </div>
      <footer className="text-center text-slate-400 text-sm py-4 flex items-center justify-center gap-1 print:hidden">
          <Copyright className="w-4 h-4" />
          <span>ООО "Элитгаз". Все права защищены.</span>
        </footer>
    </div>
  );
};

export default App;