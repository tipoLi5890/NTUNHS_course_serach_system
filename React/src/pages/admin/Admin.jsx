import React, { useEffect, useState } from "react";
import "./admin.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Admin = () => {

  // 狀態控制顯示區塊
  const [showSingleUpload, setShowSingleUpload] = useState(true);

  // 單一課程 PDF 檔案選擇處理
  const [singleFile, setSingleFile] = useState(null);
  const handleSingleFileChange = (e) => {
    setSingleFile(e.target.files[0]);
  };

  // 多筆課程資料 CSV 檔案選擇處理
  const [csvFile, setCsvFile] = useState(null);
  const handleCsvFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  // 表單提交事件（含 PDF）
  const handleSingleSubmit = () => {
    const formData = new FormData();
    formData.append("teachingPlan", singleFile);
    console.log("單一課程資料 & PDF 上傳", singleFile);
  };

  // 批次 CSV 上傳
  const handleCsvUpload = () => {
    const formData = new FormData();
    formData.append("csvFile", csvFile);
    console.log("批次課程資料 CSV 上傳", csvFile);
  };

  return (
    <div className="returnPlace">
      {/* 頁首 */}
      <Header />

      <div className="main">
        <h2 className="a_h2">系統管理者</h2>

        {/* 顯示控制按鈕 */}
        <div className="a_button-container">
          <button
            className={`toggle-btn ${showSingleUpload ? "active" : ""}`}
            onClick={() => setShowSingleUpload(true)}
          >
            上傳單筆課程
          </button>
          <button
            className={`toggle-btn ${!showSingleUpload ? "active" : ""}`}
            onClick={() => setShowSingleUpload(false)}
          >
            CSV批量上傳
          </button>
        </div>

        {/* 新增課程區塊 (含 PDF) */}
        {showSingleUpload && (
          <section className="add-course">
            <h3 className="a_h3">新增單一課程</h3>
            <div className="form">
              <input type="text" placeholder="編號" />
              <input type="text" placeholder="學期" />
              <input type="text" placeholder="主辦課教師姓名" />
              <input type="text" placeholder="科目代碼(新碼全碼)" />
              <input type="text" placeholder="系所代碼" />
              <input type="text" placeholder="核心四碼" />
              <input type="text" placeholder="科目組別" />
              <input type="text" placeholder="年級" />
              <input type="text" placeholder="上課班組" />
              <input type="text" placeholder="科目中文名稱" />
              <input type="text" placeholder="科目英文名稱" />
              <input type="text" placeholder="授課教師姓名" />
              <input type="number" placeholder="上課人數" />
              <input type="number" placeholder="學分數" />
              <input type="number" placeholder="上課週次" />
              <input type="text" placeholder="上課時數/週" />
              <input type="text" placeholder="課別代碼" />
              <input type="text" placeholder="課別名稱" />
              <input type="text" placeholder="上課地點" />
              <input type="text" placeholder="上課星期" />
              <input type="text" placeholder="上課節次" />
              <input type="text" placeholder="課表備註" />
              <textarea placeholder="課程中文摘要"></textarea>
              <textarea placeholder="課程英文摘要"></textarea>
              <label>選擇教學計劃PDF</label>
              <input type="file" accept=".pdf" onChange={handleSingleFileChange} />
              <button className="submit-btn" onClick={handleSingleSubmit}>
                送出新增
              </button>
            </div>
          </section>
        )}

        {/* 批次上傳區塊 */}
        {!showSingleUpload && (
          <section className="batch-upload">
            <h3 className="a_h3">批次上傳課程資料</h3>
            <div className="form">
              <label>選擇課程CSV</label>
              <input type="file" accept=".csv" onChange={handleCsvFileChange} />
              <button className="upload-btn" onClick={handleCsvUpload}>
                送出新增
              </button>
            </div>
          </section>
        )}
      </div>

      {/* 頁尾 */}
      <Footer />
    </div>
  );
};

export default Admin;
