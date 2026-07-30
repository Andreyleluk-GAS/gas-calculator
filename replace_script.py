import re

with open('src/App.jsx', 'rb') as f:
    content = f.read()

def replace_block(content, old, new):
    return content.replace(old, new)

# 1. TRUCK_REPORT (has setSilentOldReport('TRUCK_REPORT_OLD'))
truck_header_pattern = re.compile(b'<header className="mb-3 md:mb-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">\\s*\\{\\/\\* 1.*?\\<\\/header>', re.DOTALL)
truck_header_new = b'''<header className="mb-3 md:mb-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">

            {/* 1. \xd0\x9a\xd0\xbd\xd0\xbe\xd0\xbf\xd0\xba\xd0\xb0 \xd0\x9d\xd0\xb0\xd0\xb7\xd0\xb0\xd0\xb4 */}
            <BackBtn className="order-1 w-[28%] md:w-[160px] md:mr-auto px-1 md:px-4" />

            {/* 2. \xd0\x9a\xd0\xbd\xd0\xbe\xd0\xbf\xd0\xba\xd0\xb0 \xd0\x9e\xd1\x82\xd1\x87\xd1\x91\xd1\x82 OLD (\xd0\x9d\xd0\xb0 \xd0\xb4\xd0\xb5\xd1\x81\xd0\xba\xd1\x82\xd0\xbe\xd0\xbf\xd0\xb5 - \xd0\xb2 \xd1\x86\xd0\xb5\xd0\xbd\xd1\x82\xd1\x80\xd0\xb5/\xd1\x81\xd0\xbf\xd1\x80\xd0\xb0\xd0\xb2\xd0\xb0, \xd0\xbd\xd0\xb0 \xd0\xbc\xd0\xbe\xd0\xb1\xd0\xb8\xd0\xbb\xd0\xba\xd0\xb5 - \xd0\xb2\xd0\xbd\xd0\xb8\xd0\xb7\xd1\x83) */}
            {!isRem && !isLng && (
              <button onClick={() => window.innerWidth < 768 ? setSilentOldReport('TRUCK_REPORT_OLD') : navigateTo('TRUCK_REPORT_OLD')}
                className="order-3 md:order-2 w-full md:w-[160px] h-10 shrink-0 flex justify-center items-center gap-2 px-2 md:px-4 bg-surface border border-surface-200 rounded-xl text-[11px] md:text-xs font-bold text-graphite shadow-sm hover:border-secondary hover:text-secondary active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <BarChart3 size={14} /> 
                <span className="truncate">\xd0\x9e\xd1\x82\xd1\x87\xd1\x91\xd1\x82 OLD</span>
              </button>
            )}

            {/* 3. \xd0\x9a\xd0\xbd\xd0\xbe\xd0\xbf\xd0\xba\xd0\xb0 \xd0\xa1\xd0\xba\xd1\x80\xd0\xb8\xd0\xbd\xd1\x88\xd0\xbe\xd1\x82 (\xd0\x9d\xd0\xb0 \xd0\xb4\xd0\xb5\xd1\x81\xd0\xba\xd1\x82\xd0\xbe\xd0\xbf\xd0\xb5 - \xd0\xba\xd1\x80\xd0\xb0\xd0\xb9\xd0\xbd\xd1\x8f\xd1\x8f \xd1\x81\xd0\xbf\xd1\x80\xd0\xb0\xd0\xb2\xd0\xb0, \xd0\xbd\xd0\xb0 \xd0\xbc\xd0\xbe\xd0\xb1\xd0\xb8\xd0\xbb\xd0\xba\xd0\xb5 - \xd0\xbf\xd1\x80\xd0\xb0\xd0\xb2\xd0\xb0\xd1\x8f \xd0\xb2 1-\xd0\xbc \xd1\x80\xd1\x8f\xd0\xb4\xd1\x83) */}
            <button 
              onClick={handleTakeScreenshot}
              className={`order-2 md:order-3 w-[28%] md:w-[160px] h-10 shrink-0 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-4 border rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer ${
                screenshotCopied 
                  ? 'bg-green-50 border-green-400 text-green-700 scale-105 shadow-md' 
                  : 'bg-surface border-surface-200 text-graphite hover:border-primary hover:text-primary active:scale-95'
              }`}
            >
              {screenshotCopied ? <Check size={14} /> : <Camera size={14} />}
              <span className="truncate">{screenshotCopied ? '\xd0\xa1\xd0\xba\xd0\xbe\xd0\xbf\xd0\xb8\xd1\x80\xd0\xbe\xd0\xb2\xd0\xb0\xd0\xbd\xd0\xbe!' : '\xd0\xa1\xd0\xba\xd1\x80\xd0\xb8\xd0\xbd\xd1\x88\xd0\xbe\xd1\x82'}</span>
            </button>

          </header>'''
content = truck_header_pattern.sub(truck_header_new, content, count=1)

# 2. LNG_CNG_REPORT (has setSilentOldReport('LNG_CNG_REPORT_OLD'))
lng_header_pattern = re.compile(b'<header className="mb-3 md:mb-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">\\s*<BackBtn className="w-\\[28%\\] md:w-\\[160px\\] md:mr-auto px-1 md:px-4" />\\s*<button onClick=\\{\\(\\) => window\\.innerWidth < 768 \\? setSilentOldReport\\(\'LNG_CNG_REPORT_OLD\'\\) : navigateTo\\(\'LNG_CNG_REPORT_OLD\'\\)\\}[^<]*\\s*<BarChart3[^<]*\\s*<span[^<]*\\<\\/span>\\s*\\<\\/button>\\s*<button\\s*onClick=\\{handleTakeScreenshot\\}[^<]*\\s*\\{screenshotCopied \\? <Check size=\\{14\\} /> : <Camera size=\\{14\\} />\\}\\s*<span[^<]*\\<\\/span>\\s*\\<\\/button>\\s*\\<\\/header>', re.DOTALL)
lng_header_new = b'''<header className="mb-3 md:mb-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">

            <BackBtn className="order-1 w-[28%] md:w-[160px] md:mr-auto px-1 md:px-4" />

            <button onClick={() => window.innerWidth < 768 ? setSilentOldReport('LNG_CNG_REPORT_OLD') : navigateTo('LNG_CNG_REPORT_OLD')}
              className="order-3 md:order-2 w-full md:w-[160px] h-10 shrink-0 flex justify-center items-center gap-2 px-2 md:px-4 bg-surface border border-surface-200 rounded-xl text-[11px] md:text-xs font-bold text-graphite shadow-sm hover:border-secondary hover:text-secondary active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <BarChart3 size={14} /> 
              <span className="truncate">\xd0\x9e\xd1\x82\xd1\x87\xd1\x91\xd1\x82 OLD</span>
            </button>

            <button 
              onClick={handleTakeScreenshot}
              className={`order-2 md:order-3 w-[28%] md:w-[160px] h-10 shrink-0 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-4 border rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer ${
                screenshotCopied 
                  ? 'bg-green-50 border-green-400 text-green-700 scale-105 shadow-md' 
                  : 'bg-surface border-surface-200 text-graphite hover:border-primary hover:text-primary active:scale-95'
              }`}
            >
              {screenshotCopied ? <Check size={14} /> : <Camera size={14} />}
              <span className="truncate">{screenshotCopied ? '\xd0\xa1\xd0\xba\xd0\xbe\xd0\xbf\xd0\xb8\xd1\x80\xd0\xbe\xd0\xb2\xd0\xb0\xd0\xbd\xd0\xbe!' : '\xd0\xa1\xd0\xba\xd1\x80\xd0\xb8\xd0\xbd\xd1\x88\xd0\xbe\xd1\x82'}</span>
            </button>

          </header>'''
content = lng_header_pattern.sub(lng_header_new, content, count=1)

# 3. TRUCK_REPORT_OLD and LNG_CNG_REPORT_OLD
# Both have identical headers now:
old_report_header = b'''<header className="px-6 md:px-10 pt-6 md:pt-10 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">

            {/* 1. \xd0\x9a\xd0\xbd\xd0\xbe\xd0\xbf\xd0\xba\xd0\xb0 \xd0\x9d\xd0\xb0\xd0\xb7\xd0\xb0\xd0\xb4 */}
            <BackBtn className="w-[28%] md:w-[160px] md:mr-auto px-1 md:px-4" />

            {/* 2. \xd0\x9a\xd0\xbd\xd0\xbe\xd0\xbf\xd0\xba\xd0\xb0 \xd0\xa1\xd0\xba\xd1\x80\xd0\xb8\xd0\xbd\xd1\x88\xd0\xbe\xd1\x82 */}
            <button 
              onClick={handleTakeOldScreenshot} 
              className={`order-2 md:order-none w-[28%] md:w-[160px] h-10 shrink-0 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-4 border rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer ${
                screenshotCopied 
                  ? 'bg-green-50 border-green-400 text-green-700 scale-105 shadow-md' 
                  : 'bg-surface-100 border-surface-200 text-graphite hover:bg-surface-200'
              }`}
            >
              {screenshotCopied ? <Check size={14} /> : <Camera size={14} />}
              <span className="truncate">{screenshotCopied ? '\xd0\xa1\xd0\xba\xd0\xbe\xd0\xbf\xd0\xb8\xd1\x80\xd0\xbe\xd0\xb2\xd0\xb0\xd0\xbd\xd0\xbe!' : '\xd0\xa1\xd0\xba\xd1\x80\xd0\xb8\xd0\xbd\xd1\x88\xd0\xbe\xd1\x82'}</span>
            </button>

          </header>'''

old_report_header_new = b'''<header className="px-6 md:px-10 pt-6 md:pt-10 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">
            <BackBtn className="order-1 w-[28%] md:w-[160px] md:mr-auto px-1 md:px-4" />
            <button 
              onClick={handleTakeOldScreenshot} 
              className={`order-2 w-[28%] md:w-[160px] h-10 shrink-0 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-4 border rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer ${
                screenshotCopied 
                  ? 'bg-green-50 border-green-400 text-green-700 scale-105 shadow-md' 
                  : 'bg-surface-100 border-surface-200 text-graphite hover:bg-surface-200'
              }`}
            >
              {screenshotCopied ? <Check size={14} /> : <Camera size={14} />}
              <span className="truncate">{screenshotCopied ? '\xd0\xa1\xd0\xba\xd0\xbe\xd0\xbf\xd0\xb8\xd1\x80\xd0\xbe\xd0\xb2\xd0\xb0\xd0\xbd\xd0\xbe!' : '\xd0\xa1\xd0\xba\xd1\x80\xd0\xb8\xd0\xbd\xd1\x88\xd0\xbe\xd1\x82'}</span>
            </button>
          </header>'''
# Using string replace since they are exact matches
content = replace_block(content, old_report_header.decode('utf-8').replace('\r\n', '\n').encode('utf-8'), old_report_header_new)

with open('src/App.jsx', 'wb') as f:
    f.write(content)


with open('src/EnergyServiceScreen.jsx', 'rb') as f:
    content = f.read()

energy_header_pattern = re.compile(b'<header className="mb-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">\\s*<button onClick=\\{\\(\\) => setShowReport\\(false\\)\\}[^<]*\\s*<ChevronLeft size=\\{14\\} /> \\S+\\s*</button>\\s*<button\\s*onClick=\\{handleTakeScreenshot\\}[^<]*\\s*\\{screenshotCopied \\? <Check size=\\{14\\} /> : <Camera size=\\{14\\} />\\}\\s*<span[^<]*\\<\\/span>\\s*\\<\\/button>\\s*\\<\\/header>', re.DOTALL)
energy_header_new = b'''<header className="mb-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-3 print:hidden">
            <BackBtn onClick={() => setShowReport(false)} className="order-1 w-[28%] md:w-[160px] md:mr-auto px-1 md:px-4" />
            <button 
              onClick={handleTakeScreenshot}
              className={`order-2 w-[28%] md:w-[160px] h-10 shrink-0 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-4 border rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer ${
                screenshotCopied 
                  ? 'bg-green-50 border-green-400 text-green-700 scale-105 shadow-md' 
                  : 'bg-surface border-surface-200 text-graphite hover:border-primary hover:text-primary active:scale-95'
              }`}
            >
              {screenshotCopied ? <Check size={14} /> : <Camera size={14} />}
              <span className="truncate">{screenshotCopied ? '\xd0\xa1\xd0\xba\xd0\xbe\xd0\xbf\xd0\xb8\xd1\x80\xd0\xbe\xd0\xb2\xd0\xb0\xd0\xbd\xd0\xbe!' : '\xd0\xa1\xd0\xba\xd1\x80\xd0\xb8\xd0\xbd\xd1\x88\xd0\xbe\xd1\x82'}</span>
            </button>
          </header>'''
content = energy_header_pattern.sub(energy_header_new, content, count=1)

with open('src/EnergyServiceScreen.jsx', 'wb') as f:
    f.write(content)
print('Done!')
