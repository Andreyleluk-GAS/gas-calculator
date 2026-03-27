import React, { useState, useEffect, useMemo } from 'react';
import {
  Fuel, Flame, Gauge, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  BarChart3, Tag, Printer, ArrowLeftRight,
  Truck, Settings2, Car, Settings, X, Phone, MapPin, Send,
  Zap
} from 'lucide-react';

/* ─────────────────────────────────────────────
   ДИЗАЙН-СИСТЕМА: токены из брендбука
   ─────────────────────────────────────────── */
const ds = {
  // Газовые темы: КПГ → secondary (green), СПГ → primary (blue)
  gas: (isLng) => ({
    text:      isLng ? 'text-primary'        : 'text-secondary-700',
    textDark:  isLng ? 'text-primary-800'    : 'text-secondary-700',
    bg:        isLng ? 'bg-primary-50'       : 'bg-secondary-50',
    border:    isLng ? 'border-primary-200'  : 'border-secondary-200',
    ring:      isLng ? 'focus:ring-primary/30' : 'focus:ring-secondary/30',
    btnSolid:  isLng ? 'bg-primary hover:bg-primary-600'
                     : 'bg-secondary hover:bg-secondary-600',
    gradient:  isLng ? 'from-primary-700 to-primary-900'
                     : 'from-secondary-700 via-secondary-600 to-primary-700',
  }),
};

// ── УТИЛИТЫ ───────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n || 0);

const v = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

// ── ОБЩИЕ UI-БЛОКИ ────────────────────────
/* ── Общее поле ввода ── */
const Field = ({ label, name, value, onChange, step, suffix, colorClass = '' }) => (
  <div>
    <label className="block text-[9px] md:text-[10px] font-semibold text-graphite-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        className={`w-full p-2 md:p-2.5 bg-surface-50 border border-surface-300 rounded-lg font-bold text-sm text-graphite outline-none
          focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 ${colorClass}`}
      />
      {suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-utility-muted pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

/* ── Футер ── */
const AppFooter = ({ showDisclaimer = false }) => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 mb-4 flex flex-col items-center text-center gap-1.5">
      {showDisclaimer && (
        <p className="text-[10px] text-utility-muted max-w-md mb-2 italic">
          * Расчёт носит справочный характер.
        </p>
      )}
      <p className="text-graphite font-bold text-xs md:text-sm uppercase tracking-tight">
        Установочный центр «ЭлитГаз»
      </p>
      <div className="flex items-center gap-1.5 text-utility-muted text-[10px] md:text-xs">
        <MapPin size={12} className="text-utility-muted" />
        <span>г. Екатеринбург, ул. Шефская, 3АВ</span>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-0.5 text-graphite font-bold text-[10px] md:text-xs">
        <a href="tel:+73432532888"
           className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200">
          <Phone size={12} className="text-primary" /> +7 (343) 253-28-88
        </a>
        <a href="tel:+73433289888"
           className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200">
          <Phone size={12} className="text-primary" /> +7 (343) 328-98-88
        </a>
      </div>
      <a
        href="https://t.me/Le_luk"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-1.5 px-4 py-1.5 bg-[#0088cc] text-white rounded-full
          text-[10px] md:text-xs font-bold hover:bg-[#0077b3] shadow-sm active:scale-95 transition-all duration-200"
      >
        <Send size={12} fill="white" /> Написать в Telegram
      </a>
      <p className="text-utility-muted text-[9px] mt-2 uppercase tracking-widest opacity-60 font-medium">
        © {year}
      </p>
    </footer>
  );
};

/* ── Модальное окно настроек ── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-graphite/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-surface rounded-2xl p-6 w-full max-w-xs shadow-xl border border-surface-200 relative animate-scale-in">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-utility-muted hover:text-graphite transition-colors duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>
      <h2 className="text-lg font-bold mb-5 text-graphite">{title}</h2>
      {children}
    </div>
  </div>
);

const SaveBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl mt-4
      shadow-md uppercase tracking-wider text-xs active:scale-95 transition-all duration-200 cursor-pointer"
  >
    Сохранить
  </button>
);

/* ── Кнопка «Назад» — единый стиль для всех экранов ── */
const BackBtn = ({ onClick }) => (
  <button
    onClick={onClick ?? (() => window.history.back())}
    className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-surface-200
      rounded-xl text-xs font-bold text-graphite shadow-sm
      hover:border-primary hover:text-primary
      active:scale-95 transition-all duration-200 cursor-pointer"
  >
    <ChevronLeft size={14} /> Назад
  </button>
);

const App = () => {
  // ── НАВИГАЦИЯ ─────────────────────────────
  const [currentScreen, setCurrentScreen] = useState('MAIN_SELECTION');

  // ── ГРУЗОВОЙ ──────────────────────────────
  const [truckSubMode, setTruckSubMode] = useState('GAS_DIESEL');
  const [systemType, setSystemType] = useState('cng');
  const [ggmtDiscount, setGgmtDiscount] = useState(20);
  const [isTruckSettingsOpen, setIsTruckSettingsOpen] = useState(false);

  const [truckInputs, setTruckInputs] = useState({
    dieselConsumption: 36, dieselPrice: 73.26,
    lngCoefficient: 0.86, lngPrice: 45,
    cngCoefficient: 1.2,  cngPrice: 28.51,
    monthlyMileage: 12000, substitutionRate: 60,
  });
  const [remotInputs, setRemotInputs] = useState({
    dieselConsumption: 22, dieselPrice: 73.26,
    lngCoefficient: 0.86, lngPrice: 45,
    cngCoefficient: 1.2,  cngPrice: 28.51,
    monthlyMileage: 12000,
  });

  // ── СПГ ↔ КПГ ─────────────────────────────────
  const [lngCngInputs, setLngCngInputs] = useState({
    // Текущая система авто: спг или кпг
    currentSystem: 'lng',         // 'lng' | 'cng'
    // Параметры СПГ
    lngConsumption: 30,           // кг / 100 км
    lngPrice: 45,                 // ₽ / кг
    // Параметры КПГ
    cngConsumption: 42,           // м³ / 100 км
    cngPrice: 28.51,              // ₽ / м³
    // Обще
    monthlyMileage: 12000,        // км / мес
    equipmentCost: 1200000,       // стоимость переоборудования, ₽
  });

  // ── ЛЕГКОВОЙ ──────────────────────────────
  const [passInputs, setPassInputs] = useState({
    mileage: 1600, fuelNorm: 10,
    priceBenzin: 66.45, pricePropane: 26.08, priceMethane: 28.51,
  });
  const [passCoeffs, setPassCoeffs]    = useState({ propane: 1.2, methane: 0.9 });
  const [isPassSettingsOpen, setIsPassSettingsOpen] = useState(false);

  // ── НАВИГАЦИЯ history ─────────────────────
  useEffect(() => {
    if (!window.history.state) window.history.replaceState({ screen: 'MAIN_SELECTION' }, '');
    const onPop = (e) => setCurrentScreen(e.state?.screen ?? 'MAIN_SELECTION');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigateTo = (screen, extra = {}) => {
    setCurrentScreen(screen);
    window.history.pushState({ screen, ...extra }, '');
  };

  // ── УТИЛИТЫ ───────────────────────────────
  const fmt = (n) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n || 0);
  const v = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

  // ── РАСЧЁТЫ ГРУЗОВОГО ─────────────────────
  const truckSummary = useMemo(() => {
    const isRem = truckSubMode === 'REMOT';
    const inp   = isRem ? remotInputs : truckInputs;
    const gasCoef  = systemType === 'lng' ? v(inp.lngCoefficient) : v(inp.cngCoefficient);
    const gasPrice = systemType === 'lng' ? v(inp.lngPrice)       : v(inp.cngPrice);
    const dCons = v(inp.dieselConsumption), dPrice = v(inp.dieselPrice);
    const totalM = v(inp.monthlyMileage) * 12;

    let qD_res, qG_res, costD, costG;
    if (!isRem) {
      const sub = v(truckInputs.substitutionRate) / 100;
      qD_res = dCons * (1 - sub);
      qG_res = dCons * sub * gasCoef;
      costD  = (dCons * dPrice) / 100;
      costG  = (qD_res * dPrice + qG_res * gasPrice) / 100;
    } else {
      qD_res = dCons; qG_res = dCons * gasCoef;
      costD  = (dCons * dPrice) / 100;
      costG  = (qG_res * gasPrice) / 100;
    }
    const gasPriceDisc = gasPrice * (1 - v(ggmtDiscount) / 100);
    const costGDisc    = isRem
      ? (qG_res * gasPriceDisc) / 100
      : (qD_res * dPrice + qG_res * gasPriceDisc) / 100;

    return {
      totalD: Math.round(totalM * costD), totalG: Math.round(totalM * costG),
      savings: Math.round(totalM * (costD - costG)),
      savingsDiscounted: Math.round(totalM * (costD - costGDisc)),
      kmD: costD, kmG: costG, qD_base: dCons,
      qD_result: qD_res.toFixed(1), qG_result: qG_res.toFixed(1),
      monthlySav: Math.round((totalM * (costD - costG)) / 12),
      monthlySavDiscounted: Math.round((totalM * (costD - costGDisc)) / 12),
      gasCoef,
    };
  }, [truckInputs, remotInputs, systemType, truckSubMode, ggmtDiscount]);

  const handleTruckChange = (e, isRemot) => {
    const { name, value } = e.target;
    isRemot
      ? setRemotInputs(p => ({ ...p, [name]: value }))
      : setTruckInputs(p => ({ ...p, [name]: value }));
  };

  // ── РАСЧЁТЫ ЛЕГКОВОГО ─────────────────────
  const currentDate = useMemo(() =>
    new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), []);

  const passResults = useMemo(() => {
    const { mileage, fuelNorm, priceBenzin, pricePropane, priceMethane } = passInputs;
    const fmtKm = (x) => (x || 0).toFixed(2).replace('.', ',');
    const kmCostB = (v(fuelNorm) / 100) * v(priceBenzin);
    const kmCostP = (v(fuelNorm) * v(passCoeffs.propane) / 100) * v(pricePropane);
    const kmCostM = (v(fuelNorm) * v(passCoeffs.methane) / 100) * v(priceMethane);
    const costB = (v(mileage) / 100) * v(fuelNorm) * v(priceBenzin);
    const costP = (v(mileage) / 100) * v(fuelNorm) * v(passCoeffs.propane)  * v(pricePropane);
    const costM = (v(mileage) / 100) * v(fuelNorm) * v(passCoeffs.methane) * v(priceMethane);
    return {
      costB: Math.round(costB), costP: Math.round(costP), costM: Math.round(costM),
      kmCostB: fmtKm(kmCostB), kmCostP: fmtKm(kmCostP), kmCostM: fmtKm(kmCostM),
      saveYearP: Math.round((costB - costP) * 12),
      saveYearM: Math.round((costB - costM) * 12),
    };
  }, [passInputs, passCoeffs]);

  // ── ПРОИЗВОДНЫЕ ───────────────────────────
  const isLng = systemType === 'lng';
  const gasName = isLng ? 'СПГ' : 'КПГ';
  const gasUnit = isLng ? 'кг' : 'м³';
  const gt = ds.gas(isLng);



  // ═══════════════════════════════════════════
  //  ЭКРАН 1 — ГЛАВНЫЙ
  // ═══════════════════════════════════════════
  if (currentScreen === 'MAIN_SELECTION') {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-3 md:p-6 relative overflow-hidden">
        {/* Декоративные пятна */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="max-w-md w-full relative z-10 flex flex-col items-center animate-fade-in">
          {/* Логотип */}
          <a
            href="https://elitegas.ru"
            className="bg-surface/80 backdrop-blur-md p-5 rounded-2xl border border-surface-200 shadow-md
              flex items-center justify-center mb-5 w-full hover:shadow-lg transition-all duration-300"
          >
            <img
              src="/logo-start.png"
              alt="EliteGas"
              className="h-auto w-full max-h-16 md:max-h-20 object-contain select-none pointer-events-none"
              onError={(e) => e.target.style.display = 'none'}
            />
          </a>

          {/* Заголовок */}
          <div className="text-center mb-7">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-primary mb-2">
              GasCalculator
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-graphite mb-2 tracking-tight">
              Калькулятор Экономии
            </h1>
            <p className="text-utility-muted text-sm font-medium uppercase tracking-widest">
              Рассчитайте выгоду перехода на газ
            </p>
          </div>

          {/* Карточки выбора */}
          <div className="grid grid-cols-1 gap-3 w-full">
            {/* Грузовое */}
            <button
              onClick={() => navigateTo('TRUCK_HOME')}
              className="bg-surface/80 backdrop-blur-md p-4 md:p-5 rounded-2xl border-2 border-surface-200
                hover:border-primary hover:shadow-lg transition-all duration-300 group
                flex flex-col md:flex-row items-center md:gap-5 text-center md:text-left gap-2 cursor-pointer"
            >
              <div className="bg-primary-50 w-14 h-14 rounded-xl flex items-center justify-center
                text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-105
                transition-all duration-300 shrink-0">
                <Truck size={28} />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-base font-bold text-graphite mb-0.5">Для грузового ТС</h3>
                <p className="text-utility-muted text-[11px] font-semibold uppercase tracking-tight">
                  Газодизель и Ремоторизация
                </p>
              </div>
              <ChevronRight className="ml-auto text-surface-300 hidden md:block group-hover:text-primary transition-colors duration-300" />
            </button>

            {/* Легковое */}
            <button
              onClick={() => navigateTo('PASSENGER_CALC')}
              className="bg-surface/80 backdrop-blur-md p-4 md:p-5 rounded-2xl border-2 border-surface-200
                hover:border-secondary hover:shadow-lg transition-all duration-300 group
                flex flex-col md:flex-row items-center md:gap-5 text-center md:text-left gap-2 cursor-pointer"
            >
              <div className="bg-secondary-50 w-14 h-14 rounded-xl flex items-center justify-center
                text-secondary-600 group-hover:bg-secondary group-hover:text-white group-hover:scale-105
                transition-all duration-300 shrink-0">
                <Car size={28} />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-base font-bold text-graphite mb-0.5">Для легкового ТС</h3>
                <p className="text-utility-muted text-[11px] font-semibold uppercase tracking-tight">
                  Пропан и Метан (ГБО)
                </p>
              </div>
              <ChevronRight className="ml-auto text-surface-300 hidden md:block group-hover:text-secondary transition-colors duration-300" />
            </button>
          </div>

          <AppFooter />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  ЭКРАН 2 — ЛЕГКОВОЙ КАЛЬКУЛЯТОР
  // ═══════════════════════════════════════════
  if (currentScreen === 'PASSENGER_CALC') {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center p-1.5 md:p-6 overflow-x-hidden">
        <div className="w-full max-w-lg lg:max-w-4xl flex flex-col gap-2 md:gap-3">

          {/* Навигация */}
          <div className="flex items-center mt-1 md:mt-2">
            <BackBtn />
          </div>

          {/* Шапка */}
          <header className="flex flex-col items-center text-center bg-surface py-3 md:py-5 px-4
            rounded-2xl shadow-sm border border-surface-200">
            <h1 className="text-xl md:text-2xl font-extrabold text-graphite tracking-tight">
              Топливный калькулятор
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-primary-50 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                Свердловскстат
              </span>
              <p className="text-utility-muted text-[10px] font-semibold uppercase">
                Данные на {currentDate}
              </p>
            </div>
          </header>

          {/* Ввод пробега / расхода */}
          <section className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="bg-surface p-3 md:p-4 rounded-xl shadow-sm border border-surface-200">
              <Field label="Пробег (мес)" name="mileage" value={passInputs.mileage}
                onChange={(e) => setPassInputs(p => ({ ...p, mileage: e.target.value }))} suffix="км" />
            </div>
            <div className="bg-surface p-3 md:p-4 rounded-xl shadow-sm border border-surface-200">
              <Field label="Расход бензина" name="fuelNorm" value={passInputs.fuelNorm}
                onChange={(e) => setPassInputs(p => ({ ...p, fuelNorm: e.target.value }))} suffix="л/100" />
            </div>
          </section>

          {/* Три вида топлива */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-3">

            {/* БЕНЗИН */}
            <div className="bg-surface rounded-2xl p-3 md:p-5 shadow-sm border-t-4 border-amber-400 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Fuel size={14} className="text-amber-500" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-graphite">Бензин</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-surface-50 px-4 py-3 rounded-xl border border-surface-200">
                    <label className="text-[9px] md:text-[10px] font-bold text-amber-700 uppercase">Цена/литр</label>
                    <div className="flex items-center gap-2 group">
                      <div className="flex items-baseline gap-2">
                        <input type="number" name="priceBenzin" value={passInputs.priceBenzin}
                          onChange={(e) => setPassInputs(p => ({ ...p, priceBenzin: e.target.value }))}
                          step="0.01"
                          className="w-20 bg-transparent text-right font-bold text-lg outline-none text-graphite [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span className="text-[10px] font-bold text-amber-400">₽</span>
                      </div>
                      <div className="flex flex-col -space-y-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        <button onClick={() => setPassInputs(p => ({ ...p, priceBenzin: (parseFloat(p.priceBenzin || 0) + 0.01).toFixed(2) }))}
                          className="text-amber-500 hover:text-amber-600 transition-colors cursor-pointer">
                          <ChevronUp size={16} strokeWidth={3} />
                        </button>
                        <button onClick={() => setPassInputs(p => ({ ...p, priceBenzin: Math.max(0, parseFloat(p.priceBenzin || 0) - 0.01).toFixed(2) }))}
                          className="text-amber-500 hover:text-amber-600 transition-colors cursor-pointer">
                          <ChevronDown size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between border-t border-surface-200 pt-3">
                    <div>
                      <p className="text-[9px] font-bold text-amber-600 uppercase mb-0.5 leading-none">Затраты / мес</p>
                      <p className="text-2xl md:text-3xl font-black leading-none text-graphite">{fmt(passResults.costB)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-amber-600 uppercase mb-0.5 leading-none">1 км</p>
                      <p className="text-lg font-bold text-amber-700 leading-none">{passResults.kmCostB} Р/км</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-medium text-amber-600/60 pt-2 border-t border-amber-100 mt-3 text-center italic">
                Эталон для сравнения
              </p>
            </div>

            {/* ПРОПАН */}
            <div className="bg-surface rounded-2xl p-3 md:p-5 shadow-sm border-t-4 border-secondary flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-secondary-50 flex items-center justify-center">
                    <Flame size={14} className="text-secondary-600" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-700">Пропан</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-secondary-50 px-4 py-3 rounded-xl border border-secondary-200">
                    <label className="text-[9px] md:text-[10px] font-bold text-secondary-700 uppercase">Цена/литр</label>
                    <div className="flex items-center gap-2 group">
                      <div className="flex items-baseline gap-2">
                        <input type="number" name="pricePropane" value={passInputs.pricePropane}
                          onChange={(e) => setPassInputs(p => ({ ...p, pricePropane: e.target.value }))}
                          step="0.01"
                          className="w-20 bg-transparent text-right font-bold text-lg outline-none text-secondary-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span className="text-[10px] font-bold text-secondary-500">₽</span>
                      </div>
                      <div className="flex flex-col -space-y-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        <button onClick={() => setPassInputs(p => ({ ...p, pricePropane: (parseFloat(p.pricePropane || 0) + 0.01).toFixed(2) }))}
                          className="text-secondary-600 hover:text-secondary-700 transition-colors cursor-pointer">
                          <ChevronUp size={16} strokeWidth={3} />
                        </button>
                        <button onClick={() => setPassInputs(p => ({ ...p, pricePropane: Math.max(0, parseFloat(p.pricePropane || 0) - 0.01).toFixed(2) }))}
                          className="text-secondary-600 hover:text-secondary-700 transition-colors cursor-pointer">
                          <ChevronDown size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between border-t border-secondary-100 pt-3">
                    <div>
                      <p className="text-[9px] font-bold text-secondary-600 uppercase mb-0.5 leading-none">Затраты / мес</p>
                      <p className="text-2xl md:text-3xl font-black leading-none text-secondary-700">{fmt(passResults.costP)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-secondary-600 uppercase mb-0.5 leading-none">1 км</p>
                      <p className="text-lg font-bold text-secondary-600 leading-none">{passResults.kmCostP} Р/км</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-bold text-secondary-600 pt-2 border-t border-secondary-200 mt-3 text-center tracking-tight">
                Экономия в год: +{fmt(passResults.saveYearP)}
              </p>
            </div>

            {/* МЕТАН */}
            <div className="bg-surface rounded-2xl p-3 md:p-5 shadow-sm border-t-4 border-primary flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Gauge size={14} className="text-primary" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">Метан</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-primary-50 px-4 py-3 rounded-xl border border-primary-100">
                    <label className="text-[9px] md:text-[10px] font-bold text-primary-700 uppercase">Цена / м³</label>
                    <div className="flex items-center gap-2 group">
                      <div className="flex items-baseline gap-2">
                        <input type="number" name="priceMethane" value={passInputs.priceMethane}
                          onChange={(e) => setPassInputs(p => ({ ...p, priceMethane: e.target.value }))}
                          step="0.01"
                          className="w-20 bg-transparent text-right font-bold text-lg outline-none text-primary-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span className="text-[10px] font-bold text-primary-400">₽</span>
                      </div>
                      <div className="flex flex-col -space-y-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        <button onClick={() => setPassInputs(p => ({ ...p, priceMethane: (parseFloat(p.priceMethane || 0) + 0.01).toFixed(2) }))}
                          className="text-primary hover:text-primary-600 transition-colors cursor-pointer">
                          <ChevronUp size={16} strokeWidth={3} />
                        </button>
                        <button onClick={() => setPassInputs(p => ({ ...p, priceMethane: Math.max(0, parseFloat(p.priceMethane || 0) - 0.01).toFixed(2) }))}
                          className="text-primary hover:text-primary-600 transition-colors cursor-pointer">
                          <ChevronDown size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between border-t border-primary-100 pt-3">
                    <div>
                      <p className="text-[9px] font-bold text-primary-600 uppercase mb-0.5 leading-none">Затраты / мес</p>
                      <p className="text-2xl md:text-3xl font-black leading-none text-primary-700">{fmt(passResults.costM)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-primary-600 uppercase mb-0.5 leading-none">1 км</p>
                      <p className="text-lg font-bold text-primary leading-none">{passResults.kmCostM} Р/км</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-bold text-primary-600 pt-2 border-t border-primary-100 mt-3 text-center tracking-tight">
                Экономия в год: +{fmt(passResults.saveYearM)}
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-center gap-2 text-[10px] text-graphite font-bold
              bg-surface px-4 py-2 rounded-full border border-surface-200 shadow-sm mx-auto w-fit mb-4">
              <p>Коэф.: Пропан ×{passCoeffs.propane}, Метан ×{passCoeffs.methane}</p>
              <button onClick={() => setIsPassSettingsOpen(true)}
                className="p-1 hover:bg-surface-100 rounded-lg text-graphite transition-colors duration-200 cursor-pointer">
                <Settings size={14} />
              </button>
            </div>
            <AppFooter />
          </div>
        </div>

        {/* Модал настроек ГБО */}
        {isPassSettingsOpen && (
          <Modal title="Настройки ГБО" onClose={() => setIsPassSettingsOpen(false)}>
            <div className="space-y-4">
              <Field label="Коэффициент Пропан" name="propane" value={passCoeffs.propane} step="0.1"
                onChange={(e) => setPassCoeffs(p => ({ ...p, propane: parseFloat(e.target.value) || 0 }))} />
              <Field label="Коэффициент Метан" name="methane" value={passCoeffs.methane} step="0.1"
                onChange={(e) => setPassCoeffs(p => ({ ...p, methane: parseFloat(e.target.value) || 0 }))} />
              <SaveBtn onClick={() => setIsPassSettingsOpen(false)} />
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  ЭКРАН 3 — ВЫБОР ТИПА ГРУЗОВОГО
  // ═══════════════════════════════════════════
  if (currentScreen === 'TRUCK_HOME') {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full flex flex-col min-h-[80vh] md:justify-center animate-fade-in">
          <div className="mb-6">
            <BackBtn />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-graphite mb-2 tracking-tight">
              Грузовой транспорт
            </h1>
            <p className="text-utility-muted font-semibold uppercase tracking-tight text-sm">
              Выберите технологию переоборудования
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Газодизель */}
            <div
              onClick={() => { setTruckSubMode('GAS_DIESEL'); navigateTo('TRUCK_INPUTS'); }}
              className="bg-surface p-6 rounded-2xl border-2 border-surface-200 hover:border-primary
                cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="p-3 bg-primary-50 rounded-xl w-fit mb-4 text-primary
                group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all duration-300">
                <Settings2 size={30} />
              </div>
              <h3 className="text-lg font-bold mb-1 text-graphite">Газодизельный режим</h3>
              <p className="text-utility-muted text-sm">Частичное замещение ДТ метаном</p>
            </div>

            {/* Ремоторизация */}
            <div
              onClick={() => { setTruckSubMode('REMOT'); navigateTo('TRUCK_INPUTS'); }}
              className="bg-surface p-6 rounded-2xl border-2 border-surface-200 hover:border-amber-400
                cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="p-3 bg-amber-50 rounded-xl w-fit mb-4 text-amber-500
                group-hover:bg-amber-400 group-hover:text-white group-hover:scale-105 transition-all duration-300">
                <Truck size={30} />
              </div>
              <h3 className="text-lg font-bold text-graphite">Ремоторизация ТС</h3>
              <p className="text-utility-muted text-sm">Полная замена двигателя на газовый</p>
            </div>

            {/* СПГ ↔ КПГ */}
            <div
              onClick={() => navigateTo('LNG_CNG_INPUTS')}
              className="bg-surface p-6 rounded-2xl border-2 border-surface-200 hover:border-secondary
                cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            >
              {/* Декоративный бейдж */}
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-secondary/10 text-secondary-700
                rounded-full text-[9px] font-bold uppercase tracking-wider">
                Уже на метане
              </div>
              <div className="p-3 bg-secondary-50 rounded-xl w-fit mb-4 text-secondary-600
                group-hover:bg-secondary group-hover:text-white group-hover:scale-105 transition-all duration-300">
                <ArrowLeftRight size={30} />
              </div>
              <h3 className="text-lg font-bold text-graphite mb-1">СПГ ↔ КПГ</h3>
              <p className="text-utility-muted text-sm">Оценка эффективности замены типа газа</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-graphite font-bold
              bg-surface px-4 py-2 rounded-full border border-surface-200 shadow-sm mx-auto w-fit mb-4">
              <p>Скидка ГГМТ: {ggmtDiscount}%</p>
              <button onClick={() => setIsTruckSettingsOpen(true)}
                className="p-1 hover:bg-surface-100 rounded-lg transition-colors duration-200 cursor-pointer">
                <Settings size={14} />
              </button>
            </div>
            <AppFooter />
          </div>
        </div>

        {isTruckSettingsOpen && (
          <Modal title="% скидки на КПГ" onClose={() => setIsTruckSettingsOpen(false)}>
            <div className="space-y-4">
              <Field label="Скидка ГГМТ (%)" name="ggmt" value={ggmtDiscount}
                onChange={(e) => setGgmtDiscount(e.target.value)} />
              <SaveBtn onClick={() => setIsTruckSettingsOpen(false)} />
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  ЭКРАН 4 — ВВОД ПАРАМЕТРОВ ГРУЗОВОГО
  // ═══════════════════════════════════════════
  if (currentScreen === 'TRUCK_INPUTS') {
    const isRem = truckSubMode === 'REMOT';
    const activeInp = isRem ? remotInputs : truckInputs;

    return (
      <div className="min-h-screen bg-surface-50 flex flex-col p-2 md:p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full animate-fade-in">
          <div className="self-start mb-4">
            <BackBtn />
          </div>

          <h1 className="text-lg font-bold mb-5 text-center uppercase tracking-tight text-graphite">
            {isRem ? 'Ремоторизация ТС' : 'Газодизель ТС'}
          </h1>

          <div className="bg-surface rounded-2xl shadow-md border border-surface-200 p-5 w-full">
            <div className="space-y-4">

              {/* Тип газа */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSystemType('cng')}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 uppercase cursor-pointer ${
                    systemType === 'cng'
                      ? 'border-secondary bg-secondary-50 text-secondary-700 shadow-sm'
                      : 'border-surface-200 text-utility-muted hover:border-secondary-200'
                  }`}>
                  КПГ (Метан)
                </button>
                <button onClick={() => setSystemType('lng')}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 uppercase cursor-pointer ${
                    systemType === 'lng'
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
                    value={activeInp.dieselConsumption}
                    onChange={(e) => handleTruckChange(e, isRem)} />
                  <Field label="Цена (₽/л)" name="dieselPrice"
                    value={activeInp.dieselPrice}
                    onChange={(e) => handleTruckChange(e, isRem)} />
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
                    value={isLng ? activeInp.lngPrice : activeInp.cngPrice}
                    onChange={(e) => handleTruckChange(e, isRem)} />
                  <Field label="Коэф. расхода"
                    name={isLng ? 'lngCoefficient' : 'cngCoefficient'}
                    value={isLng ? activeInp.lngCoefficient : activeInp.cngCoefficient}
                    step="0.01"
                    onChange={(e) => handleTruckChange(e, isRem)} />
                </div>
              </div>

              {/* Пробег / замещение */}
              <div className={`grid ${!isRem ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                <Field label="Пробег (км/мес)" name="monthlyMileage"
                  value={activeInp.monthlyMileage}
                  onChange={(e) => handleTruckChange(e, isRem)} />
                {!isRem && (
                  <Field label="% замещения ДТ" name="substitutionRate"
                    value={truckInputs.substitutionRate}
                    onChange={(e) => handleTruckChange(e, false)} />
                )}
              </div>

              {/* Кнопка */}
              <button
                onClick={() => navigateTo('TRUCK_REPORT')}
                className={`w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-md
                  transition-all duration-200 uppercase tracking-wider active:scale-95 cursor-pointer ${gt.btnSolid}`}
              >
                Показать отчёт
              </button>
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  ЭКРАН 5 — ОТЧЁТ ГРУЗОВОГО
  // ═══════════════════════════════════════════
  if (currentScreen === 'TRUCK_REPORT') {
    const isRem = truckSubMode === 'REMOT';
    const totalM_rep = truckInputs.monthlyMileage * 12;
    const dPrice_rep = truckInputs.dieselPrice;
    const gPrice_rep = isLng ? truckInputs.lngPrice : truckInputs.cngPrice;
    const costD_rep  = (parseFloat(truckSummary.qD_result) * dPrice_rep / 100) * totalM_rep;
    const costG_rep  = (parseFloat(truckSummary.qG_result) * gPrice_rep / 100) * totalM_rep;
    const total_rep  = costD_rep + costG_rep;
    const perD = total_rep ? (costD_rep / total_rep) * 100 : 0;
    const perG = total_rep ? (costG_rep / total_rep) * 100 : 0;

    return (
      <div className="min-h-screen bg-surface-50 p-1.5 md:p-6 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">

          {/* Верхняя панель */}
          <header className="mb-3 md:mb-4 flex items-center justify-between print:hidden">
            <BackBtn />
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-surface-200
                rounded-xl text-xs font-bold text-graphite shadow-sm hover:border-primary hover:text-primary
                active:scale-95 transition-all duration-200 cursor-pointer">
              <Printer size={14} /> Печать
            </button>
          </header>

          {/* Карточка отчёта */}
          <div className="bg-surface p-4 md:p-10 rounded-2xl md:rounded-3xl shadow-md border border-surface-200 animate-fade-in">

            {/* Заголовок отчёта */}
            <div className="mb-4 md:mb-8 text-center border-b border-surface-200 pb-3 md:pb-6">
              <h1 className="text-sm md:text-xl font-extrabold uppercase tracking-tight text-graphite">
                {isRem
                  ? `Отчёт: Ремоторизация (100% ${gasName})`
                  : `Отчёт: Газодизель (ДТ ${100 - truckInputs.substitutionRate}% + ${gasName} ${truckInputs.substitutionRate}%)`}
              </h1>
              <p className="text-[9px] md:text-xs text-utility-muted mt-1 font-semibold uppercase tracking-widest">
                Период расчёта: 12 месяцев
              </p>
            </div>

            {/* Параметры */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-3 mb-4 md:mb-8">
              {[
                { label: 'Пробег км/мес', val: (isRem ? remotInputs : truckInputs).monthlyMileage.toLocaleString() },
                { label: 'Расход ДТ на 100 км', val: truckSummary.qD_base },
                { label: 'Цена ДТ', val: `${(isRem ? remotInputs : truckInputs).dieselPrice} ₽` },
                { label: `Цена ${gasName}`, val: `${isLng ? (isRem ? remotInputs.lngPrice : truckInputs.lngPrice) : (isRem ? remotInputs.cngPrice : truckInputs.cngPrice)} ₽`, accent: true },
                { label: 'Коэф. расхода', val: truckSummary.gasCoef, hidden: true },
              ].map(({ label, val, accent, hidden }) => (
                <div key={label}
                  className={`${hidden ? 'hidden md:block' : ''} p-2 md:p-3 rounded-xl border ${
                    accent ? `${gt.bg} ${gt.border}` : 'bg-surface-50 border-surface-200'
                  }`}>
                  <div className={`text-[8px] md:text-[10px] uppercase mb-1 font-bold tracking-tight ${accent ? gt.textDark : 'text-utility-muted'}`}>
                    {label}
                  </div>
                  <div className={`font-bold text-[10px] md:text-sm ${accent ? gt.textDark : 'text-graphite'}`}>
                    {val}
                  </div>
                </div>
              ))}
            </div>

            {/* Главные блоки экономии */}
            <div className={`grid grid-cols-1 ${systemType === 'cng' ? 'md:grid-cols-2' : ''} gap-2 md:gap-6 mb-4 md:mb-8`}>

              {/* Базовая экономия */}
              <div className={`bg-gradient-to-br ${gt.gradient} text-white p-4 md:p-8 rounded-2xl shadow-lg
                flex flex-row justify-between relative overflow-hidden`}>
                <div className="relative z-10 flex flex-col justify-between w-2/3 md:w-3/4 mt-2">
                  <div>
                    <div className="text-[9px] md:text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
                      Экономия (Базовый)
                    </div>
                    <div className="text-2xl md:text-5xl font-black mb-3 md:mb-4 leading-tight">
                      {fmt(truckSummary.savings)}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="bg-white/20 px-2 py-1 rounded-lg text-[8px] md:text-[10px] font-bold uppercase">
                      {fmt(truckSummary.monthlySav)} / мес
                    </div>
                    <div className="bg-white/20 px-2 py-1 rounded-lg text-[8px] md:text-[10px] font-bold uppercase">
                      -{Math.round((truckSummary.savings / (truckSummary.totalD || 1)) * 100)}% затрат
                    </div>
                  </div>
                </div>
                <div className="absolute right-3 top-3 bottom-3 flex items-center justify-end w-1/3 select-none opacity-20">
                  <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain object-right"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              </div>

              {/* ГГМТ (только КПГ) */}
              {systemType === 'cng' && (
                <div className="bg-surface border-2 border-primary-100 p-4 md:p-8 rounded-2xl shadow-md
                  flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1.5 bg-primary text-white rounded-bl-2xl
                    font-bold text-[9px] md:text-[10px] uppercase z-20">
                    Программа ГГМТ
                  </div>
                  <div className="relative z-10 w-2/3 md:w-3/4 mt-2">
                    <div>
                      <div className="text-[9px] md:text-xs font-bold text-graphite-500 mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <Tag size={10} className="text-primary" /> Со скидкой на метан {ggmtDiscount}%
                      </div>
                      <div className="text-2xl md:text-5xl font-black text-primary-700 mb-3 md:mb-4 leading-tight">
                        {fmt(truckSummary.savingsDiscounted)}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded-lg text-[8px] md:text-[10px] font-bold border border-primary-100 uppercase">
                        {fmt(truckSummary.monthlySavDiscounted)} / мес
                      </div>
                      <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded-lg text-[8px] md:text-[10px] font-bold border border-primary-100 uppercase">
                        -{Math.round((truckSummary.savingsDiscounted / (truckSummary.totalD || 1)) * 100)}% затрат
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-3 bottom-3 flex items-end justify-end max-h-[35%] w-[28%] select-none opacity-25">
                    <img src="/logoGGMT.png" alt="GGMT" className="h-auto max-h-full w-auto object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                </div>
              )}
            </div>

            {/* Сравнение дизель / газ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mb-4 md:mb-8">
              {/* Дизель */}
              <div className="border border-danger/20 rounded-xl md:rounded-2xl p-3 md:p-6 bg-red-50/40">
                <div className="text-danger font-bold text-[10px] md:text-xs uppercase mb-3 flex items-center gap-2">
                  <Fuel size={12} /> На дизеле (100%)
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] md:text-sm text-graphite">
                    <span>Расход на 100 км:</span>
                    <span className="font-semibold">{truckSummary.qD_base} л ДТ</span>
                  </div>
                  <div className="flex justify-between text-[10px] md:text-sm text-graphite">
                    <span>Стоимость 1 км:</span>
                    <span className="font-semibold">{truckSummary.kmD?.toFixed(2)} ₽</span>
                  </div>
                  <div className="border-t border-danger/20 pt-2 flex justify-between font-bold text-danger text-sm md:text-2xl leading-none">
                    <span className="text-[8px] md:text-xs uppercase self-center font-bold text-danger/70 tracking-tight">
                      Итого за год:
                    </span>
                    <span className="font-black">{fmt(truckSummary.totalD)}</span>
                  </div>
                </div>
              </div>

              {/* Газ */}
              <div className={`border ${gt.border} rounded-xl md:rounded-2xl p-3 md:p-6 ${gt.bg}`}>
                <div className={`${gt.textDark} font-bold text-[10px] md:text-xs uppercase mb-3 flex items-center gap-2`}>
                  {isLng ? <Flame size={12} /> : <Gauge size={12} />}
                  {isRem ? `На газе (${gasName} 100%)` : `Газодизель (${truckInputs.substitutionRate}% замещения)`}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] md:text-sm text-graphite">
                    <span>Расход на 100 км:</span>
                    <span className="font-semibold">
                      {isRem
                        ? `${truckSummary.qG_result} ${gasUnit} ${gasName}`
                        : `${truckSummary.qD_result} л ДТ + ${truckSummary.qG_result} ${gasUnit} ${gasName}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] md:text-sm text-graphite">
                    <span>Стоимость 1 км:</span>
                    <span className="font-semibold">{truckSummary.kmG?.toFixed(2)} ₽</span>
                  </div>
                  <div className={`border-t ${gt.border} pt-2 flex justify-between font-bold ${gt.textDark} text-sm md:text-2xl leading-none`}>
                    <span className="text-[8px] md:text-xs uppercase self-center font-bold opacity-60 tracking-tight">
                      Итого за год:
                    </span>
                    <span className="font-black">{fmt(truckSummary.totalG)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Диаграмма затрат */}
            <div className="bg-surface-50 p-3 md:p-6 rounded-xl md:rounded-2xl border border-surface-200">
              <h4 className="text-[8px] md:text-[10px] font-bold text-utility-muted uppercase mb-3 md:mb-5 flex items-center gap-2 tracking-widest">
                <BarChart3 size={12} /> Структура затрат на топливо в год
                {!isRem && <span className="normal-case ml-1 opacity-70">(замещение {truckInputs.substitutionRate}%)</span>}
              </h4>
              <div className="h-7 md:h-10 w-full bg-surface-200 rounded-xl overflow-hidden flex shadow-inner">
                {isRem
                  ? <div className={`${gt.btnSolid.split(' ')[0]} h-full w-full transition-all duration-1000`} />
                  : (
                    <>
                      <div className="bg-danger h-full transition-all duration-1000" style={{ width: `${perD}%` }} />
                      <div className={`${gt.btnSolid.split(' ')[0]} h-full transition-all duration-1000`} style={{ width: `${perG}%` }} />
                    </>
                  )
                }
              </div>
              <div className="flex justify-between mt-2 text-[10px] md:text-xs font-bold uppercase tracking-tight">
                {isRem
                  ? <span className={gt.textDark}>100% {gasName} Метан</span>
                  : (
                    <>
                      <span className="text-danger">Дизель: {fmt(costD_rep)}</span>
                      <span className={gt.textDark}>{gasName}: {fmt(costG_rep)}</span>
                    </>
                  )
                }
              </div>
            </div>

            <AppFooter showDisclaimer />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  ЭКРАН 6 — СПГ ↔ КПГ: ВВОД
  // ═══════════════════════════════════════════
  if (currentScreen === 'LNG_CNG_INPUTS') {
    const inp = lngCngInputs;
    const set = (field, val) => setLngCngInputs(p => ({ ...p, [field]: val }));
    const isFromLng = inp.currentSystem === 'lng';

    return (
      <div className="min-h-screen bg-surface-50 flex flex-col p-2 md:p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full animate-fade-in">
          <div className="self-start mb-4"><BackBtn /></div>

          {/* Заголовок */}
          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase
              tracking-widest text-secondary-600 mb-2">
              <ArrowLeftRight size={12} /> Уже на метане
            </span>
            <h1 className="text-lg font-bold uppercase tracking-tight text-graphite">
              СПГ ↔ КПГ — Расчёт эффективности
            </h1>
          </div>

          <div className="bg-surface rounded-2xl shadow-md border border-surface-200 p-5 w-full">
            <div className="space-y-4">

              {/* Текущая система */}
              <div>
                <label className="block text-[9px] font-semibold text-graphite-500 uppercase tracking-wider mb-2">
                  Текущая система автомобиля
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => set('currentSystem', 'lng')}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 uppercase cursor-pointer ${
                      inp.currentSystem === 'lng'
                        ? 'border-primary bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-surface-200 text-utility-muted hover:border-primary-200'
                    }`}>
                    Сейчас на СПГ
                  </button>
                  <button onClick={() => set('currentSystem', 'cng')}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 uppercase cursor-pointer ${
                      inp.currentSystem === 'cng'
                        ? 'border-secondary bg-secondary-50 text-secondary-700 shadow-sm'
                        : 'border-surface-200 text-utility-muted hover:border-secondary-200'
                    }`}>
                    Сейчас на КПГ
                  </button>
                </div>
              </div>

              {/* СПГ параметры */}
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                <div className="flex items-center gap-2 mb-3 text-primary-800 font-bold uppercase text-[10px]">
                  <Flame size={13} /> СПГ (криогенный)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Расход (кг / 100 км)" name="lngConsumption"
                    value={inp.lngConsumption} step="0.1"
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseFloat(val) || 0;
                      setLngCngInputs(p => ({
                        ...p,
                        lngConsumption: val,
                        cngConsumption: num > 0 ? (num * 1.4).toFixed(1) : 0
                      }));
                    }} />
                  <Field label="Цена (₽ / кг)" name="lngPrice"
                    value={inp.lngPrice} step="0.1"
                    onChange={(e) => set('lngPrice', e.target.value)} />
                </div>
              </div>

              {/* КПГ параметры */}
              <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                <div className="flex items-center gap-2 mb-3 text-secondary-700 font-bold uppercase text-[10px]">
                  <Gauge size={13} /> КПГ (компремированный)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Расход (м³ / 100 км)" name="cngConsumption"
                    value={inp.cngConsumption} step="0.1"
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseFloat(val) || 0;
                      setLngCngInputs(p => ({
                        ...p,
                        cngConsumption: val,
                        lngConsumption: num > 0 ? (num / 1.4).toFixed(1) : 0
                      }));
                    }} />
                  <Field label="Цена (₽ / м³)" name="cngPrice"
                    value={inp.cngPrice} step="0.1"
                    onChange={(e) => set('cngPrice', e.target.value)} />
                </div>
              </div>

              {/* Общие */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Пробег (км / мес)" name="monthlyMileage"
                  value={inp.monthlyMileage}
                  onChange={(e) => set('monthlyMileage', e.target.value)} />
                <Field label="Стоимость переоборудования (₽)" name="equipmentCost"
                  value={inp.equipmentCost}
                  onChange={(e) => set('equipmentCost', e.target.value)} />
              </div>

              <button
                onClick={() => navigateTo('LNG_CNG_REPORT')}
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-md
                  bg-secondary hover:bg-secondary-600
                  transition-all duration-200 uppercase tracking-wider active:scale-95 cursor-pointer"
              >
                Рассчитать эффективность
              </button>
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  ЭКРАН 7 — СПГ ↔ КПГ: ОТЧЁТ
  // ═══════════════════════════════════════════
  if (currentScreen === 'LNG_CNG_REPORT') {
    const inp = lngCngInputs;
    const vi  = (x) => { const n = parseFloat(x); return isNaN(n) ? 0 : n; };

    const annualKm   = vi(inp.monthlyMileage) * 12;
    const kmCostLng  = (vi(inp.lngConsumption) * vi(inp.lngPrice)) / 100;
    const kmCostCng  = (vi(inp.cngConsumption) * vi(inp.cngPrice)) / 100;
    const annualLng  = Math.round(annualKm * kmCostLng);
    const annualCng  = Math.round(annualKm * kmCostCng);
    const diff       = annualLng - annualCng; // >0 => КПГ дешевле, <0 => СПГ дешевле
    const savings    = Math.abs(diff);
    const cheaperIs  = diff > 0 ? 'cng' : diff < 0 ? 'lng' : 'equal';
    const equip      = vi(inp.equipmentCost);
    const paybackMo  = savings > 0 ? (equip / (savings / 12)) : Infinity;
    const paybackYr  = paybackMo / 12;
    const isFromLng  = inp.currentSystem === 'lng';
    const targetIs   = isFromLng ? 'cng' : 'lng';
    const isWorthIt  = targetIs === cheaperIs;

    // Проценты для диаграммы
    const maxCost = Math.max(annualLng, annualCng) || 1;
    const barLng  = (annualLng / maxCost) * 100;
    const barCng  = (annualCng / maxCost) * 100;

    return (
      <div className="min-h-screen bg-surface-50 p-2 md:p-6 overflow-x-hidden">
        <div className="max-w-3xl mx-auto">

          {/* Шапка */}
          <header className="mb-3 md:mb-4 flex items-center justify-between print:hidden">
            <BackBtn />
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-surface-200
                rounded-xl text-xs font-bold text-graphite shadow-sm hover:border-primary hover:text-primary
                active:scale-95 transition-all duration-200 cursor-pointer">
              <Printer size={14} /> Печать
            </button>
          </header>

          <div className="bg-surface rounded-2xl md:rounded-3xl shadow-md border border-surface-200 p-4 md:p-8 animate-fade-in">

            {/* Заголовок отчёта */}
            <div className="text-center border-b border-surface-200 pb-4 mb-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase
                tracking-widest text-secondary-600 mb-2">
                <ArrowLeftRight size={12} /> Анализ эффективности
              </div>
              <h1 className="text-base md:text-xl font-extrabold uppercase tracking-tight text-graphite">
                СПГ ↔ КПГ
              </h1>
              <p className="text-[9px] md:text-xs text-utility-muted mt-1 font-semibold uppercase tracking-widest">
                Текущая система: {isFromLng ? 'СПГ (криогенный)' : 'КПГ (компремированный)'}
                &nbsp;•&nbsp; Пробег {vi(inp.monthlyMileage).toLocaleString()} км/мес
              </p>
            </div>

            {/* Параметры верхней строки */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {[
                { label: 'КПГ цена', val: `${vi(inp.cngPrice)} ₽/м³`, color: 'text-secondary-700', bg: 'bg-secondary-50', border: 'border-secondary-100' },
                { label: 'СПГ цена', val: `${vi(inp.lngPrice)} ₽/кг`, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                { label: 'КПГ расход', val: `${vi(inp.cngConsumption)} м³/100км`, color: 'text-secondary-700', bg: 'bg-secondary-50', border: 'border-secondary-100' },
                { label: 'СПГ расход', val: `${vi(inp.lngConsumption)} кг/100км`, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
              ].map(({ label, val, color, bg, border }) => (
                <div key={label} className={`${bg} border ${border} rounded-xl p-3`}>
                  <div className="text-[8px] md:text-[10px] font-bold text-utility-muted uppercase mb-1">{label}</div>
                  <div className={`font-bold text-sm md:text-base ${color}`}>{val}</div>
                </div>
              ))}
            </div>

            {/* Главный результат */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">

              {/* КПГ карточка */}
              <div className={`rounded-2xl p-4 md:p-6 border-2 relative overflow-hidden ${
                cheaperIs === 'cng' ? 'bg-secondary border-secondary shadow-lg' : 'bg-surface border-surface-200'
              }`}>
                {cheaperIs === 'cng' && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 text-white
                    rounded-full text-[9px] font-bold uppercase">
                    Выгоднее
                  </div>
                )}
                <div className={`flex items-center gap-2 mb-3 ${cheaperIs === 'cng' ? 'text-white/80' : 'text-secondary-700'} font-bold text-xs uppercase`}>
                  <Gauge size={14} /> КПГ компремированный
                </div>
                <div className={`text-[9px] font-bold uppercase mb-1 ${cheaperIs === 'cng' ? 'text-white/60' : 'text-utility-muted'}`}>Стоимость 1 км</div>
                <div className={`text-2xl font-black mb-3 ${cheaperIs === 'cng' ? 'text-white' : 'text-secondary-700'}`}>
                  {kmCostCng.toFixed(2)} ₽/км
                </div>
                <div className={`border-t pt-3 ${cheaperIs === 'cng' ? 'border-white/20' : 'border-surface-200'}`}>
                  <div className={`text-[9px] font-bold uppercase mb-1 ${cheaperIs === 'cng' ? 'text-white/60' : 'text-utility-muted'}`}>Затраты в год</div>
                  <div className={`text-2xl md:text-3xl font-black ${cheaperIs === 'cng' ? 'text-white' : 'text-secondary-700'}`}>
                    {fmt(annualCng)}
                  </div>
                </div>
              </div>

              {/* СПГ карточка */}
              <div className={`rounded-2xl p-4 md:p-6 border-2 relative overflow-hidden ${
                cheaperIs === 'lng' ? 'bg-primary border-primary shadow-lg' : 'bg-surface border-surface-200'
              }`}>
                {cheaperIs === 'lng' && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 text-white
                    rounded-full text-[9px] font-bold uppercase">
                    Выгоднее
                  </div>
                )}
                <div className={`flex items-center gap-2 mb-3 ${cheaperIs === 'lng' ? 'text-white/80' : 'text-primary-700'} font-bold text-xs uppercase`}>
                  <Flame size={14} /> СПГ криогенный
                </div>
                <div className={`text-[9px] font-bold uppercase mb-1 ${cheaperIs === 'lng' ? 'text-white/60' : 'text-utility-muted'}`}>Стоимость 1 км</div>
                <div className={`text-2xl font-black mb-3 ${cheaperIs === 'lng' ? 'text-white' : 'text-primary-700'}`}>
                  {kmCostLng.toFixed(2)} ₽/км
                </div>
                <div className={`border-t pt-3 ${cheaperIs === 'lng' ? 'border-white/20' : 'border-surface-200'}`}>
                  <div className={`text-[9px] font-bold uppercase mb-1 ${cheaperIs === 'lng' ? 'text-white/60' : 'text-utility-muted'}`}>Затраты в год</div>
                  <div className={`text-2xl md:text-3xl font-black ${cheaperIs === 'lng' ? 'text-white' : 'text-primary-700'}`}>
                    {fmt(annualLng)}
                  </div>
                </div>
              </div>
            </div>

            {/* Вывод: выгодно ли переходить */}
            <div className={`rounded-2xl p-4 md:p-6 mb-6 border-2 ${
              cheaperIs === 'equal'
                ? 'bg-surface-50 border-surface-200'
                : isWorthIt
                  ? 'bg-secondary-50 border-secondary-200'
                  : 'bg-red-50 border-danger/20'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                  cheaperIs === 'equal' ? 'bg-surface-200 text-graphite'
                  : isWorthIt ? 'bg-secondary text-white'
                  : 'bg-danger text-white'
                }`}>
                  {cheaperIs === 'equal' ? '=' : isWorthIt ? '✓' : '!'}
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm mb-1 ${
                    cheaperIs === 'equal' ? 'text-graphite'
                    : isWorthIt ? 'text-secondary-700'
                    : 'text-danger'
                  }`}>
                    {cheaperIs === 'equal'
                      ? 'Системы равноценны по затратам'
                      : isWorthIt
                        ? `Переход на ${targetIs === 'cng' ? 'КПГ' : 'СПГ'} — выгоден`
                        : `Смена на ${targetIs === 'cng' ? 'КПГ' : 'СПГ'} — невыгодна по цене`
                    }
                  </div>
                  <div className="text-utility-muted text-xs">
                    {cheaperIs !== 'equal' && (
                      <>
                        {isWorthIt ? 'Годовая выгода: ' : 'Потенциальный убыток в год: '}
                        <strong>{fmt(savings)}</strong>
                        {equip > 0 && (
                          <>
                            &nbsp;•&nbsp;
                            {isWorthIt ? (
                              <>
                                Окупаемость переоборудования:
                                <strong> {isFinite(paybackYr) ? `${paybackYr.toFixed(1)} лет` : '—'}</strong>
                                {isFinite(paybackMo) && <> ({Math.round(paybackMo)} мес.)</>}
                              </>
                            ) : (
                              <span className="text-danger font-bold">Инвестиции носят невозвратный характер</span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[9px] font-bold uppercase text-utility-muted mb-0.5 whitespace-nowrap">Ежемес. разница</div>
                  <div className={`text-xl font-black ${
                    cheaperIs === 'equal' ? 'text-graphite'
                    : isWorthIt ? 'text-secondary-700' : 'text-danger'
                  }`}>
                    {fmt(Math.round(savings / 12))}
                  </div>
                </div>
              </div>
            </div>

            {/* Диаграмма */}
            <div className="bg-surface-50 rounded-xl md:rounded-2xl border border-surface-200 p-4 md:p-5">
              <h4 className="text-[8px] md:text-[10px] font-bold text-utility-muted uppercase mb-4 flex items-center gap-2 tracking-widest">
                <BarChart3 size={12} /> Годовые затраты: сравнение
              </h4>
              <div className="space-y-3">
                {/* КПГ bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-secondary-700">КПГ</span>
                    <span className="text-secondary-700">{fmt(annualCng)}</span>
                  </div>
                  <div className="h-5 bg-surface-200 rounded-lg overflow-hidden">
                    <div className="h-full bg-secondary transition-all duration-700 rounded-lg"
                      style={{ width: `${barCng}%` }} />
                  </div>
                </div>
                {/* СПГ bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-primary-700">СПГ</span>
                    <span className="text-primary-700">{fmt(annualLng)}</span>
                  </div>
                  <div className="h-5 bg-surface-200 rounded-lg overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-700 rounded-lg"
                      style={{ width: `${barLng}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <AppFooter showDisclaimer />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
