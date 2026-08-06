import re
import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace main container start
old_main_start = """      return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-surface-50 overflow-hidden relative">
          
          {/* Левая панель (Десктоп) / Верхняя панель (Мобилка) */}
          <div className={`flex flex-col w-full md:w-[380px] md:absolute md:left-4 md:top-4 md:bottom-4 md:bg-transparent z-10 md:pointer-events-none shrink-0`}>
            
            {/* Шапка + Фильтры (Отображаются всегда) */}
            <div className="flex flex-col shrink-0 bg-white px-4 pt-4 pb-2 md:p-5 rounded-b-2xl md:rounded-[2rem] shadow-sm md:shadow-2xl md:border border-surface-100 md:pointer-events-auto z-20 relative">"""

new_main_start = """      return (
        {/* ГЛАВНЫЙ КОНТЕЙНЕР ЭКРАНА */}
        <div className="flex flex-col md:flex-row h-full w-full bg-surface-50 overflow-hidden">
          
          {/* --- ЛЕВЫЙ САЙДБАР --- */}
          {/* На мобильном: высота подстраивается под контент (в режиме карты) или на весь экран (в списке). На десктопе: всегда на всю высоту, ширина 400px */}
          <div className={`flex flex-col w-full md:w-[400px] shrink-0 bg-surface-50 border-r border-surface-200 z-10 transition-all ${mobileViewMode === 'map' ? 'h-auto md:h-full' : 'h-full'}`}>
            
            {/* 1. Блок с фильтрами (ВСЕГДА ВИДИМ) */}
            <div className="shrink-0 bg-white px-4 pt-4 pb-2 shadow-sm relative z-20">"""

content = content.replace(old_main_start, new_main_start)

# Replace list container start
old_list_start = """            {/* Контейнер Списка */}
            <div className={`flex-1 overflow-y-auto px-4 pb-6 bg-white md:rounded-[2rem] md:shadow-2xl md:border border-surface-100 md:pointer-events-auto md:mt-4 relative z-10 scrollbar-hide ${mobileViewMode === 'map' ? 'hidden md:block' : 'block'}`}>"""

new_list_start = """            {/* 2. Блок списка заправок */}
            <div className={`flex-1 overflow-y-auto p-4 ${mobileViewMode === 'map' ? 'hidden md:block' : 'block'}`}>"""

content = content.replace(old_list_start, new_list_start)

# Replace map container start
old_map_start = """          </div>
          
        </div>

        {/* Контейнер Карты (Занимает всё свободное место) */}
        <div className={`flex-1 min-h-0 relative flex-col w-full h-full md:p-6 ${mobileViewMode === 'list' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 relative w-full h-full md:rounded-3xl border-0 md:border border-surface-200 shadow-sm overflow-hidden bg-surface-100 z-0">"""

new_map_start = """          </div>
          
          {/* --- ПРАВЫЙ БЛОК (КАРТА) --- */}
          {/* На десктопе занимает всё оставшееся место. На мобильном скрывается, если открыт список */}
          <div className={`flex-1 h-full relative bg-gray-100 ${mobileViewMode === 'list' ? 'hidden md:block' : 'block'}`}>"""

content = content.replace(old_map_start, new_map_start)

# Remove the extra inner div from the map container closure
# Current end of map container:
#             )}
#             <div id="yandex-custom-map" className="w-full h-full relative z-10"></div>
#           </div>
#         </div>

old_map_end = """            )}
            <div id="yandex-custom-map" className="w-full h-full relative z-10"></div>
          </div>
        </div>"""

new_map_end = """            )}
            <div id="yandex-custom-map" className="w-full h-full relative z-10"></div>
          </div>"""

content = content.replace(old_map_end, new_map_end)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
