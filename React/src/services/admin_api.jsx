// src/services/admin_api.js
import axios from 'axios';

const API_BASE_URL = '/api/admin.php'; 

// 1. 查詢所有課程
export const getAllCourses = async () => {
  try {
    const response = await axios.post(
      API_BASE_URL,
      { action: 'getAll' },
      { withCredentials: true }
    );
    return response.data; // 會包含 message, success, courses 等
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw new Error('查詢所有課程失敗');
  }
};

// 2. 新增單筆課程 (含PDF)
export const uploadSingleCourse = async (courseData, pdfFile) => {
  try {
    const formData = new FormData();
    formData.append('action', 'uploadSingle'); // 後端根據此action做判斷

    // 將課程資訊放入 formData
    Object.entries(courseData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (pdfFile) {
      formData.append('teachingPlan', pdfFile);
    }

    const response = await axios.post(API_BASE_URL, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading single course:', error);
    throw new Error('單筆課程上傳失敗');
  }
};

// 3. 上傳課程 CSV (支援多檔案) 
//    ★ 重點：要依序上傳多個檔案
export const uploadBatchCourses = async (csvFiles) => {
  try {
    // csvFiles 是一個 FileList 或 array
    const results = [];

    // 逐檔上傳
    for (let i = 0; i < csvFiles.length; i++) {
      const file = csvFiles[i];

      const formData = new FormData();
      formData.append('action', 'uploadBatch');
      formData.append('csvFile', file);

      const response = await axios.post(API_BASE_URL, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      results.push(response.data);
    }

    return results;
  } catch (error) {
    console.error('Error uploading batch courses:', error);
    throw new Error('CSV 批次上傳失敗');
  }
};

// 4. 修改單一課程
export const updateCourse = async (updatedData) => {
  try {
    // updatedData 中應該包含 編號 (主鍵) 及所有欄位的值(修改後)
    // 改用 JSON 方式比較直觀
    const response = await axios.post(
      API_BASE_URL,
      {
        action: 'updateCourse',
        data: updatedData
      },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw new Error('修改課程失敗');
  }
};

// 5. 刪除單一課程
export const deleteCourse = async (id) => {
  // id 即為 "編號"
  try {
    const response = await axios.post(
      API_BASE_URL,
      {
        action: 'deleteCourse',
        id: id
      },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('刪除課程失敗');
  }
};
