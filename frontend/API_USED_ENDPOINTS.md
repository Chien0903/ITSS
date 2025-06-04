# Tổng hợp các API được gọi trong frontend

| Phương thức | Endpoint                                         | File sử dụng                                                                                             |
| ----------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| GET         | /api/products/                                   | store.jsx, ShoppingListDetail.jsx, recipes.jsx, addShoppingList.jsx, EditProduct.jsx, AddNewPlanning.jsx |
| GET         | /api/products/{productId}/                       | store.jsx, recipes.jsx, EditProduct.jsx                                                                  |
| GET         | /api/products/search/                            | fridge.jsx                                                                                               |
| GET         | /api/categories/                                 | store.jsx, EditProduct.jsx, AddProduct.jsx, dataManagement.jsx                                           |
| GET         | /api/categories                                  | fridge.jsx                                                                                               |
| GET         | /api/shopping-lists/                             | store.jsx, shoppingList.jsx, dashboard.jsx                                                               |
| GET         | /api/shopping-lists/?group_id={groupId}          | shoppingList.jsx                                                                                         |
| GET         | /api/shopping-lists/{listId}/                    | shoppingList.jsx                                                                                         |
| GET         | /api/shopping-lists/{id}/                        | ShoppingListDetail.jsx                                                                                   |
| GET         | /api/shopping-lists/purchased-shopping-stats/    | statistics.jsx                                                                                           |
| GET         | /api/shopping-lists/purchased-stats-by-category/ | statistics.jsx                                                                                           |
| GET         | /api/groups/                                     | SelectGroup.jsx                                                                                          |
| GET         | /api/users/                                      | SelectGroup.jsx, CreateGroup.jsx, accountManagement.jsx                                                  |
| GET         | /api/fridge/                                     | statistics.jsx, fridge.jsx, dashboard.jsx, NotificationBell.jsx, AddNewPlanning.jsx                      |
| GET         | /api/fridge/recommendation/                      | fridge.jsx, AddNewPlanning.jsx                                                                           |
| GET         | /api/fridge/notifications/                       | NotificationBell.jsx                                                                                     |
| GET         | /api/recipes/                                    | recipes.jsx                                                                                              |
| GET         | /api/favorite-recipes/                           | recipes.jsx, Profile.jsx                                                                                 |
| GET         | /api/meal-plans/                                 | statistics.jsx, Profile.jsx, plan.jsx, dashboard.jsx                                                     |
| GET         | /api/meal-plans/weekly/                          | (nếu có)                                                                                                 |
| GET         | /api/meal-plans/{planID}/                        | AddNewPlanning.jsx                                                                                       |
| GET         | /api/user/me/                                    | Profile.jsx, Header.jsx                                                                                  |
| POST        | /api/token/refresh/                              | protectedRoute.jsx                                                                                       |
| POST        | /api/shopping-lists/{listId}/items/              | store.jsx, ShoppingListDetail.jsx, addShoppingList.jsx                                                   |
| POST        | /api/fridge/                                     | ShoppingListDetail.jsx, fridge.jsx                                                                       |
| POST        | /api/groups/create/                              | SelectGroup.jsx, CreateGroup.jsx                                                                         |
| POST        | /api/register/                                   | Register.jsx                                                                                             |
| POST        | /api/recipes/                                    | recipes.jsx                                                                                              |
| POST        | /api/favorite-recipes/                           | recipes.jsx                                                                                              |
| POST        | /api/token/                                      | Login.jsx                                                                                                |
| POST        | /api/categories/                                 | dataManagement.jsx                                                                                       |
| POST        | /api/shopping-lists/                             | addShoppingList.jsx                                                                                      |
| POST        | /api/meal-plans/                                 | AddNewPlanning.jsx                                                                                       |
| PUT         | /api/shopping-lists/{id}/items/{itemId}/         | ShoppingListDetail.jsx                                                                                   |
| PUT         | /api/recipes/{id}/                               | recipes.jsx                                                                                              |
| PUT         | /api/user/update/                                | Profile.jsx                                                                                              |
| PUT         | /api/products/{id}/                              | EditProduct.jsx                                                                                          |
| PUT         | /api/categories/{id}/                            | dataManagement.jsx                                                                                       |
| PUT         | /api/meal-plans/{id}/                            | AddNewPlanning.jsx                                                                                       |
| DELETE      | /api/products/{productId}/                       | store.jsx                                                                                                |
| DELETE      | /api/shopping-lists/{id}/items/{itemId}/         | ShoppingListDetail.jsx                                                                                   |
| DELETE      | /api/recipes/{id}/                               | recipes.jsx                                                                                              |
| DELETE      | /api/favorite-recipes/                           | recipes.jsx                                                                                              |
| DELETE      | /api/fridge/{id}/                                | fridge.jsx                                                                                               |
| DELETE      | /api/categories/{id}/                            | dataManagement.jsx                                                                                       |
| DELETE      | /api/users/{userId}/                             | accountManagement.jsx                                                                                    |
| PATCH       | /api/shopping-lists/{id}/items/{itemId}/toggle/  | ShoppingListDetail.jsx                                                                                   |
| PATCH       | /api/fridge/{id}/                                | fridge.jsx                                                                                               |
| PATCH       | /api/users/{userId}/status/                      | accountManagement.jsx                                                                                    |
| PATCH       | /api/users/{userId}/role/                        | accountManagement.jsx                                                                                    |

_Lưu ý: Một số endpoint có thể có tham số động (id, userId, listId, ...). Nếu cần chi tiết hơn về tham số hoặc response, hãy xem code cụ thể hoặc tài liệu backend._
