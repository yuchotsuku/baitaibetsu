// 媒体別売上ページ（React + Tailwindで構成）
// データソース：https://script.google.com/macros/s/AKfycbzgP95iX3fGCHDECDyYeTZPsva2IKloBlbj5R95r5Gm-AGkZu8ak66xGrJr_o5xV3NS_g/exec

import React, { useEffect, useState } from 'react';

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
  const [selectedMedia, setSelectedMedia] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbzgP95iX3fGCHDECDyYeTZPsva2IKloBlbj5R95r5Gm-AGkZu8ak66xGrJr_o5xV3NS_g/exec')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setSearchClicked(false);
  }, [selectedMonth, selectedStore, selectedMedia]);

  const filtered = data.filter(item => {
    const itemMonth = formatMonth(item['契約月']);
    const isJuneOrAfter = itemMonth >= '2025-06';
    const monthMatch = selectedMonth ? itemMonth === selectedMonth : true;
    const storeMatch = selectedStore ? item['店舗名'] === selectedStore : true;
    const mediaMatch = selectedMedia ? (item['紹介者'] || '未記入') === selectedMedia : true;
    return isJuneOrAfter && monthMatch && storeMatch && mediaMatch;
  });

  const months = [...new Set(data.map(d => formatMonth(d['契約月'])))]
    .filter(month => month && month >= '2025-06')
    .sort();
  const stores = [...new Set(data.map(d => d['店舗名']))].filter(Boolean).sort();
  const mediaList = [...new Set(data.map(d => d['紹介者'] || '未記入'))].sort();

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
          className="rounded-full border border-pink-300 bg-white text-gray-700 px-5 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-200"
          onChange={e => setSelectedMonth(e.target.value)}
          value={selectedMonth}
        >
          <option value=''>🗓 全期間</option>
          {months.map(month => <option key={month} value={month}>{month}</option>)}
        </select>

        <select
          className="rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
          onChange={e => setSelectedStore(e.target.value)}
          value={selectedStore}
        >
          <option value=''>🏪 全店舗</option>
          {stores.map(store => <option key={store} value={store}>{store}</option>)}
        </select>

        <select
          className="rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
          onChange={e => setSelectedMedia(e.target.value)}
          value={selectedMedia}
        >
          <option value=''>📣 全媒体</option>
          {mediaList.map(media => <option key={media} value={media}>{media}</option>)}
        </select>

        <button
          onClick={() => setSearchClicked(true)}
          className="rounded-full bg-pink-500 text-white px-6 py-2 text-sm shadow hover:bg-pink-600 transition-all duration-200"
        >
          🔍 検索
        </button>
      </div>

      {searchClicked && (
        <>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3 text-center">🎯 紹介者ごとの合計売上</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border bg-white shadow rounded-lg overflow-hidden">
                <thead className="bg-blue-100 text-gray-800">
                  <tr>
                    <th className="border p-3">紹介者</th>
                    <th className="border p-3">合計売上</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryList.map(([name, total], idx) => (
                    <tr key={idx} className="hover:bg-blue-50">
                      <td className="border p-2 text-center">{name}</td>
                      <td className="border p-2 text-right font-semibold text-blue-600">{total.toLocaleString()} 円</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">該当するデータがありません</p>
          ) : (
            <div className="grid gap-4 mt-10">
              {filtered.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition duration-300"
                >
                  <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                    <div className="flex-1 min-w-[150px]">
                      <span className="font-semibold text-pink-600">📅 契約月：</span>
                      {formatMonth(item['契約月'])}
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <span className="font-semibold text-pink-600">🤝 紹介者：</span>
                      {item['紹介者'] || '未記入'}
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <span className="font-semibold text-pink-600">🏪 店舗名：</span>
                      {item['店舗名']}
                    </div>
                    <div className="flex-1 min-w-[150px] text-right text-pink-700 font-bold">
                      💰 {Number(item['合計売上']).toLocaleString()} 円
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
