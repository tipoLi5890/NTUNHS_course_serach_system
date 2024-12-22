import React, { useEffect, useState } from "react";
import "./admin.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CourseCard from "../../components/Course-Card";

// Service API
import {
  getAllCourses,
  uploadSingleCourse,
  uploadBatchCourses,
  updateCourse,
  deleteCourse
} from "../../services/admin_api";

const Admin = () => {
  // 1. 狀態管理
  const [showSingleUpload, setShowSingleUpload] = useState(true);

  // CSV 上傳 (支援多檔案)
  const [csvFiles, setCsvFiles] = useState([]);
  const handleCsvFileChange = (e) => {
    setCsvFiles(e.target.files); 
    // e.target.files 是 FileList，可含多個檔案
  };

  // 單一課程 PDF 檔案選擇處理
  const [singleFile, setSingleFile] = useState(null);
  const handleSingleFileChange = (e) => {
    setSingleFile(e.target.files[0]);
  };

  // 管理「新增單筆課程」輸入欄位
  const [courseData, setCourseData] = useState({
    課程編號: "",
    學期: "",
    主開課教師姓名: "",
    科目代碼_新碼: "",
    系所代碼: "",
    核心四碼: "",
    科目組別: "",
    年級: "",
    上課班組: "",
    科目中文名稱: "",
    科目英文名稱: "",
    授課教師姓名: "",
    上課人數: "",
    學分數: "",
    上課週次: "",
    上課時數_週: "",
    課別代碼: "",
    課別名稱: "",
    上課地點: "",
    上課星期: "",
    上課節次: "",
    課表備註: "",
    課程中文摘要: "",
    課程英文摘要: ""
  });

  // 所有課程列表
  const [allCourses, setAllCourses] = useState([]);

  // 顯示 / 隱藏「修改課程」的彈出式視窗
  const [showEditModal, setShowEditModal] = useState(false);

  // 選中的要修改的課程(原本資料)
  const [editCourseData, setEditCourseData] = useState(null);

  // 2. useEffect：進入頁面時先查詢所有課程
  useEffect(() => {
    fetchCourses(); 
  }, []);

  const fetchCourses = async () => {
    try {
      const result = await getAllCourses();
      if (result.success) {
        setAllCourses(result.courses);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 3. 新增單筆課程
  const handleSingleSubmit = async () => {
    // 簡單檢查 required
    for (let key in courseData) {
      if (!courseData[key]) {
        alert(`【${key}】欄位必填`);
        return;
      }
    }

    try {
      const response = await uploadSingleCourse(courseData, singleFile);
      if (response.success) {
        alert(response.message || '單筆課程上傳成功');
        // 清空表單
        setCourseData({
          課程編號: "",
          學期: "",
          主開課教師姓名: "",
          科目代碼_新碼: "",
          系所代碼: "",
          核心四碼: "",
          科目組別: "",
          年級: "",
          上課班組: "",
          科目中文名稱: "",
          科目英文名稱: "",
          授課教師姓名: "",
          上課人數: "",
          學分數: "",
          上課週次: "",
          上課時數_週: "",
          課別代碼: "",
          課別名稱: "",
          上課地點: "",
          上課星期: "",
          上課節次: "",
          課表備註: "",
          課程中文摘要: "",
          課程英文摘要: ""
        });
        setSingleFile(null);

        // 重新抓取課程列表
        fetchCourses();
      } else {
        alert(response.message || '單筆課程上傳失敗');
      }
    } catch (error) {
      console.error(error);
      alert('單筆課程上傳失敗');
    }
  };

  // 4. 上傳 CSV (支援多檔案)
  const handleCsvUpload = async () => {
    if (!csvFiles || csvFiles.length === 0) {
      alert('請至少選擇一個 CSV 檔案');
      return;
    }
    try {
      const results = await uploadBatchCourses(csvFiles);
      console.log(results); // 可查看多檔上傳的結果
      // 顯示成功或失敗訊息
      alert('CSV 批次上傳完成');
      // 重新抓取課程列表
      fetchCourses();
    } catch (error) {
      console.error(error);
      alert('CSV 批次上傳失敗');
    }
  };

  // 5. 刪除單一課程
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('確定要刪除這筆課程嗎？')) return;
    try {
      const response = await deleteCourse(id);
      if (response.success) {
        alert(response.message || '刪除成功');
        fetchCourses(); // 刷新列表
      } else {
        alert(response.message || '刪除失敗');
      }
    } catch (error) {
      console.error(error);
      alert('刪除課程失敗');
    }
  };

  // 6. 顯示「修改課程」表單
  const handleEditCourse = (course) => {
    setEditCourseData({ ...course }); 
    // 複製一份資料供編輯
    setShowEditModal(true);
  };

  // 7. 修改課程
  const handleUpdateCourse = async () => {
    if (!editCourseData) return;
    try {
      const response = await updateCourse(editCourseData);
      if (response.success) {
        alert(response.message || '修改成功');
        setShowEditModal(false);
        setEditCourseData(null);
        fetchCourses();
      } else {
        alert(response.message || '修改失敗');
      }
    } catch (error) {
      console.error(error);
      alert('修改課程失敗');
    }
  };

  // 8. 處理修改課程輸入
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCourseData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 9. 處理「新增單筆課程」輸入
  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value
    }));
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
              <input
                type="text"
                name="課程編號"
                placeholder="課程編號"
                value={courseData.課程編號}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="學期"
                placeholder="學期"
                value={courseData.學期}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="主開課教師姓名"
                placeholder="主辦課教師姓名"
                value={courseData.主開課教師姓名}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="科目代碼_新碼"
                placeholder="科目代碼(新碼全碼)"
                value={courseData.科目代碼_新碼}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="系所代碼"
                placeholder="系所代碼"
                value={courseData.系所代碼}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="核心四碼"
                placeholder="核心四碼"
                value={courseData.核心四碼}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="科目組別"
                placeholder="科目組別"
                value={courseData.科目組別}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="年級"
                placeholder="年級"
                value={courseData.年級}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="上課班組"
                placeholder="上課班組"
                value={courseData.上課班組}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="科目中文名稱"
                placeholder="科目中文名稱"
                value={courseData.科目中文名稱}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="科目英文名稱"
                placeholder="科目英文名稱"
                value={courseData.科目英文名稱}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="授課教師姓名"
                placeholder="授課教師姓名"
                value={courseData.授課教師姓名}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="number"
                name="上課人數"
                placeholder="上課人數"
                value={courseData.上課人數}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="number"
                name="學分數"
                placeholder="學分數"
                value={courseData.學分數}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="number"
                name="上課週次"
                placeholder="上課週次"
                value={courseData.上課週次}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="上課時數_週"
                placeholder="上課時數/週"
                value={courseData.上課時數_週}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="課別代碼"
                placeholder="課別代碼"
                value={courseData.課別代碼}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="課別名稱"
                placeholder="課別名稱"
                value={courseData.課別名稱}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="上課地點"
                placeholder="上課地點"
                value={courseData.上課地點}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="上課星期"
                placeholder="上課星期"
                value={courseData.上課星期}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="上課節次"
                placeholder="上課節次"
                value={courseData.上課節次}
                onChange={handleCourseInputChange}
                required
              />
              <input
                type="text"
                name="課表備註"
                placeholder="課表備註"
                value={courseData.課表備註}
                onChange={handleCourseInputChange}
                required
              />
              <textarea
                name="課程中文摘要"
                placeholder="課程中文摘要"
                value={courseData.課程中文摘要}
                onChange={handleCourseInputChange}
                required
              />
              <textarea
                name="課程英文摘要"
                placeholder="課程英文摘要"
                value={courseData.課程英文摘要}
                onChange={handleCourseInputChange}
                required
              />
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
              <label>選擇課程CSV (可多檔)</label>
              <input
                type="file"
                accept=".csv"
                multiple
                onChange={handleCsvFileChange}
              />
              <button className="upload-btn" onClick={handleCsvUpload}>
                送出CSV
              </button>
            </div>
          </section>
        )}

        {/* 顯示所有課程 (table) */}
        <section className="course-list">
          <h3 className="a_h3">所有課程列表</h3>
          <table border="1" cellPadding="8" cellSpacing="0">
            <thead>
              <tr>
                <th>課程</th>
                <th>修改</th>
                <th>刪除</th>
              </tr>
            </thead>
            <tbody>
              {allCourses.map((course) => (
                <tr key={course['編號']}>
                  <td>
                    {/* 課程欄位：使用 CourseCard */}
                    <CourseCard course={course} />
                  </td>
                  <td>
                    <button onClick={() => handleEditCourse(course)}>
                      修改
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteCourse(course['編號'])}>
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 修改課程的彈出表單 (Modal) */}
        {showEditModal && editCourseData && (
          <div className="modal">
            <div className="modal-content">
              <h3>修改課程</h3>
              {/* 示例：只放幾個欄位，你可酌情全部放 */}
              <label>課程編號</label>
              <input
                type="text"
                name="課程編號"
                value={editCourseData.課程編號}
                onChange={handleEditInputChange}
              />
              <label>學期</label>
              <input
                type="text"
                name="學期"
                value={editCourseData.學期}
                onChange={handleEditInputChange}
              />
              <label>科目中文名稱</label>
              <input
                type="text"
                name="科目中文名稱"
                value={editCourseData.科目中文名稱}
                onChange={handleEditInputChange}
              />
              {/* ... 其他欄位照樣繼續 ... */}

              <button onClick={handleUpdateCourse}>送出修改</button>
              <button onClick={() => setShowEditModal(false)}>取消</button>
            </div>
          </div>
        )}
      </div>

      {/* 頁尾 */}
      <Footer />
    </div>
  );
};

export default Admin;
