import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Form,
  Typography,
  Row,
  Col,
  Divider,
  message,
} from "antd";
import {
  LeftOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

const { Title, Text } = Typography;

const MealPlanNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Lấy thông tin user và group từ localStorage
  const getUserInfo = () => {
    try {
      // Lấy user object từ localStorage
      const userStr = localStorage.getItem("user");
      let userId = 1; // Fallback default
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userId = userObj.id || 1;
        } catch (parseError) {
          console.error("Error parsing user JSON:", parseError);
        }
      }

      // Lấy group ID
      const groupId = localStorage.getItem("selectedGroup") || "1";

      return {
        userId: parseInt(userId),
        groupId: parseInt(groupId),
      };
    } catch (error) {
      console.error("Error getting user info from localStorage:", error);
      return { userId: 1, groupId: 1 }; // Fallback values
    }
  };

  const mealTypes = [
    { value: "breakfast", label: "Bữa sáng" },
    { value: "lunch", label: "Bữa trưa" },
    { value: "dinner", label: "Bữa tối" },
  ];

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  // Fetch danh sách recipes từ API
  const fetchRecipes = async () => {
    setLoadingRecipes(true);
    try {
      const response = await api.get("/api/recipes/");
      setRecipes(response.data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      message.error("Không thể tải danh sách món ăn");
    } finally {
      setLoadingRecipes(false);
    }
  };

  useEffect(() => {
    // Fetch recipes khi component mount
    fetchRecipes();
  }, []);

  // Đọc query params và tự động điền form
  useEffect(() => {
    const dateParam = searchParams.get("date");
    const mealTypeParam = searchParams.get("mealType");
    const dayParam = searchParams.get("day");
    const editParam = searchParams.get("edit");

    console.log("Query params:", {
      dateParam,
      mealTypeParam,
      dayParam,
      editParam,
    });

    if (dateParam) {
      setStartDate(dateParam);

      // Tự động tạo tên kế hoạch dựa trên ngày
      const date = new Date(dateParam);
      const dayNames = [
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
        "CN",
      ];
      const dayName = dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Chuyển đổi Sunday=0 thành CN=6
      const formattedDate = date.toLocaleDateString("vi-VN");

      if (mealTypeParam) {
        const mealTypeNames = {
          breakfast: "Bữa sáng",
          lunch: "Bữa trưa",
          dinner: "Bữa tối",
        };
        const mealTypeName = mealTypeNames[mealTypeParam] || mealTypeParam;

        if (editParam === "true") {
          setPlanName(
            `Chỉnh sửa ${mealTypeName} ${dayName} (${formattedDate})`
          );
        } else {
          setPlanName(`${mealTypeName} ${dayName} (${formattedDate})`);
        }
      } else {
        if (editParam === "true") {
          setPlanName(`Chỉnh sửa kế hoạch ${dayName} (${formattedDate})`);
        } else {
          setPlanName(`Kế hoạch ${dayName} (${formattedDate})`);
        }
      }
    }

    if (mealTypeParam) {
      setSelectedMealType(mealTypeParam);
    }

    // Nếu có thông tin ngày cụ thể, tự động thêm một planned meal
    if (dayParam !== null && mealTypeParam) {
      const dayIndex = parseInt(dayParam);
      if (!isNaN(dayIndex)) {
        setPlannedMeals([
          {
            day: dayIndex,
            recipeId: null,
          },
        ]);
      }
    }

    // Hiển thị thông báo hướng dẫn
    if (editParam === "true") {
      message.info(
        "Bạn đang chỉnh sửa kế hoạch bữa ăn. Thông tin đã được điền sẵn."
      );
    } else if (dateParam && mealTypeParam) {
      message.success("Thông tin ngày và bữa ăn đã được điền sẵn từ lịch.");
    }
  }, [searchParams]);

  const addPlannedMeal = () => {
    setPlannedMeals([
      ...plannedMeals,
      {
        day: 0,
        recipeId: null,
      },
    ]);
  };

  const updatePlannedMeal = (index, updates) => {
    const updated = [...plannedMeals];
    updated[index] = { ...updated[index], ...updates };
    setPlannedMeals(updated);
  };

  const removePlannedMeal = (index) => {
    const updated = plannedMeals.filter((_, i) => i !== index);
    setPlannedMeals(updated);
  };

  const handleSave = async () => {
    console.log("=== handleSave được gọi ===");
    console.log("planName:", planName);
    console.log("startDate:", startDate);
    console.log("selectedMealType:", selectedMealType);
    console.log("plannedMeals:", plannedMeals);
    console.log("plannedMeals.length:", plannedMeals.length);

    // Validation chi tiết hơn
    if (!planName.trim()) {
      console.log("Lỗi: Thiếu tên kế hoạch");
      message.error("Vui lòng nhập tên kế hoạch");
      return;
    }

    if (!startDate) {
      console.log("Lỗi: Thiếu ngày bắt đầu");
      message.error("Vui lòng chọn ngày bắt đầu");
      return;
    }

    if (!selectedMealType) {
      console.log("Lỗi: Thiếu bữa ăn");
      message.error("Vui lòng chọn bữa ăn");
      return;
    }

    // Kiểm tra ngày bắt đầu không được trong quá khứ
    const selectedDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      message.warning("Ngày bắt đầu nên từ hôm nay trở đi");
    }

    // Thông báo khi lưu kế hoạch trống
    if (plannedMeals.length === 0) {
      console.log("Info: Đang lưu kế hoạch trống (không có món ăn)");
      message.info("Bạn đang lưu kế hoạch trống. Bạn có thể thêm món ăn sau.");
    }

    console.log("Bước validation đã qua, tiếp tục xử lý...");

    // Kiểm tra xem có món ăn nào chưa chọn recipe
    const mealsWithoutRecipe = plannedMeals.filter((meal) => !meal.recipeId);
    if (mealsWithoutRecipe.length > 0) {
      console.log("Warning: Có món chưa chọn recipe");
      message.warning(
        `Có ${mealsWithoutRecipe.length} món chưa chọn công thức. Bạn có muốn tiếp tục?`
      );
    }

    console.log("Bắt đầu setLoading(true)");
    setLoading(true);

    try {
      // Lấy thông tin user mới nhất
      const currentUserInfo = getUserInfo();
      console.log("Current user info:", currentUserInfo);

      // Validation user info
      if (!currentUserInfo.userId || !currentUserInfo.groupId) {
        message.error(
          "Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại."
        );
        setLoading(false);
        return;
      }

      // Chuyển đổi format dữ liệu cho backend
      const formattedPlannedMeals = plannedMeals.map((meal) => ({
        meal: selectedMealType,
        day: meal.day.toString(), // Backend expects string
        recipeId: meal.recipeId || null, // Để null nếu không có recipe
      }));

      console.log("formattedPlannedMeals:", formattedPlannedMeals);

      const mealPlanData = {
        plan_name: planName.trim(),
        start_date: startDate,
        description: description ? description.trim() : "",
        planned_meals: formattedPlannedMeals,
        meal_type: selectedMealType,
        group: currentUserInfo.groupId,
        user: currentUserInfo.userId,
      };

      console.log("Sending data to backend:", mealPlanData);

      const response = await api.post("/api/meal-plans/", mealPlanData);

      console.log("Response từ backend:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.data.success) {
        console.log("Success: Lưu thành công!");
        if (plannedMeals.length === 0) {
          message.success(
            "Đã lưu kế hoạch trống thành công! Bạn có thể thêm món ăn sau."
          );
        } else {
          message.success(
            `Đã lưu kế hoạch thành công với ${plannedMeals.length} món ăn!`
          );
        }
        // Reset form
        setPlanName("");
        setStartDate("");
        setDescription("");
        setSelectedMealType("");
        setPlannedMeals([]);
        navigate("/meal-planning");
      } else {
        console.error("Backend response không success:", response.data);
        message.error(
          "Có lỗi xảy ra khi lưu kế hoạch: " +
            (response.data.message || "Lỗi không xác định")
        );
      }
    } catch (error) {
      console.error("=== CATCH ERROR ===");
      console.error("Error saving meal plan:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Hiển thị lỗi chi tiết hơn
      if (error.response?.status === 400) {
        if (error.response?.data?.errors) {
          const errorMsg = Object.entries(error.response.data.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          message.error("Lỗi validation: " + errorMsg);
        } else if (error.response?.data?.message) {
          message.error("Lỗi: " + error.response.data.message);
        } else {
          message.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại");
        }
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền thực hiện thao tác này");
      } else if (error.response?.status >= 500) {
        message.error("Lỗi server, vui lòng thử lại sau");
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        message.error(
          "Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng"
        );
      } else {
        message.error("Có lỗi xảy ra khi lưu kế hoạch");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/meal-planning");
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button
            icon={<LeftOutlined />}
            onClick={handleCancel}
            style={{ marginRight: 16 }}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ display: "inline-block", margin: 0 }}>
            Lập kế hoạch bữa ăn mới
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu kế hoạch"}
          </Button>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin kế hoạch" style={{ marginBottom: 24 }}>
            <Form layout="vertical">
              <Form.Item label="Tên kế hoạch">
                <Input
                  placeholder="Ví dụ: Kế hoạch tuần này"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Ngày bắt đầu">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Mô tả (tùy chọn)">
                <Input
                  placeholder="Mô tả về kế hoạch bữa ăn"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Bữa ăn">
                <Select
                  placeholder="Chọn loại bữa ăn cho kế hoạch này"
                  value={selectedMealType || undefined}
                  onChange={(value) => setSelectedMealType(value)}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {mealTypes.map((type) => (
                    <Select.Option key={type.value} value={type.value}>
                      {type.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title={
              <Row justify="space-between" align="middle">
                <Col>Danh sách món ăn theo ngày</Col>
                <Col>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={addPlannedMeal}
                    size="small"
                  >
                    Thêm món
                  </Button>
                </Col>
              </Row>
            }
            style={{ marginBottom: 24 }}
          >
            {plannedMeals.length === 0 ? (
              <div style={{ textAlign: "center", color: "#888", padding: 32 }}>
                <p>Chưa có món ăn nào được lập kế hoạch</p>
                <p style={{ fontSize: 13 }}>Nhấn "Thêm món" để bắt đầu</p>
              </div>
            ) : (
              plannedMeals.map((meal, index) => (
                <Row
                  key={index}
                  gutter={8}
                  align="middle"
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Col span={6}>
                    <div
                      style={{ marginBottom: 4, fontSize: 12, color: "#666" }}
                    >
                      Ngày
                    </div>
                    <Select
                      value={meal.day}
                      style={{ width: "100%" }}
                      onChange={(value) =>
                        updatePlannedMeal(index, { day: value })
                      }
                    >
                      {dayNames.map((day, dayIndex) => (
                        <Select.Option key={dayIndex} value={dayIndex}>
                          {day}
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={16}>
                    <div
                      style={{ marginBottom: 4, fontSize: 12, color: "#666" }}
                    >
                      Món ăn
                    </div>
                    <Select
                      value={meal.recipeId || undefined}
                      style={{ width: "100%" }}
                      loading={loadingRecipes}
                      placeholder={
                        loadingRecipes ? "Đang tải..." : "Chọn món ăn"
                      }
                      onChange={(value) =>
                        updatePlannedMeal(index, { recipeId: value })
                      }
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      allowClear
                    >
                      {recipes.map((recipe) => (
                        <Select.Option
                          key={recipe.recipeID}
                          value={recipe.recipeID}
                        >
                          {recipe.recipeName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={2}>
                    <div
                      style={{
                        marginBottom: 4,
                        fontSize: 12,
                        color: "transparent",
                      }}
                    >
                      Xóa
                    </div>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => removePlannedMeal(index)}
                      size="small"
                      danger
                      style={{ width: "100%" }}
                    />
                  </Col>
                </Row>
              ))
            )}
          </Card>

          <Card title="Tổng hợp nguyên liệu cần mua">
            <div style={{ textAlign: "center", color: "#888", padding: 32 }}>
              <p>Thêm món ăn vào kế hoạch để xem danh sách nguyên liệu</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Hướng dẫn">
            <div style={{ fontSize: 15 }}>
              <div style={{ marginBottom: 12 }}>
                <b>Bước 1</b>
                <div style={{ color: "#888" }}>
                  Nhập tên và ngày bắt đầu cho kế hoạch của bạn
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>Bước 2</b>
                <div style={{ color: "#888" }}>
                  Thêm món ăn cho từng ngày và bữa ăn
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>Bước 3</b>
                <div style={{ color: "#888" }}>
                  Hệ thống sẽ tự động tính toán nguyên liệu cần mua
                </div>
              </div>
              <div>
                <b>Bước 4</b>
                <div style={{ color: "#888" }}>
                  Lưu kế hoạch để sử dụng và tạo danh sách mua sắm
                </div>
              </div>
            </div>
          </Card>
          <Card title="Mẫu kế hoạch" style={{ marginTop: 24 }}>
            <Button
              block
              icon={<CalendarOutlined />}
              style={{ marginBottom: 8 }}
            >
              Kế hoạch cơ bản
            </Button>
            <Button
              block
              icon={<CalendarOutlined />}
              style={{ marginBottom: 8 }}
            >
              Kế hoạch gia đình
            </Button>
            <Button block icon={<CalendarOutlined />}>
              Kế hoạch ăn kiêng
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MealPlanNew;
