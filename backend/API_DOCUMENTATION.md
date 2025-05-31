# API Documentation - Meal Plan

## Base URL

```
http://localhost:8000/api/meal-plans/
```

## Endpoints

### 1. Lấy danh sách kế hoạch bữa ăn

**GET** `/api/meal-plans/`

**Query Parameters:**

- `group_id` (optional): Lọc theo nhóm
- `user_id` (optional): Lọc theo người dùng

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "planID": 1,
      "plan_name": "Kế hoạch tuần này",
      "start_date": "2024-01-15",
      "description": "Kế hoạch ăn uống cho tuần",
      "mealType": "breakfast",
      "day_of_week": 0,
      "group": 1,
      "user": 1,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Tạo kế hoạch bữa ăn mới

**POST** `/api/meal-plans/`

**Request Body:**

```json
{
  "plan_name": "Kế hoạch tuần này",
  "start_date": "2024-01-15",
  "description": "Mô tả kế hoạch",
  "group": 1,
  "user": 1,
  "planned_meals": [
    {
      "day": "0",
      "meal": "breakfast"
    },
    {
      "day": "0",
      "meal": "lunch"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo kế hoạch bữa ăn thành công",
  "data": [...]
}
```

### 3. Lấy chi tiết kế hoạch bữa ăn

**GET** `/api/meal-plans/{id}/`

**Response:**

```json
{
  "success": true,
  "data": {
    "planID": 1,
    "plan_name": "Kế hoạch tuần này",
    "start_date": "2024-01-15",
    "description": "Kế hoạch ăn uống cho tuần",
    "mealType": "breakfast",
    "day_of_week": 0,
    "group": 1,
    "user": 1,
    "recipes": [
      {
        "recipeID": 1,
        "recipeName": "Phở bò",
        "description": "Phở bò truyền thống",
        "image": "http://example.com/pho.jpg"
      }
    ],
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### 4. Cập nhật kế hoạch bữa ăn

**PUT** `/api/meal-plans/{id}/`

**Request Body:**

```json
{
  "plan_name": "Kế hoạch mới",
  "description": "Mô tả mới"
}
```

### 5. Xóa kế hoạch bữa ăn

**DELETE** `/api/meal-plans/{id}/`

**Response:**

```json
{
  "success": true,
  "message": "Xóa kế hoạch thành công"
}
```

### 6. Lấy kế hoạch theo tuần

**GET** `/api/meal-plans/weekly/`

**Query Parameters:**

- `start_date` (required): Ngày bắt đầu tuần (YYYY-MM-DD)
- `group_id` (required): ID nhóm

**Response:**

```json
{
  "success": true,
  "data": {
    "start_date": "2024-01-15",
    "end_date": "2024-01-21",
    "meals_by_day": {
      "day_0": {
        "breakfast": [
          {
            "planID": 1,
            "plan_name": "Kế hoạch tuần này",
            "recipes": [...]
          }
        ],
        "lunch": [...],
        "dinner": [...]
      },
      "day_1": {...},
      ...
    },
    "ingredients_summary": {
      "vegetables": ["Cà chua (5 quả)", "Đậu bắp (200g)"],
      "meat_seafood": ["Cá lóc (1kg)", "Thịt ba chỉ (500g)"],
      "others": ["Trứng gà (10 quả)", "Nước dừa (500ml)"]
    }
  }
}
```

### 7. Thêm món ăn vào kế hoạch

**POST** `/api/meal-plans/{id}/recipes/`

**Request Body:**

```json
{
  "recipe_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đã thêm món ăn vào kế hoạch"
}
```

### 8. Xóa món ăn khỏi kế hoạch

**DELETE** `/api/meal-plans/{id}/recipes/`

**Request Body:**

```json
{
  "recipe_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đã xóa món ăn khỏi kế hoạch"
}
```

## Lỗi thường gặp

### 400 Bad Request

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": {...}
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Kế hoạch bữa ăn không tồn tại"
}
```

## Frontend Integration

### Ví dụ sử dụng trong React

```javascript
// Tạo kế hoạch mới
const createMealPlan = async (data) => {
  const response = await fetch("/api/meal-plans/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

// Lấy kế hoạch theo tuần
const getWeeklyPlan = async (startDate, groupId) => {
  const response = await fetch(
    `/api/meal-plans/weekly/?start_date=${startDate}&group_id=${groupId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};
```

## Day of Week Mapping

- 0: Thứ 2 (Monday)
- 1: Thứ 3 (Tuesday)
- 2: Thứ 4 (Wednesday)
- 3: Thứ 5 (Thursday)
- 4: Thứ 6 (Friday)
- 5: Thứ 7 (Saturday)
- 6: CN (Sunday)

## Meal Type Options

- `breakfast`: Bữa sáng
- `lunch`: Bữa trưa
- `dinner`: Bữa tối
