<?php
/**
 * utils.php
 * 
 * 包含處理學年度、學期及學生年級的工具函數。
 */

/**
 * 計算當前學年度與學期
 *
 * @return string 民國年份 + 學期數字，例如 '1131'
 */
function getAcademicYearAndSemester() {
    $gregorianYear = date('Y'); // 西元年，例如 2024
    $month = date('n');          // 月份，1-12

    // 轉換為民國年
    $minguoYear = $gregorianYear - 1911;

    // 判斷目前所在的學期
    if ($month >= 8) {
        // 如果現在是8月到12月，屬於當前年份的上學期
        $academicYear = $minguoYear;
        $semester = '1';
    } elseif ($month >= 2 && $month <= 7) {
        // 如果現在是2月到7月，屬於前一年的下學期
        $academicYear = $minguoYear - 1;
        $semester = '2';
    } else { // $month == 1
        // 如果現在是1月，屬於前一年的上學期
        $academicYear = $minguoYear - 1;
        $semester = '1';
    }

    return $academicYear . $semester;
}

/**
 * 計算學生年級
 *
 * @param string $studentNumber 學號
 * @param int|null $currentAcademicYear 當前學年度 (民國年)，預設為 null，會自動計算
 * @return int 學生年級
 */
function calculateGradeLevel($studentNumber, $currentAcademicYear = null) {
    if ($currentAcademicYear === null) {
        // 如果未提供當前學年度，則計算
        $currentAcademicYear = substr(getAcademicYearAndSemester(), 0, -1); // 例如 '1131' 取 '113'
    }
    // 假設學號的前兩位代表入學年份（民國）
    $enrollmentYear = '1'.(int)substr($studentNumber, 0, 2); // 前兩位為入學年份（民國）

    // 計算年級
    $gradeLevel = $currentAcademicYear - $enrollmentYear + 1;

    if ($gradeLevel <= 0) {
        $gradeLevel = 1; // 確保年級至少為 1
    }

    return $gradeLevel;
}
?>
