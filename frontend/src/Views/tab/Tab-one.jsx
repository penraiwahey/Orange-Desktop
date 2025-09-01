// src/pages/ProductsPage.jsx
import { useState } from "react";
import React from "react";

export default function ProductsPage() {

  return (
    <div>
      <h1 className="text-2xl font-bold text-black p-4">นำเข้าสินค้า</h1>
      <div className="flex">
        {/* ฟอร์มกรอก */}
        <div className="p-4 min-w-80">
          <ul className="space-y-2">
            <li>
            <input type="text" placeholder="Warning" class="input input-warning" />
          </li>
          <li>
            <input type="text" placeholder="Warning" class="input input-warning" />
          </li>
          <li>
            <input type="text" placeholder="Warning" class="input input-warning" />
          </li>
                    <li>
            <button className="btn btn-warning">เพิ่มสินค้า</button>
          </li>
        </ul>
      </div>
      {/* ตาราง */}
      <div className="flex-1 p-4 text-black">
          <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table class="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Favorite Color</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>1</th>
                  <td>Cy Ganderton</td>
                  <td>Quality Control Specialist</td>
                  <td>Blue</td>
                </tr>
                <tr>
                  <th>2</th>
                  <td>Hart Hagerty</td>
                  <td>Desktop Support Technician</td>
                  <td>Purple</td>
                </tr>
                <tr>
                  <th>3</th>
                  <td>Brice Swyre</td>
                  <td>Tax Accountant</td>
                  <td>Red</td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    </div>
    </div>
  );
}
