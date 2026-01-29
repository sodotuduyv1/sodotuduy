
import React, { useState, useRef, useEffect } from 'react';
import { Lesson, MindMapNode } from './types';
import { geminiService } from './services/geminiService';
import MindMapCanvas from './components/MindMapCanvas';

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [manualLessonTitle, setManualLessonTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingMessage('AI đang quét cấu trúc tài liệu PDF...');

    try {
      setTimeout(async () => {
        const mockTOC = "Chương 1: Nhập môn AI\nChương 2: Xử lý ngôn ngữ\nChương 3: Học máy\nChương 4: Deep Learning";
        const extractedLessons = await geminiService.extractLessonsFromText(mockTOC);
        setLessons(extractedLessons);
        setIsProcessing(false);
        setProcessingMessage('');
      }, 1200);
    } catch (error: any) {
      handleApiError(error);
      setIsProcessing(false);
    }
  };

  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    const message = error?.message || "";
    if (message.includes("Requested entity was not found")) {
      alert("Lỗi model: Hệ thống không tìm thấy model hoặc Key không hợp lệ. Hãy thử nhấn 'Cấu hình AI' ở thanh bên.");
    } else {
      alert(`Lỗi AI: ${message || "Không thể kết nối với trí tuệ nhân tạo."}`);
    }
  };

  const handleLoadSampleData = () => {
    setIsProcessing(true);
    setProcessingMessage('Đang khởi tạo dữ liệu mẫu...');
    
    setTimeout(() => {
      const sampleLessons: Lesson[] = [
        { id: 's1', title: 'Khám phá Hệ Mặt Trời' },
        { id: 's2', title: 'Năng lượng tái tạo' },
        { id: 's3', title: 'Lịch sử Văn minh nhân loại' }
      ];
      setLessons(sampleLessons);
      setSelectedLessonId('s1');
      setIsProcessing(false);
      setProcessingMessage('');
    }, 600);
  };

  const handleGenerateMindMap = async (fullCourse: boolean = false) => {
    if (lessons.length === 0) return;
    
    setIsProcessing(true);
    setProcessingMessage(fullCourse ? 'Gemini AI đang tổng hợp toàn bộ tri thức...' : 'AI đang bóc tách các ý chính...');
    
    try {
      let title = "Sơ đồ tri thức";
      let context = "";

      if (fullCourse) {
        title = "Tổng quan chương trình";
        context = lessons.map((l, i) => `${i + 1}. ${l.title}`).join(", ");
      } else {
        const selectedLesson = lessons.find(l => l.id === selectedLessonId);
        if (!selectedLesson) return;
        title = selectedLesson.title;
        context = `Nội dung trọng tâm của ${selectedLesson.title}`;
      }

      const data = await geminiService.generateMindMap(title, context, fullCourse);
      setMindMapData(data);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-80' : 'w-0'} 
        transition-all duration-300 ease-in-out border-r border-slate-200 bg-white flex flex-col relative z-30
      `}>
        <div className="p-6 border-b border-slate-100 min-w-[320px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <i className="fa-solid fa-brain text-xl"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none">EduMind AI</h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">v2.6 Lite Edition</span>
              </div>
            </div>
            {window.innerWidth < 1024 && (
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {lessons.length > 0 && (
            <button 
              onClick={() => handleGenerateMindMap(true)}
              disabled={isProcessing}
              className="w-full mb-6 py-3.5 px-4 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-amber-300"></i>
              <span className="font-bold text-sm tracking-tight">Sơ đồ tổng quát AI</span>
            </button>
          )}

          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="Thêm bài học mới..." 
              value={manualLessonTitle}
              onChange={(e) => setManualLessonTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualLessonTitle.trim()) {
                  setLessons([...lessons, { id: Date.now().toString(), title: manualLessonTitle }]);
                  setManualLessonTitle('');
                }
              }}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
            />
            <i className="fa-solid fa-plus-circle absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"></i>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-w-[320px]">
          {lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLessonId(lesson.id)}
              className={`
                w-full text-left px-4 py-4 rounded-2xl transition-all duration-200 flex items-center gap-4
                ${selectedLessonId === lesson.id 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                  : 'hover:bg-slate-50 text-slate-500 border border-transparent'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
                ${selectedLessonId === lesson.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                {idx + 1}
              </div>
              <span className="font-bold text-sm truncate">{lesson.title}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 min-w-[320px]">
          <button 
            onClick={handleOpenKeySelector}
            className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200"
          >
            <i className="fa-solid fa-gear"></i>
            Cấu hình AI
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fbfcfd]">
        <header className="h-20 px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <i className="fa-solid fa-bars-staggered text-slate-600"></i>
              </button>
            )}
            <h2 className="text-sm font-semibold text-slate-500 truncate max-w-[200px] md:max-w-md">
              {selectedLesson ? selectedLesson.title : "Hệ thống EduMind Flash"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-xs font-bold flex items-center gap-2"
            >
              <i className="fa-solid fa-upload"></i>
              Tải PDF
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-12 relative">
          {isProcessing && (
            <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fa-solid fa-bolt text-indigo-600 animate-pulse text-2xl"></i>
                </div>
              </div>
              <p className="text-slate-900 font-bold text-lg">{processingMessage}</p>
              <p className="text-slate-400 text-sm mt-2">Đang sử dụng model Gemini 3 Flash</p>
            </div>
          )}

          {!selectedLesson ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-32 h-32 bg-indigo-50 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 shadow-inner">
                <i className="fa-solid fa-brain text-5xl"></i>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Chào mừng bạn quay lại</h3>
              <p className="text-slate-500 leading-relaxed mb-10 font-medium">
                Hệ thống đã sẵn sàng với model Gemini Flash. Bạn có thể bắt đầu bằng cách tải PDF hoặc xem dữ liệu mẫu bên dưới.
              </p>
              <div className="flex gap-4">
                <button onClick={handleLoadSampleData} className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:border-indigo-200 transition-all hover:text-indigo-600 shadow-sm">Dữ liệu mẫu</button>
                <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Tải tài liệu</button>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
              <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-4 inline-block border border-indigo-100">Ready for Flash Processing</span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{selectedLesson.title}</h2>
                  
                  <button 
                    onClick={() => handleGenerateMindMap(false)}
                    disabled={isProcessing}
                    className="mt-10 group flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                  >
                    <i className="fa-solid fa-bolt group-hover:scale-125 transition-transform duration-300"></i>
                    <span className="font-bold">Bắt đầu vẽ Mindmap</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {mindMapData && (
        <MindMapCanvas data={mindMapData} onClose={() => setMindMapData(null)} />
      )}
    </div>
  );
};

export default App;
