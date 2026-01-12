import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';

/**
 * 預設分類關鍵字邏輯
 */
const CATEGORY_RULES = {
  '行銷推廣': ['廣告', 'FB', 'Google', '行銷', '推廣', 'SEO', '展覽'],
  '營運成本': ['租金', '水電', '文具', '維護', '清潔', '辦公室', '保險'],
  '人力資源': ['薪資', '獎金', '勞健保', '午餐', '培訓', '福利', '差旅'],
  '資訊技術': ['伺服器', '雲端', 'AWS', '軟體', '授權', 'IT', '電腦', '網域'],
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const App = () => {
  // 初始範例資料
  const [data, setData] = useState([
    { id: 1, name: '辦公室租金', spend: 50000, budget: 50000 },
    { id: 2, name: 'AWS 雲端伺服器', spend: 12500, budget: 15000 },
    { id: 3, name: 'Facebook 廣告投放', spend: 32000, budget: 30000 },
    { id: 4, name: '員工午餐補助', spend: 6800, budget: 8000 },
    { id: 5, name: '辦公室文具', spend: 1500, budget: 1000 },
    { id: 6, name: '專業責任保險', spend: 15000, budget: 15000 },
    { id: 7, name: 'Google 關鍵字', spend: 18000, budget: 25000 },
  ]);

  const [newItem, setNewItem] = useState({ name: '', spend: '', budget: '' });

  /**
   * 自動分類函數
   */
  const classifyItem = (name) => {
    for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
      if (keywords.some(kw => name.toUpperCase().includes(kw.toUpperCase()))) {
        return category;
      }
    }
    return '其他';
  };

  /**
   * 計算處理後的數據
   */
  const analyzedData = useMemo(() => {
    return data.map(item => {
      const category = classifyItem(item.name);
      const percentage = item.budget > 0 ? (item.spend / item.budget) * 100 : 0;
      return { ...item, category, percentage: parseFloat(percentage.toFixed(2)) };
    });
  }, [data]);

  /**
   * 類別統計數據
   */
  const categorySummary = useMemo(() => {
    const summary = {};
    analyzedData.forEach(item => {
      if (!summary[item.category]) {
        summary[item.category] = { name: item.category, spend: 0, budget: 0 };
      }
      summary[item.category].spend += item.spend;
      summary[item.category].budget += item.budget;
    });
    return Object.values(summary);
  }, [analyzedData]);

  // 總計數據
  const totalSpend = analyzedData.reduce((sum, i) => sum + i.spend, 0);
  const totalBudget = analyzedData.reduce((sum, i) => sum + i.budget, 0);
  const overallPercentage = (totalSpend / totalBudget) * 100;

  /**
   * 匯出 CSV 功能
   */
  const handleDownloadCSV = () => {
    if (analyzedData.length === 0) return;

    // 定義欄位標題
    const headers = ['項目名稱', '類別', '支出金額', '預算額度', '使用百分比(%)'];
    
    // 將數據轉換為 CSV 格式
    const csvRows = analyzedData.map(item => [
      item.name,
      item.category,
      item.spend,
      item.budget,
      `${item.percentage}%`
    ].join(','));

    // 合併標題與內容，加入 BOM (\ufeff) 以防 Excel 中文亂碼
    const csvContent = "\ufeff" + [headers.join(','), ...csvRows].join('\n');
    
    // 建立下載連結
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `財務分析報告_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.spend || !newItem.budget) return;
    const item = {
      id: Date.now(),
      name: newItem.name,
      spend: parseFloat(newItem.spend),
      budget: parseFloat(newItem.budget)
    };
    setData([...data, item]);
    setNewItem({ name: '', spend: '', budget: '' });
  };

  const deleteItem = (id) => {
    setData(data.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              即時財務預算分析系統
            </h1>
            <p className="text-slate-500 mt-1">自動分類、預算追蹤與數據視覺化</p>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="px-4 py-1 border-r border-slate-100 text-center">
              <p className="text-xs text-slate-400 uppercase font-bold">總預算</p>
              <p className="text-lg font-semibold text-slate-700">${totalBudget.toLocaleString()}</p>
            </div>
            <div className="px-4 py-1 text-center">
              <p className="text-xs text-slate-400 uppercase font-bold">目前執行率</p>
              <p className={`text-lg font-semibold ${overallPercentage > 100 ? 'text-red-500' : 'text-emerald-500'}`}>
                {overallPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Input Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-500" />
              新增分析項目
            </h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">項目名稱</label>
                <input 
                  type="text"
                  placeholder="例如：Google 廣告"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">支出金額</label>
                  <input 
                    type="number"
                    placeholder="金額"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newItem.spend}
                    onChange={e => setNewItem({...newItem, spend: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">預算額度</label>
                  <input 
                    type="number"
                    placeholder="預算"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newItem.budget}
                    onChange={e => setNewItem({...newItem, budget: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                加入分析
              </button>
            </form>
          </div>

          {/* Visualization Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-80">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <PieIcon size={20} className="text-purple-500" />
                  支出類別佔比
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={categorySummary}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="spend"
                    >
                      {categorySummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-80">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 size={20} className="text-emerald-500" />
                  預算與實際對比
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={categorySummary}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar name="實際支出" dataKey="spend" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar name="預算額度" dataKey="budget" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold">分析項目明細</h3>
            <div className="flex gap-2">
               <button 
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors font-medium text-sm"
               >
                <Download size={18} />
                下載報表 (CSV)
               </button>
               <button className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                <Filter size={18} />
               </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">項目名稱</th>
                  <th className="px-6 py-4">自動分類</th>
                  <th className="px-6 py-4">支出金額</th>
                  <th className="px-6 py-4">預算額度</th>
                  <th className="px-6 py-4">使用百分比</th>
                  <th className="px-6 py-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyzedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-700">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">${item.spend.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">${item.budget.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2 w-24 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.percentage > 100 ? 'bg-red-500' : item.percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${item.percentage > 100 ? 'text-red-500' : 'text-slate-500'}`}>
                          {item.percentage}%
                        </span>
                        {item.percentage > 100 ? <AlertTriangle size={14} className="text-red-500" /> : item.percentage === 100 ? <CheckCircle2 size={14} className="text-emerald-500" /> : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analyzedData.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              目前尚無分析數據，請從左側新增項目。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;