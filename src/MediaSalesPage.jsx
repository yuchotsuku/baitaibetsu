// 媒体別売上ページ（React + Tailwindで構成）
// データソース：https://script.google.com/macros/s/AKfycbzgP95iX3fGCHDECDyYeTZPsva2IKloBlbj5R95r5Gm-AGkZu8ak66xGrJr_o5xV3NS_g/exec

import React, { useEffect, useState } from 'react';

// ✅ 契約月 "2025/06/01" → "2025-06" に変換する関数（安全性高い）
const formatMonth = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (!isNaN(date)) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }
  const match = dateString.match(/^(\d{4})[/-](\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return '';
};

export default function MediaSalesPage() {
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStore, setSelectedStore] = useState('');

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbzgP95iX3fGCHDECDyYeTZPsva2IKloBlbj5R95r5Gm-AGkZu8ak66xGrJr_o5xV3NS_g/exec')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err));
  }, []);

  const filtered = data.filter(item => {
    const itemMonth = formatMonth(item['契約月']);
    const monthMatch = selectedMonth ? itemMonth === selectedMonth : true;
    const storeMatch = selectedStore ? item['店舗名'] === selectedStore : true;
    return monthMatch && storeMatch;
  });

  const months = [...new Set(data.map(d => formatMonth(d['契約月'])))].filter(Boolean).sort();
  const stores = [...new Set(data.map(d => d['店舗名']))].filter(Boolean).sort();

  const introSummary = {};
  filtered.forEach(item => {
    const key = item['紹介者'] || '未記入';
    const amount = Number(item['合計売上']) || 0;
    introSummary[key] = (introSummary[key] || 0) + amount;
  });
  const summaryList = Object.entries(introSummary).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">🐻 媒体別売上ページ</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <select
          className="rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
          onChange={e => setSelectedMonth(e.target.value)}
        >
          <option value=''>🗓 全期間</option>
          {months.map(month => <option key={month} value={month}>{month}</option>)}
        </select>
        <select
          className="rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
          onChange={e => setSelectedStore(e.target.value)}
        >
          <option value=''>🏪 全店舗</option>
          {stores.map(store => <option key={store} value={store}>{store}</option>)}
        </select>
      </div>

      {/* カード形式の紹介者売上ランキング */}
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">📊 紹介者別売上ランキング</h2>
        {summaryList.map(([name, total], idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-4 shadow-md text-gray-800 transition ${
              idx === 0 ? 'bg-blue-300' : idx === 1 || idx === 2 ? 'bg-yellow-200' : idx === 3 ? 'bg-purple-200' : 'bg-sky-200'
            }`}
          >
            <p className="text-lg font-bold mb-1">{idx + 1}位</p>
            <p className="text-xl">{name}</p>
            <p className="text-lg font-semibold text-gray-700">￥{total.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 表形式の全データ */}
      <div className="overflow-x-auto mt-10">
        <table className="min-w-full text-sm border bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-pink-100 text-gray-800">
            <tr>
              <th className="border p-3">契約月</th>
              <th className="border p-3">紹介者</th>
              <th className="border p-3">店舗名</th>
              <th className="border p-3">合計売上</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-pink-50">
                <td className="border p-2 text-center">{formatMonth(item['契約月'])}</td>
                <td className="border p-2 text-center">{item['紹介者']}</td>
                <td className="border p-2 text-center">{item['店舗名']}</td>
                <td className="border p-2 text-right font-semibold text-pink-600">
                  {Number(item['合計売上']).toLocaleString()} 円
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
