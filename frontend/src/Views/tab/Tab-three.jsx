import { useState, useEffect } from "react";
import React from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex w-full h-full">
      <div className="w-full">
        <div className="navbar text-primary-content text-black gap-4 border-b border-gray-500">
          <button className="btn btn-outline bg-warning text-black hover:bg-orange-500">ทั้งหมด</button>
          <button className="btn btn-outline bg-warning text-black hover:bg-orange-500">รอการจัดซื้อ</button>
          <button className="btn btn-outline bg-warning text-black hover:bg-orange-500">ระหว่างจัดซื้อ</button>
          <button className="btn btn-outline bg-warning text-black hover:bg-orange-500">เข้าสินค้าบางส่วน</button>
          <button className="btn btn-outline bg-warning text-black hover:bg-orange-500">การจัดซื้อสำเร็จ</button>
          <button className="btn btn-outline bg-warning text-black hover:bg-orange-500">การจัดซื้อสินค้าเป็นโมฆะ</button>
        </div>

        <div className="w-full border-b border-gray-500 p-2">
          <label className="input w-72 h-16 text-black bg-white border-b border-gray-500 flex items-center gap-2 px-4">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              className="grow"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-xs text-black w-full">
            <thead>
              <tr className="text-black">
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr key={product.id}>
                  <th>{index + 1}</th>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-black">
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
