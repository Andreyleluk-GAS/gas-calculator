const Test = () => {
  }

  if (currentScreen === 'ENERGY_SERVICE') {
    return <EnergyServiceScreen />;
  }

  // ═══════════════════════════════════════════
  //  ЭКРАН 10 — КАРТА ЗАПРАВОК
  // ═══════════════════════════════════════════
  if (currentScreen === 'STATIONS_MAP') {
      return (
        <div className="flex flex-col md:flex-row h-full w-full bg-surface-50 overflow-hidden">
          {/* ГЛАВНЫЙ КОНТЕЙНЕР ЭКРАНА */}
          
          {/* --- ЛЕВЫЙ САЙДБАР --- */}
          {/* На мобильном: высота подстраивается под контент (в режиме карты) или на весь экран (в списке). На десктопе: всегда на всю высоту, ширина 400px */}
          <div className={`flex flex-col w-full md:w-[400px] shrink-0 bg-surface-50 border-r border-surface-200 z-10 transition-all ${mobileViewMode === 'map' ? 'h-auto md:h-full' : 'h-full'}`}>
            
            {/* 1. Блок с фильтрами (ВСЕГДА ВИДИМ) */}
            <div className="shrink-0 bg-white px-4 pt-4 pb-2 shadow-sm relative z-20">
            {/* Стандартная кнопка Назад */}
            <div className="mb-5 flex">
              <button 
                onClick={() => setCurrentScreen('MAIN_SELECTION')} 
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-surface-200 rounded-xl text-[13px] font-bold text-graphite hover:bg-surface-50 hover:border-surface-300 transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
                <span>Назад</span>
              </button>
            </div>
            
            {/* Глобальный фильтр -> Все объекты + Карта/Список */}
            <div className="flex items-center justify-between w-full mb-4">
              {/* Левый переключатель: Все объекты */}
              <button 
                onClick={() => {
                  if (activeFilters.length === 4) setActiveFilters([]);
                  else setActiveFilters(ALL_TYPES);
                }} 
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className={`w-[42px] h-[24px] rounded-full flex items-center p-1 transition-colors duration-300 shrink-0 ${activeFilters.length === 4 ? 'bg-primary/90' : 'bg-surface-200'}`}>
                  <div className={`w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-300 ${activeFilters.length === 4 ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                </div>
                <span className="text-[11px] font-bold text-graphite uppercase tracking-wider">
                  Все объекты
                </span>
              </button>

              {/* Правый переключатель: Список / Карта (видим только на мобильных) */}
              <div className="flex md:hidden items-center bg-surface-100 p-1 rounded-lg shrink-0">
                <button 
                  onClick={() => setMobileViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${mobileViewMode === 'list' ? 'bg-white shadow-sm text-graphite' : 'text-utility-muted'}`}
                >
                  Список
                </button>
                <button 
                  onClick={() => setMobileViewMode('map')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${mobileViewMode === 'map' ? 'bg-white shadow-sm text-graphite' : 'text-utility-muted'}`}
                >
                  Карта
                </button>
              </div>
            </div>
            
            <div className={`h-[1px] bg-surface-100 w-full mb-4 ${mobileViewMode === 'map' ? 'hidden md:block' : 'block'}`}></div>

            {/* 2x2 Grid of toggles - Теперь всегда видимы */}
            <div className="grid grid-cols-2 gap-4 px-1 mb-2 md:mb-6">
              {/* CNG */}
              <button onClick={() => toggleFilter('cng')} className="flex items-center gap-2 relative pb-2 group">
                <div className={`w-[36px] h-[20px] rounded-full flex items-center p-[2px] transition-colors duration-300 shrink-0 ${activeFilters.includes('cng') ? 'bg-secondary' : 'bg-surface-200'}`}>
                  <div className={`w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-300 ${activeFilters.includes('cng') ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                </div>
                <span className="text-[11px] font-bold text-graphite uppercase tracking-wide truncate">КПГ (CNG)</span>
                <Fuel size={14} className={`ml-auto shrink-0 transition-colors ${activeFilters.includes('cng') ? 'text-secondary' : 'text-graphite/40'}`} />
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-colors ${activeFilters.includes('cng') ? 'bg-secondary' : 'bg-surface-200'}`} />
              </button>

              {/* LNG */}
              <button onClick={() => toggleFilter('lng')} className="flex items-center gap-2 relative pb-2 group">
                <div className={`w-[36px] h-[20px] rounded-full flex items-center p-[2px] transition-colors duration-300 shrink-0 ${activeFilters.includes('lng') ? 'bg-primary' : 'bg-surface-200'}`}>
                  <div className={`w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-300 ${activeFilters.includes('lng') ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                </div>
                <span className="text-[11px] font-bold text-graphite uppercase tracking-wide truncate">СПГ (LNG)</span>
                <Fuel size={14} className={`ml-auto shrink-0 transition-colors ${activeFilters.includes('lng') ? 'text-primary' : 'text-graphite/40'}`} />
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-colors ${activeFilters.includes('lng') ? 'bg-primary' : 'bg-surface-200'}`} />
              </button>

              {/* LPG */}
              <button onClick={() => toggleFilter('lpg')} className="flex items-center gap-2 relative pb-2 mt-2 group">
                <div className={`w-[36px] h-[20px] rounded-full flex items-center p-[2px] transition-colors duration-300 shrink-0 ${activeFilters.includes('lpg') ? 'bg-red-500' : 'bg-surface-200'}`}>
                  <div className={`w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-300 ${activeFilters.includes('lpg') ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                </div>
                <span className="text-[11px] font-bold text-graphite uppercase tracking-wide truncate">СУГ (LPG)</span>
                <Fuel size={14} className={`ml-auto shrink-0 transition-colors ${activeFilters.includes('lpg') ? 'text-red-500' : 'text-graphite/40'}`} />
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-colors ${activeFilters.includes('lpg') ? 'bg-red-500' : 'bg-surface-200'}`} />
              </button>

              {/* SERVICE */}
              <button onClick={() => toggleFilter('service')} className="flex items-center gap-2 relative pb-2 mt-2 group">
                <div className={`w-[36px] h-[20px] rounded-full flex items-center p-[2px] transition-colors duration-300 shrink-0 ${activeFilters.includes('service') ? 'bg-orange-500' : 'bg-surface-200'}`}>
                  <div className={`w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-300 ${activeFilters.includes('service') ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                </div>
                <span className="text-[11px] font-bold text-graphite uppercase tracking-wide truncate">Сервисы</span>
                <Settings2 size={14} className={`ml-auto shrink-0 transition-colors ${activeFilters.includes('service') ? 'text-orange-500' : 'text-graphite/40'}`} />
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-colors ${activeFilters.includes('service') ? 'bg-orange-500' : 'bg-surface-200'}`} />
              </button>
            </div>



            {/* Компактный и отцентрированный блок итогов */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <h3 className="text-sm font-bold text-graphite">Результаты</h3>
              <div className="flex items-center gap-2">
                <span className="bg-surface-50 px-3 py-1 rounded-lg text-sm font-bold text-graphite border border-surface-200 shadow-sm">
                  {displayStations.length}
                </span>
                <span className="text-[11px] text-utility-muted">
                  станций найдено
                </span>
              </div>
            </div>

            {displayStations.length === 0 && (
              <div className="flex items-start gap-3 mt-1 mb-6">
                <div className="shrink-0 mt-1">
                  <Search size={24} className="text-surface-400 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-graphite uppercase tracking-widest mb-1">Внимание:</div>
                  <p className="text-[13px] text-graphite/70 leading-relaxed pr-4">
                    В данной области станции не найдены. Попробуйте изменить масштаб или параметры фильтрации.
                  </p>
                </div>
              </div>
            )}
            </div>

            {/* 2. Блок списка заправок */}
            <div className={`flex-1 overflow-y-auto p-4 ${mobileViewMode === 'map' ? 'hidden md:block' : 'block'}`}>
            <div className="flex flex-col gap-3">
              {displayStations.slice(0, 50).map(station => (
                <div key={station.id} className="p-3 border border-surface-200 bg-surface-50 rounded-xl flex flex-col gap-3 hover:border-primary/30 transition-colors cursor-default">
                  
                  {/* Верхняя часть: Иконка, Текст и Дистанция */}
                  <div className="flex items-start gap-3">
                    
                    {/* Иконка */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      station.type === 'cng' ? 'bg-secondary-50 text-secondary-600' : 
                      station.type === 'lng' ? 'bg-primary-50 text-primary-600' : 
                      station.type === 'lpg' ? 'bg-red-50 text-red-500' : 
                      'bg-orange-50 text-orange-500' // service
                    }`}>
                      {station.type === 'service' ? <Settings2 size={18} /> : <Flame size={18} />}
                    </div>
                    
                    {/* Название и адрес */}
                    <div className="overflow-hidden flex-1">
                      <h4 className="text-[13px] font-bold text-graphite leading-tight truncate" title={station.title}>
                        {station.title}
                      </h4>
                      <p className="text-[10px] text-utility-muted font-medium mt-1 line-clamp-2 leading-snug" title={station.address}>
                        {station.address}
                      </p>
                    </div>
                    
                    {/* Бейдж дистанции */}
                    {station.distance !== undefined && (
                      <div className="shrink-0 flex flex-col items-end">
                        <span className="text-[11px] font-bold text-graphite bg-surface-100 px-2 py-1 rounded-md whitespace-nowrap border border-surface-200">
                          {station.distance < 1 ? '< 1 км' : `${station.distance.toFixed(1)} км`}
                        </span>
                        <span className="text-[8px] text-utility-muted uppercase tracking-widest mt-1 font-semibold">
                          по прямой
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => window.open(`https://yandex.ru/maps/?rtext=~${station.lat},${station.lon}&rtt=auto`, '_blank')}
                      className="flex-1 py-2 bg-white border border-surface-200 shadow-sm rounded-lg text-[11px] font-bold text-graphite hover:bg-surface-100 hover:border-graphite/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Navigation size={14} className="text-utility-muted" />
                      <span>МАРШРУТ</span>
                    </button>
                    
                    {station.cleanPhone && (
                      <a 
                        href={`tel:${station.cleanPhone}`}
                        className="flex-1 py-2 bg-green-50 border border-green-200 shadow-sm rounded-lg text-[11px] font-bold text-green-700 hover:bg-green-100 hover:border-green-300 transition-all flex items-center justify-center gap-2"
                      >
                        <Phone size={14} />
                        <span>ПОЗВОНИТЬ</span>
                      </a>
                    )}
                  </div>
                  
                </div>
              ))}

              {/* Уведомление, если станций больше 50 */}
              {displayStations.length > 50 && (
                <div className="text-center py-4 text-[11px] text-utility-muted font-medium">
                  Показаны 50 ближайших станций. Остальные {displayStations.length - 50} можно посмотреть на карте.
                </div>
              )}

              {displayStations.length === 0 && (
                <div className="text-center text-utility-muted text-xs py-8 font-medium">
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>
          
          {/* --- ПРАВЫЙ БЛОК (КАРТА) --- */}
          {/* На десктопе занимает всё оставшееся место. На мобильном скрывается, если открыт список */}
          <div className={`flex-1 h-full relative bg-gray-100 ${mobileViewMode === 'list' ? 'hidden md:block' : 'block'}`}>
            {!isMapLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                <Loader2 size={32} className="text-primary animate-spin mb-3" />
                <p className="text-utility-muted font-bold uppercase tracking-widest text-[10px]">
                  Загрузка карты...
                </p>
              </div>
            )}
            <div id="yandex-custom-map" className="w-full h-full relative z-10"></div>
          </div>

      </div>
    );
  }

  return null;
};

export default App;

};