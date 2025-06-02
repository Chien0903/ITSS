import React, { useState, useEffect, useCallback } from "react";
import { Plus, Save, Pencil, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const mealTimes = ["Sáng", "Trưa", "Tối"];

const Plans = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const navigate = useNavigate();

  // Lấy thông tin group từ localStorage
  const getGroupId = () => {
    try {
      const groupId = localStorage.getItem("selectedGroup") || "1";
      return parseInt(groupId);
    } catch (error) {
      console.error("Error getting group ID:", error);
      return 1;
    }
  };

  const groupId = getGroupId();

  // Tổ chức meal plans theo tuần
  const organizeMealPlansByWeek = (mealPlans, startDate, endDate) => {
    const meals_by_day = {};

    console.log("=== ORGANIZING MEAL PLANS ===");
    console.log(
      "Week range:",
      startDate.toISOString().split("T")[0],
      "to",
      endDate.toISOString().split("T")[0]
    );
    console.log("Total meal plans:", mealPlans.length);

    mealPlans.forEach((plan) => {
      // Chuyển đổi start_date thành Date object và reset thời gian về 00:00:00
      const planDate = new Date(plan.start_date);
      planDate.setHours(0, 0, 0, 0);

      // Reset thời gian của startDate và endDate về 00:00:00 để so sánh chính xác
      const compareStartDate = new Date(startDate);
      compareStartDate.setHours(0, 0, 0, 0);

      const compareEndDate = new Date(endDate);
      compareEndDate.setHours(23, 59, 59, 999);

      // Kiểm tra xem meal plan có trong tuần hiện tại không
      if (planDate >= compareStartDate && planDate <= compareEndDate) {
        // Tính toán dayIndex từ ngày thực tế trong tuần
        const daysDiff = Math.floor(
          (planDate - compareStartDate) / (24 * 60 * 60 * 1000)
        );
        const dayKey = `day_${daysDiff}`;

        if (!meals_by_day[dayKey]) {
          meals_by_day[dayKey] = {};
        }

        console.log("  - Adding meal:", plan.mealType, "to", dayKey);

        meals_by_day[dayKey][plan.mealType] = {
          planID: plan.planID,
          plan_name: plan.plan_name,
          custom_name: plan.plan_name,
          description: plan.description,
          recipes: [], // Có thể fetch sau nếu cần
        };
      } else {
        console.log("  ❌ Plan outside week range");
        console.log(
          "    planDate >= compareStartDate:",
          planDate >= compareStartDate
        );
        console.log(
          "    planDate <= compareEndDate:",
          planDate <= compareEndDate
        );
      }
    });

    return {
      start_date: startDate,
      end_date: endDate,
      meals_by_day,
      ingredients_summary: {
        vegetables: [],
        meat_seafood: [],
        others: [],
      },
    };
  };

  const fetchWeeklyMealPlan = useCallback(async () => {
    console.log("=== FETCH WEEKLY MEAL PLAN ===");
    console.log("currentDate:", currentDate);
    console.log("currentDate string:", currentDate.toISOString().split("T")[0]);
    console.log("currentDate getDay():", currentDate.getDay());

    setLoading(true);
    try {
      const startDate = getWeekStartDate(currentDate);
      const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

      const response = await api.get("/api/meal-plans/", {
        params: {
          group_id: groupId,
        },
      });
      console.log("response:", response.data);
      if (response.data.success && response.data.data.length > 0) {
        const organizedData = organizeMealPlansByWeek(
          response.data.data,
          startDate,
          endDate
        );
        setWeeklyMealPlan(organizedData);
      } else {
        console.log("No meal plan data or unsuccessful response");
        setWeeklyMealPlan(null);
      }
    } catch (error) {
      console.error("Error fetching weekly meal plan:", error);
      setWeeklyMealPlan(null);
    } finally {
      setLoading(false);
    }
  }, [currentDate, groupId]);

  const getWeekStartDate = (date) => {
    console.log("=== GETWEEKSTARTDATE DEBUG ===");
    console.log("Input date:", date);

    // Sử dụng Day.js để tính toán ngày đầu tuần (Thứ 2)
    const inputDate = dayjs(date);
    console.log(
      "Day.js input date:",
      inputDate.format("YYYY-MM-DD"),
      "day of week:",
      inputDate.day()
    );

    // Trong Day.js: 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
    // Tính ngày Thứ 2 đầu tuần
    const mondayOfWeek =
      inputDate.day() === 0
        ? inputDate.subtract(6, "day") // Nếu là CN thì lùi 6 ngày
        : inputDate.subtract(inputDate.day() - 1, "day"); // Nếu khác thì lùi (day - 1) ngày

    console.log(
      "Monday (week start):",
      mondayOfWeek.format("YYYY-MM-DD"),
      "day of week:",
      mondayOfWeek.day()
    );

    return mondayOfWeek.toDate();
  };

  const getWeekDates = () => {
    const startDate = getWeekStartDate(currentDate);
    const dates = [];
    const fullDates = [];

    console.log("=== GET WEEK DATES DEBUG ===");
    const mondayDayjs = dayjs(startDate);
    console.log(
      "startDate (Monday):",
      mondayDayjs.format("YYYY-MM-DD"),
      "day:",
      mondayDayjs.day()
    );

    for (let i = 0; i < 7; i++) {
      const date = mondayDayjs.add(i, "day");
      console.log(
        `Day ${i}:`,
        date.format("YYYY-MM-DD"),
        "day of week:",
        date.day(),
        "date:",
        date.date()
      );
      dates.push(date.date());
      fullDates.push(date.toDate());
    }
    return { dates, fullDates };
  };

  // Hàm để hiển thị tháng/năm trong header
  const getWeekDisplayText = () => {
    const { fullDates } = getWeekDates();
    const startDate = fullDates[0];
    const endDate = fullDates[6];

    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      // Cùng tháng và năm
      return startDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      });
    } else if (startDate.getFullYear() === endDate.getFullYear()) {
      // Cùng năm, khác tháng
      return `${startDate.toLocaleDateString("vi-VN", {
        month: "long",
      })} - ${endDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      })}`;
    } else {
      // Khác năm
      return `${startDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      })} - ${endDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      })}`;
    }
  };

  const getMealForDayAndTime = (dayIndex, mealTime) => {
    if (!weeklyMealPlan || !weeklyMealPlan.meals_by_day) return null;

    const dayKey = `day_${dayIndex}`;
    const dayMeals = weeklyMealPlan.meals_by_day[dayKey];

    if (!dayMeals) return null;

    const mealTypeMap = {
      Sáng: "breakfast",
      Trưa: "lunch",
      Tối: "dinner",
    };

    const mealType = mealTypeMap[mealTime];
    return dayMeals[mealType] || null;
  };

  const handleMealClick = (dayIndex, mealTime) => {
    const meal = getMealForDayAndTime(dayIndex, mealTime);

    console.log("=== HANDLE MEAL CLICK DEBUG ===");
    console.log("dayIndex received:", dayIndex);
    console.log("mealTime:", mealTime);

    if (meal) {
      // Nếu có món ăn, hiển thị chi tiết
      showMealDetails(meal, dayIndex, mealTime);
    } else {
      // Nếu chưa có món ăn, chuyển đến trang tạo kế hoạch với thông tin được điền sẵn

      // Chuyển đổi mealTime sang mealType
      const mealTypeMap = {
        Sáng: "breakfast",
        Trưa: "lunch",
        Tối: "dinner",
      };
      const mealType = mealTypeMap[mealTime] || "breakfast";

      // Sử dụng Day.js để tính toán ngày chính xác
      const weekStart = dayjs(getWeekStartDate(currentDate));
      console.log("weekStart (Day.js):", weekStart.format("YYYY-MM-DD"));
      console.log("weekStart day of week:", weekStart.day()); // Should be 1 (Monday)

      // Tính ngày đích bằng Day.js
      const targetDate = weekStart.add(dayIndex, "day");
      const formattedDate = targetDate.format("YYYY-MM-DD");

      console.log("targetDate calculation (Day.js method):");
      console.log("  weekStart:", weekStart.format("YYYY-MM-DD"));
      console.log("  + dayIndex:", dayIndex, "days");
      console.log("  = targetDate:", formattedDate);
      console.log("  targetDate day of week:", targetDate.day());

      // Lấy tên ngày
      const dayNames = [
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
        "Chủ nhật",
      ];
      const dayName = dayNames[dayIndex];
      console.log("dayName from array:", dayName);

      // Verify: kiểm tra ngày thực tế của targetDate
      console.log(
        "targetDate day of week:",
        targetDate.day(),
        "(should match dayIndex + 1 or 0 for Sunday)"
      );

      // Navigate với query params (thêm dayName để debug)
      navigate(
        `/add-new-planning?date=${formattedDate}&mealType=${mealType}&day=${dayIndex}&dayName=${encodeURIComponent(
          dayName
        )}`
      );
    }
  };

  const showMealDetails = (meal, dayIndex, mealTime) => {
    // Tạo thông tin chi tiết về món ăn
    const dayNames = [
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
      "Chủ nhật",
    ];
    const dayName = dayNames[dayIndex];
    const { fullDates } = getWeekDates();
    const fullDate = fullDates[dayIndex];

    const mealInfo = {
      ...meal,
      dayName,
      date: fullDate.getDate(),
      fullDate: fullDate.toLocaleDateString("vi-VN"),
      mealTime,
      dayIndex,
    };

    setSelectedMeal(mealInfo);
    setShowMealModal(true);
  };

  useEffect(() => {
    fetchWeeklyMealPlan();
  }, [fetchWeeklyMealPlan]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">Lập kế hoạch bữa ăn</h1>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm"
            onClick={() => navigate("/add-new-planning")}
          >
            <CalendarPlus size={16} /> Lập kế hoạch mới
          </button>
          <button
            className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-100"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil size={16} /> Chỉnh sửa
          </button>
          <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-100">
            <Save size={16} /> Lưu
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          className="border px-3 py-1 rounded hover:bg-gray-100"
          onClick={() =>
            setCurrentDate(dayjs(currentDate).subtract(7, "day").toDate())
          }
        >
          ←
        </button>
        <span className="font-medium">{getWeekDisplayText()}</span>
        <button
          className="border px-3 py-1 rounded hover:bg-gray-100"
          onClick={() =>
            setCurrentDate(dayjs(currentDate).add(7, "day").toDate())
          }
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-6">
        {getWeekDates().fullDates.map((fullDate, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-gray-500">
              {fullDate.getDate()}
              {index === 0 || fullDate.getDate() === 1 ? (
                <span className="text-xs block">
                  {fullDate.toLocaleDateString("vi-VN", { month: "short" })}
                </span>
              ) : null}
            </div>
            <div className="text-sm font-medium">{days[index]}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4 mb-8">
        {days.map((dayName, dayIndex) => {
          return (
            <div key={dayIndex} className="space-y-2">
              {mealTimes.map((mealTime, mealIndex) => {
                const meal = getMealForDayAndTime(dayIndex, mealTime);
                return (
                  <div
                    key={`${dayIndex}-${mealIndex}`}
                    className={`h-16 border rounded p-2 text-xs cursor-pointer transition-colors ${
                      meal
                        ? "bg-green-50 border-green-200 hover:bg-green-100"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => handleMealClick(dayIndex, mealTime)}
                  >
                    {meal ? (
                      <div>
                        <div className="font-medium text-green-700">
                          {mealTime}
                        </div>
                        <div className="text-gray-600 truncate">
                          {meal.recipe_name || meal.custom_name || "Món ăn"}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <Plus size={14} />
                        <span className="ml-1">{mealTime}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Tổng hợp kế hoạch tuần</h2>
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : weeklyMealPlan && weeklyMealPlan.ingredients_summary ? (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Rau củ quả</h3>
              <ul className="list-disc list-inside">
                {weeklyMealPlan.ingredients_summary.vegetables?.map(
                  (item, index) => <li key={index}>{item}</li>
                ) || <li>Chưa có dữ liệu</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Thịt/Cá/Hải sản</h3>
              <ul className="list-disc list-inside">
                {weeklyMealPlan.ingredients_summary.meat_seafood?.map(
                  (item, index) => <li key={index}>{item}</li>
                ) || <li>Chưa có dữ liệu</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Khác</h3>
              <ul className="list-disc list-inside">
                {weeklyMealPlan.ingredients_summary.others?.map(
                  (item, index) => <li key={index}>{item}</li>
                ) || <li>Chưa có dữ liệu</li>}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Chưa có kế hoạch bữa ăn nào cho tuần này
          </div>
        )}
      </div>

      {/* Modal hiển thị chi tiết món ăn */}
      {showMealModal && selectedMeal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi tiết món ăn</h3>
              <button
                onClick={() => setShowMealModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-medium">📅 Ngày:</span>{" "}
                {selectedMeal.dayName}, {selectedMeal.fullDate}
              </div>
              <div>
                <span className="font-medium">🍽️ Bữa:</span>{" "}
                {selectedMeal.mealTime}
              </div>
              <div>
                <span className="font-medium">🥘 Món ăn:</span>{" "}
                {selectedMeal.recipe_name ||
                  selectedMeal.custom_name ||
                  "Món ăn"}
              </div>
              {selectedMeal.description && (
                <div>
                  <span className="font-medium">📝 Mô tả:</span>{" "}
                  {selectedMeal.description}
                </div>
              )}
              {selectedMeal.ingredients &&
                selectedMeal.ingredients.length > 0 && (
                  <div>
                    <span className="font-medium">🛒 Nguyên liệu:</span>
                    <ul className="list-disc list-inside mt-1 ml-4">
                      {selectedMeal.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowMealModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowMealModal(false);

                  // Chuyển đổi mealTime sang mealType
                  const mealTypeMap = {
                    Sáng: "breakfast",
                    Trưa: "lunch",
                    Tối: "dinner",
                  };
                  const mealType =
                    mealTypeMap[selectedMeal.mealTime] || "breakfast";

                  console.log(
                    "Edit button - selectedMeal.mealTime:",
                    selectedMeal.mealTime,
                    "-> mealType:",
                    mealType
                  );

                  // Sử dụng Day.js để tính toán ngày thực tế
                  const weekStart = dayjs(getWeekStartDate(currentDate));
                  const targetDate = weekStart.add(
                    selectedMeal.dayIndex,
                    "day"
                  );
                  const formattedDate = targetDate.format("YYYY-MM-DD");

                  // Navigate với query params
                  navigate(
                    `/add-new-planning?date=${formattedDate}&mealType=${mealType}&day=${selectedMeal.dayIndex}&edit=true`
                  );
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
