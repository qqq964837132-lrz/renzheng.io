import React, { useState } from 'react';
import Die from './components/Die';
import { DiceValue, RollResult } from './types';
import { getDiceInterpretation } from './services/gemini';
import { Sparkles, History as HistoryIcon, RotateCcw, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentValue, setCurrentValue] = useState<DiceValue>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  // rollTrigger is used to notify the Die component to spin even if the value is the same
  const [rollTrigger, setRollTrigger] = useState(0);

  const handleRoll = () => {
    if (isRolling) return;

    setIsRolling(true);
    setInterpretation(null); // Clear previous interpretation
    
    // 1. Determine the result immediately
    const finalValue = Math.ceil(Math.random() * 6) as DiceValue;
    
    // 2. Trigger the animation with the new target value
    setCurrentValue(finalValue);
    setRollTrigger(prev => prev + 1);

    // 3. The roll duration must match the CSS transition time (2000ms)
    // We wait for the animation to finish before updating history/AI
    const rollDuration = 2000;

    setTimeout(() => {
      setIsRolling(false);
      
      const newResult: RollResult = {
        value: finalValue,
        timestamp: Date.now(),
      };
      
      setHistory(prev => [newResult, ...prev]);

      if (aiEnabled && process.env.API_KEY) {
        fetchInterpretation(finalValue);
      }
    }, rollDuration);
  };

  const fetchInterpretation = async (val: DiceValue) => {
    setIsLoadingAi(true);
    const text = await getDiceInterpretation(val);
    setInterpretation(text);
    setIsLoadingAi(false);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/50">
                <span className="text-white">🎲</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 hidden sm:block">
                liurenzheng骰子
            </h1>
        </div>
        
        {/* AI Toggle */}
        <button 
          onClick={() => setAiEnabled(!aiEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
            aiEnabled 
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
              : 'bg-gray-800/50 border-gray-700 text-gray-500'
          }`}
        >
          <Sparkles size={16} />
          <span>{aiEnabled ? 'AI 解读开启' : 'AI 已关闭'}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center gap-12 w-full max-w-lg z-0 mt-10 sm:mt-0">
        
        {/* Dice Container */}
        <div className="relative py-10 perspective-container">
           <div className={`absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full transition-opacity duration-1000 ${isRolling ? 'opacity-100 scale-110' : 'opacity-50'}`}></div>
           <Die value={currentValue} rollTrigger={rollTrigger} />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6 w-full">
            <button
                onClick={handleRoll}
                disabled={isRolling}
                className={`
                    group relative px-12 py-4 rounded-2xl font-bold text-xl tracking-widest uppercase
                    transition-all duration-200 active:scale-95
                    ${isRolling 
                        ? 'cursor-not-allowed opacity-80' 
                        : 'hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-1'
                    }
                `}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl transition-all group-hover:opacity-100 opacity-90"></div>
                <span className="relative z-10 flex items-center gap-3">
                    {isRolling ? (
                        <>
                           <RotateCcw className="animate-spin" /> 滚动中...
                        </>
                    ) : (
                        <>
                           <RotateCcw className="group-hover:rotate-180 transition-transform duration-500" /> 掷骰子
                        </>
                    )}
                </span>
            </button>
            
            {/* Result Display */}
            <div className={`text-center min-h-[80px] w-full px-4 transition-all duration-500 ${!isRolling ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
                <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest">当前点数</p>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-sm">
                    {currentValue}
                </div>
            </div>
        </div>

        {/* AI Interpretation Card */}
        {aiEnabled && (
             <div className={`w-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 transition-all duration-500 ${interpretation || isLoadingAi ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Sparkles size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-indigo-300 mb-1">AI 运势解读</h3>
                        {isLoadingAi ? (
                             <div className="flex gap-1 items-center h-6">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                             </div>
                        ) : (
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {interpretation}
                            </p>
                        )}
                    </div>
                </div>
             </div>
        )}
      </main>
      
      {/* History Panel */}
      <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center z-20 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-4 border border-white/10 w-full max-w-lg pointer-events-auto shadow-2xl">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <HistoryIcon size={12} />
                    <span>历史记录 ({history.length})</span>
                </div>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                        <Trash2 size={10} /> 清空
                    </button>
                )}
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {history.length === 0 ? (
                    <div className="w-full text-center py-2 text-sm text-gray-600 italic">
                        暂无记录，快来试试手气吧！
                    </div>
                ) : (
                    history.map((roll, idx) => (
                        <div key={`${roll.timestamp}-${idx}`} className="flex-shrink-0 flex flex-col items-center gap-1 animate-fade-in-right" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg font-bold text-white border border-slate-700 shadow-sm relative group">
                                {roll.value}
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-[10px] text-gray-500">
                                {new Date(roll.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
      
      <style>{`
        /* Custom scrollbar for history */
        .scrollbar-thin::-webkit-scrollbar {
            height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: rgba(75, 85, 99, 0.5);
            border-radius: 20px;
        }
        
        @keyframes fade-in-right {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right {
            animation: fade-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;