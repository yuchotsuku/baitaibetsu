// 媒体別売上ページ（React + Tailwindで構成）
// データソース：https://script.google.com/macros/s/AKfycbzgP95iX3fGCHDECDyYeTZPsva2IKloBlbj5R95r5Gm-AGkZu8ak66xGrJr_o5xV3NS_g/exec

import React, { useEffect, useState } from 'react';

// ✅ 契約月 "2025/06/01" → "2025-06" に変換する関数（安全性高い）
const formatMonth = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  } catch {
    return '';
  }
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

  // 絞り込みロジック
  const filtered = data.filter(item => {
    const itemMonth = formatMonth(item['契約月']);
    const monthMatch = selectedMonth ? itemMonth === selectedMonth : true;
    const storeMatch = selectedStore ? item['店舗名'] === selectedStore : true;
    return monthMatch && storeMatch;
  });

  // 月と店舗の選択肢
  const months = [...new Set(data.map(d => formatMonth(d['契約月'])))].filter(Boolean).sort();
  const stores = [...new Set(data.map(d => d['店舗名']))].filter(Boolean).sort();

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">🐻 媒体別売上ページ</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <select className="border rounded-lg p-2 shadow-sm" onChange={e => setSelectedMonth(e.target.value)}>
          <option value=''>🗓 全期間</option>
          {months.map(month => <option key={month} value={month}>{month}</option>)}
        </select>
        <select className="border rounded-lg p-2 shadow-sm" onChange={e => setSelectedStore(e.target.value)}>
          <option value=''>🏪 全店舗</option>
          {stores.map(store => <option key={store} value={store}>{store}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
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
