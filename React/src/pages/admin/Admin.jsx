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
  deleteCourse
} from "../../services/admin_api";

const Admin = () => {
  // 狀態管理：單筆課程、批量上傳、問題學生處理
  const [selectedTab, setSelectedTab] = useState("singleUpload"); 

  const [csvFiles, setCsvFiles] = useState([]); // CSV 上傳 (支援多檔案)
  const handleCsvFileChange = (e) => {
    setCsvFiles(e.target.files);
    // e.target.files 是 FileList，可含多個檔案
  };

  const [singleFile, setSingleFile] = useState(null); // 單一課程 PDF 檔案選擇處理
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

  const [allCourses, setAllCourses] = useState([]); // 所有課程列表
  const [isEditing, setIsEditing] = useState(false); // 顯示 / 隱藏「修改課程」的彈出式視窗

  // 1. 載入頁面時取得所有課程 OK
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

  // 處理「新增/修改單筆課程」輸入變更 
  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 清空新增列表 (取消新增/修改)
  const resetCourseData = () => {
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
    setIsEditing(false);
  };

  // 2. 新增單筆課程 OK
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
        alert("新增成功");
        resetCourseData(); // 清空表單
        fetchCourses(); // 重新抓取課程列表
      } else {
        alert(response.message || '單筆課程上傳失敗');
      }
    } catch (error) {
      console.error(error);
      alert('單筆課程上傳失敗');
    }
  };

  // 3. 上傳 CSV (支援多檔案) OK
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

  // 4. 刪除單一課程 OK
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

  // 點擊"修改"按鈕
  const handleEditCourse = (course) => {
    setCourseData(course);
    setIsEditing(true);
  };

  // 5. 修改課程
  const handleUpdateCourse = async () => {
    try {
      const response = await uploadSingleCourse(courseData, singleFile);
      if (response.success) {
        alert(response.message || '課程更新成功');
        resetCourseData(); // 重置表單
        fetchCourses(); // 重新載入課程列表
      } else {
        alert(response.message || '課程更新失敗');
      }
    } catch (error) {
      console.error(error);
      alert('更新內容上傳失敗');
    }
  };

  // State 管理搜尋文字和過濾後的課程
  const [searchText, setSearchText] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(allCourses);

  // 搜尋功能邏輯
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // 防止頁面刷新
    const filtered = allCourses.filter((course) =>
      course.名稱.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  //學生帳號處理
  const [students, setStudents] = useState([]); // 存放學生資料
  const [newStudent, setNewStudent] = useState({ account: "", password: "", name: "" }); // 新增學生資料

  // 處理新增學生帳號
  const handleAddStudent = () => {
    if (!newStudent.account || !newStudent.password || !newStudent.name) {
      alert("請完整填寫所有欄位！");
      return;
    }
    setStudents((prev) => [...prev, newStudent]);
    setNewStudent({ account: "", password: "", name: "" }); // 清空表單
  };

  // 處理刪除學生帳號
  const handleDeleteStudent = (account) => {
    setStudents((prev) => prev.filter((student) => student.account !== account));
  };

  return (
    <div className="returnPlace">
      {/* 頁首 */}
      <Header />

      <div className="main">
        <h2 className="a_h2">系統管理者</h2>

        {/* 顯示控制按鈕 */}
        {/* 選擇功能區塊按鈕 */}
        <div className="tab-buttons">
          <button  className="tab-button" onClick={() => setSelectedTab("singleUpload")}>單筆課程操作</button>
          <button className="tab-button" onClick={() => setSelectedTab("batchUpload")}>CSV批量上傳</button>
          <button className="tab-button" onClick={() => setSelectedTab("studentManagement")}>問題學生處理</button>
        </div>

        {/* 新增課程區塊 (含 PDF) */}
        {selectedTab === "singleUpload" && (
          <section className="add-course">
            <h3 className="a_h3">{isEditing ? "修改課程" : "新增單一課程"}</h3>
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

              <button className="submit-btn" onClick={isEditing ? handleUpdateCourse : handleSingleSubmit}>
                {isEditing ? "確定修改" : "新增課程"}
              </button>
              <button className="submit-btn" onClick={resetCourseData}>取消</button>
            </div>
            {/* 顯示所有課程 (table) */}
            <div className="course-list">
              <h3 className="a_h3">從既有課程操作</h3>

              {/* 搜尋框 */}
              <form className="search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="搜尋課程名稱..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">搜尋</button>
              </form>

              {/* 表格 */}
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
                    <tr key={course.編號}>
                      <td>
                        {/* 課程欄位：使用 CourseCard */}
                        <CourseCard
                          key={course.編號}
                          course={course}
                        />
                      </td>
                      <td>
                        <button className="oneCourse-set" onClick={() => handleEditCourse(course)}>
                          修改
                        </button>
                      </td>
                      <td>
                        <button className="oneCourse-delete" onClick={() => handleDeleteCourse(course.編號)}>
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 批次上傳區塊 */}
        {selectedTab === "batchUpload" && (
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

        {/* 問題學生處理區塊 */}
        {selectedTab === "studentManagement" && (
          <section className="student-management">
            <h3 className="a_h3">問題學生處理</h3>

            {/* 新增學生帳號 */}
            <div className="add-student">
              <h4>新增學生帳號</h4>
              <input
                type="text"
                placeholder="帳號"
                value={newStudent.account}
                onChange={(e) => setNewStudent({ ...newStudent, account: e.target.value })}
              />
              <input
                type="text"
                placeholder="密碼"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
              />
              <input
                type="text"
                placeholder="姓名"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
              <br/>
              <button onClick={handleAddStudent}>新增學生</button>
            </div>

            {/* 更動學生帳號 */}
            <div className="update-student">
              <h4>學生帳號管理</h4>
              <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                  <tr>
                    <th>帳號</th>
                    <th>密碼</th>
                    <th>姓名</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.account}>
                      <td>{student.account}</td>
                      <td>{student.password}</td>
                      <td>{student.name}</td>
                      <td>
                        <button onClick={() => handleDeleteStudent(student.account)}>刪除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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