import axios from 'axios';

const API_BASE_URL = '/api/admin.php';

/** 課程管理 **/
// 1. 取得所有課程 (ok)
export const getAllCourses = async () => {
  try {
    const response = await axios.post(
      API_BASE_URL,
      { action: 'getAll' },
      { withCredentials: true }
    );
    console.log(response.data);
    return response.data; // 會包含 message, success, courses 等
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw new Error('查詢所有課程失敗');
  }
};

// 2. 新增/修改單筆課程 (含PDF) (ok)
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
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading single course:', error);
    throw new Error('單筆課程上傳失敗');
  }
};

// 3. 上傳課程 CSV (支援多檔案) (★ 重點：要依序上傳多個檔案) (ok)
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
      console.log(response.data);
      results.push(response.data);
    }

    return results;
  } catch (error) {
    console.error('Error uploading batch courses:', error);
    throw new Error('CSV 批次上傳失敗');
  }
};


// 4. 刪除單一課程 (ok)
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
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('刪除課程失敗');
  }
};

//課程與學生關鍵字查詢功能使用Home_api中的內容 (ok)
 
/** 學生管理 **/
// 5. 取得所有學生 (ok)
export const GetAllStudents = async () => {
  try {
    const response = await axios.post(
      API_BASE_URL,
      { action: 'get-all-student' },
      { withCredentials: true }
    );
    console.log(response.data);
    return response.data; // 會包含 message, success, courses 等
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw new Error('查詢所有學生失敗');
  }
};

// 6. 新增/修改單筆學生資訊 (含PDF) (ok)
export const UpdateStudent = async (student) => {
  try {
    const formData = new FormData();
    formData.append('action', 'update-student'); // 後端根據此action做判斷

    // 將學生資訊放入 formData
    formData.append('姓名', student.name);
    formData.append('帳號', student.account);
    formData.append('密碼', student.password);

    const response = await axios.post(API_BASE_URL, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading single student:', error);
    throw new Error('單筆學生資訊上傳失敗');
  }
};

// 7. 刪除單一學生 (ok)
export const deleteStudent = async (userid) => {
  // id 即為 "編號"
  try {
    const response = await axios.post(
      API_BASE_URL,
      {
        action: 'delete-student',
        userid: userid
      },
      { withCredentials: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('刪除學生失敗');
  }
};

