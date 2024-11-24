"use client";

import { useState, useEffect } from "react";
import { utils, writeFile } from "xlsx";

interface Item {
  itemName: string;
  quantity: number;
  location: string;
  category: string;
}

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const itemsResponse = await fetch('/api/get-items');
      const itemsData = await itemsResponse.json();
      setItems(itemsData.items);
      setFilteredItems(itemsData.items);

      const categoriesResponse = await fetch('/api/get-categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.categories);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAddCategory = async () => {
    const newCategory = prompt("Enter new category name:");
    if (newCategory) {
      await fetch('/api/save-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory }),
      });
      setCategories([...categories, newCategory]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemName || !quantity || !location || !category) {
      alert("Please fill in all fields.");
      return;
    }
    const newItem: Item = { itemName, quantity: Number(quantity), location, category };
    const response = await fetch('/api/save-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      setItemName("");
      setQuantity("");
      setLocation("");
      setCategory("");
      setLoading(true);
      const updatedItems = await fetch('/api/get-items');
      const updatedItemsData = await updatedItems.json();
      setItems(updatedItemsData.items);
      setFilteredItems(updatedItemsData.items);
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (items) {
      const filtered = items.filter(item => item.category === category);
      setFilteredItems(filtered);
    }
  };

  const handleDeleteItem = async (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    setFilteredItems(updatedItems);
    await fetch('/api/save-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: updatedItems }),
    });
  };

  const handleIncreaseQuantity = async (index: number) => {
    const updatedItems = items.map((item, i) => i === index ? { ...item, quantity: item.quantity + 1 } : item);
    setItems(updatedItems);
    setFilteredItems(updatedItems);
    await fetch('/api/save-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: updatedItems }),
    });
  };

  const handleDecreaseQuantity = async (index: number) => {
    const updatedItems = items.map((item, i) => i === index && item.quantity > 0 ? { ...item, quantity: item.quantity - 1 } : item);
    setItems(updatedItems);
    setFilteredItems(updatedItems);
    await fetch('/api/save-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: updatedItems }),
    });
  };

  const handleExportToExcel = () => {
    const data = filteredItems.map(item => ({
      "Demirbaş Adı": item.itemName,
      "Adet Sayısı": item.quantity,
      "Konumu/Durumu": item.location,
      "Kategori": item.category,
    }));
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Items");
    writeFile(workbook, "Demirbaş Sayım Listesi.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Demirbaş Sayım Formu</h1>
            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-all duration-200"
            >
              <span>excell e export et</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Stats Overview */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
              <p className="text-slate-400 text-sm">Demirbaş</p>
              <p className="text-3xl font-bold mt-2">{items.length}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
              <p className="text-slate-400 text-sm">Kategoriler</p>
              <p className="text-3xl font-bold mt-2">{categories.length}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
              <p className="text-slate-400 text-sm">Toplam Ürün</p>
              <p className="text-3xl font-bold mt-2">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
          </div>

          {/* Add Item Form */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-semibold mb-6">Yeni Ürün Ekle</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Demirbaş Adı"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500"
                />
                <input
                  type="number"
                  placeholder="Adet Sayısı"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500"
                />
                <input
                  type="text"
                  placeholder="Konumu/Durumu"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Kategori Seç</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Ürünü Ekle
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Yeni Kategori Ekle
                  </button>
                </div>
              </form>
            </div>

            {/* Category List */}
            <div className="mt-6 bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
              <div className="space-y-2">
                {categories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(cat)}
                    className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-700/50 text-slate-300 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-semibold mb-6">Demirbaş Listesi</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item, index) => (
                    <div
                      key={index}
                      className="group bg-slate-900/50 rounded-lg p-4 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-lg">{item.itemName}</h3>
                          <div className="flex gap-3 mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm bg-emerald-500/10 text-emerald-400">
                              Adet: {item.quantity}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm bg-blue-500/10 text-blue-400">
                              Konum/Durum:  {item.location}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm bg-purple-500/10 text-purple-400">
                              Kategori:  {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleIncreaseQuantity(index)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDecreaseQuantity(index)}
                            className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-9a1 1 0 10-2 0v3a1 1 0 102 0V9zm-4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}