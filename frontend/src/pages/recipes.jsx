import React, { useState, useEffect } from "react";
import { Save, Upload, X } from "lucide-react";
import api from "../api";

const Recipes = () => {
  const isAdmin = 1; // Giả sử người dùng là admin
  const [recipes, setRecipes] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    recipeName: "",
    description: "",
    instruction: "",
    ingredients: [], // Lưu cả ingredient từ catalog và custom
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [isFromCatalog, setIsFromCatalog] = useState(false);
  const [saveToCatalog, setSaveToCatalog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get("/api/recipes/");
        setRecipes(
          response.data.map((recipe) => ({
            id: recipe.recipeID,
            title: recipe.recipeName,
            description: recipe.description,
            instructions: recipe.instruction,
            image: recipe.image ? recipe.image : "/images/default.jpg",
            tags: recipe.recipeName.split(" ").slice(0, 3),
            liked: false,
            ingredients: [
              ...(recipe.isingredient_set
                ? recipe.isingredient_set.map((ing) => ({
                    productID: ing.product.productID,
                    productName: ing.product.productName,
                    unit: ing.product.unit,
                    categoryName: ing.product.categoryName || "Null",
                    isCustom: false,
                  }))
                : []),
              ...(recipe.custom_ingredients
                ? JSON.parse(recipe.custom_ingredients).map((ing) => ({
                    productID: ing.id,
                    productName: ing.name,
                    unit: ing.unit || "unit",
                    categoryName: ing.categoryName || "Null",
                    isCustom: true,
                  }))
                : []),
            ],
          }))
        );
      } catch (err) {
        setMessage("Lỗi khi lấy thực đơn");
        console.error(err);
      }
    };
    fetchRecipes();
  }, []);

  // Handle search for ingredients
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsFromCatalog(false);

    if (term.length < 2) {
      setFilteredIngredients([]);
      return;
    }

    try {
      const response = await api.get("/api/products/search/", {
        params: { q: term },
      });
      setFilteredIngredients(
        response.data.map((product) => ({
          productID: product.productID,
          productName: product.productName,
          unit: product.unit,
          categoryName: product.categoryName || "Null",
        }))
      );
    } catch (err) {
      console.error("Search error:", err);
      setFilteredIngredients([]);
    }
  };

  // Handle selecting an existing ingredient
  const handleSelectIngredient = (ingredient) => {
    if (!formData.ingredients.some((ing) => ing.productID === ingredient.productID && !ing.isCustom)) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          { ...ingredient, isCustom: false },
        ],
      }));
      setSearchTerm(ingredient.productName);
      setIsFromCatalog(true);
      setFilteredIngredients([]);
      setSaveToCatalog(false);
    } else {
      setMessage("Nguyên liệu này đã được chọn!");
    }
  };

  // Handle adding a new ingredient
  const handleAddNewIngredient = async () => {
    if (!searchTerm.trim()) return;
    if (
      formData.ingredients.some(
        (ing) => ing.productName.toLowerCase() === searchTerm.trim().toLowerCase()
      )
    ) {
      setMessage("Nguyên liệu này đã được chọn!");
      return;
    }

    const newIngredient = {
      productID: null,
      productName: searchTerm.trim(),
      unit: "unit",
      categoryName: "Null",
      isCustom: true,
    };

    if (saveToCatalog) {
      try {
        const productData = {
          productName: searchTerm.trim(),
          unit: "unit",
          categoryName: "Null",
          original_price: 0,
          price: 0,
          shelfLife: 7,
        };
        const response = await api.post("/api/products/", productData);
        newIngredient.productID = response.data.productID;
        newIngredient.isCustom = false;
      } catch (err) {
        setMessage("Lỗi khi thêm nguyên liệu mới vào danh mục");
        console.error(err);
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));
    setSearchTerm("");
    setFilteredIngredients([]);
    setSaveToCatalog(false);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Vui lòng chọn một tệp hình ảnh!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Hình ảnh quá lớn! Vui lòng chọn tệp nhỏ hơn 5MB.");
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.onerror = () => setMessage("Lỗi khi tải hình ảnh!");
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImagePreview("");
    setFormData({ ...formData, image: null });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      recipeName: "",
      description: "",
      instruction: "",
      ingredients: [],
      image: null,
    });
    setImagePreview("");
    setSearchTerm("");
    setFilteredIngredients([]);
    setIsFromCatalog(false);
    setSaveToCatalog(false);
    setMessage("");
  };

  // Handle submit (add or update recipe)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.recipeName ||
      !formData.description ||
      !formData.instruction ||
      formData.ingredients.length === 0
    ) {
      setMessage("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const submitFormData = new FormData();
      submitFormData.append("recipeName", formData.recipeName);
      submitFormData.append("description", formData.description);
      submitFormData.append("instruction", formData.instruction);

      // Append ingredient IDs (non-custom)
      formData.ingredients.forEach((ing) => {
        if (!ing.isCustom && ing.productID) {
          submitFormData.append("ingredient_ids", ing.productID);
        }
      });

      // Append custom ingredients as JSON string
      const customIngredients = formData.ingredients
        .filter((ing) => ing.isCustom)
        .map((ing) => ({
          id: `custom-${Date.now()}-${Math.random()}`,
          name: ing.productName,
          unit: ing.unit,
          categoryName: ing.categoryName,
        }));
      submitFormData.append("custom_ingredients", JSON.stringify(customIngredients));

      if (formData.image) {
        submitFormData.append("image_upload", formData.image);
      } else if (isEditMode && imagePreview === "/images/default.jpg") {
        submitFormData.append("image_upload", "");
      }

      let recipeId;
      if (isEditMode) {
        await api.put(`/api/recipes/${selectedRecipe.id}/`, submitFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        recipeId = selectedRecipe.id;
      } else {
        const response = await api.post("/api/recipes/", submitFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        recipeId = response.data.recipeID;
      }

      // Refetch recipes
      const response = await api.get("/api/recipes/");
      setRecipes(
        response.data.map((recipe) => ({
          id: recipe.recipeID,
          title: recipe.recipeName,
          description: recipe.description,
          instructions: recipe.instruction,
          image: recipe.image ? recipe.image : "/images/default.jpg",
          tags: recipe.recipeName.split(" ").slice(0, 3),
          liked: false,
          ingredients: [
            ...(recipe.isingredient_set
              ? recipe.isingredient_set.map((ing) => ({
                  productID: ing.product.productID,
                  productName: ing.product.productName,
                  unit: ing.product.unit,
                  categoryName: ing.product.categoryName || "Null",
                  isCustom: false,
                }))
              : []),
            ...(recipe.custom_ingredients
              ? JSON.parse(recipe.custom_ingredients).map((ing) => ({
                  productID: ing.id,
                  productName: ing.name,
                  unit: ing.unit || "unit",
                  categoryName: ing.categoryName || "Null",
                  isCustom: true,
                }))
              : []),
          ],
        }))
      );

      setMessage("Công thức được lưu thành công!");
      setTimeout(() => {
        setIsAddModalOpen(false);
        setIsEditMode(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setMessage("Lỗi khi lưu công thức");
      console.error("Error saving recipe:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete recipe
  const handleDelete = async () => {
    try {
      await api.delete(`/api/recipes/${selectedRecipe.id}/`);
      setRecipes(recipes.filter((recipe) => recipe.id !== selectedRecipe.id));
      setIsDetailsModalOpen(false);
      setSelectedRecipe(null);
      setMessage("Xóa công thức thành công!");
      setTimeout(() => setMessage(""), 1500);
    } catch (err) {
      setMessage("Lỗi khi xóa công thức");
      console.error(err);
    }
  };

  // Handle edit recipe
  const handleEdit = () => {
    setFormData({
      recipeName: selectedRecipe.title,
      description: selectedRecipe.description,
      instruction: selectedRecipe.instructions,
      ingredients: selectedRecipe.ingredients,
      image: null,
    });
    setImagePreview(selectedRecipe.image);
    setIsEditMode(true);
    setIsDetailsModalOpen(false);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Công thức nấu ăn</h1>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        {isAdmin === 1 && (
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setIsEditMode(false);
              resetForm();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-lg"
          >
            Thêm công thức
          </button>
        )}
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded-lg">
          Gợi ý từ tủ lạnh
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm kiếm công thức, nguyên liệu..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {message && (
        <p
          className={`text-sm text-center ${
            message.includes("thành công") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-40 object-cover rounded mb-3"
              onError={(e) => {
                e.target.src = "/images/default.jpg";
              }}
            />
            <h2 className="text-xl font-semibold mb-1">{recipe.title}</h2>
            <p className="text-gray-500 text-sm mb-2">{recipe.description}</p>
            <button
              onClick={() => {
                setSelectedRecipe(recipe);
                setIsDetailsModalOpen(true);
              }}
              className="mt-3 w-full text-sm text-center border border-gray-300 rounded py-1 hover:bg-gray-50"
            >
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>

      {/* Add/Edit Recipe Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? "Cập nhật công thức" : "Thêm công thức mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  name="recipeName"
                  value={formData.recipeName}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hướng dẫn *</label>
                <textarea
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nguyên liệu</label>
                <input
                  type="text"
                  placeholder="Tìm nguyên liệu..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded bg-white">
                    {filteredIngredients.map((ingredient) => (
                      <div
                        key={ingredient.productID}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectIngredient(ingredient)}
                      >
                        {ingredient.productName} ({ingredient.unit})
                      </div>
                    ))}
                    {searchTerm &&
                      !filteredIngredients.some(
                        (ing) => ing.productName.toLowerCase() === searchTerm.toLowerCase()
                      ) && (
                        <div className="p-2 border-t">
                          <div
                            className="hover:bg-gray-100 cursor-pointer text-blue-500"
                            onClick={handleAddNewIngredient}
                          >
                            Thêm nguyên liệu mới: {searchTerm}
                          </div>
                          {isAdmin === 1 && (
                            <label className="flex items-center mt-2">
                              <input
                                type="checkbox"
                                checked={saveToCatalog}
                                onChange={(e) => setSaveToCatalog(e.target.checked)}
                                className="mr-2"
                              />
                              Lưu nguyên liệu vào danh mục
                            </label>
                          )}
                        </div>
                      )}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.ingredients.map((ing, index) => (
                    <span
                      key={ing.productID || `custom-${index}`}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                    >
                      {ing.productName} {ing.isCustom && "(Tùy chỉnh)"}
                      <button
                        type="button"
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            ingredients: prev.ingredients.filter(
                              (item) => item.productID !== ing.productID || item.isCustom !== ing.isCustom
                            ),
                          }));
                        }}
                      >
                        <X className="h-3 w-3 inline-block" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md"
                />
                {imagePreview && (
                  <div className="relative w-full max-w-[200px] mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.src = "/images/default.jpg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full hover:bg-red-700"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1.5 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {loading ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedRecipe && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-5xl flex max-h-[90vh] overflow-y-auto">
            <div className="w-1/2">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                className="w-full h-[500px] object-cover rounded"
                onError={(e) => {
                  e.target.src = "/images/default.jpg";
                }}
              />
            </div>
            <div className="w-1/2 pl-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-semibold">{selectedRecipe.title}</h2>
                {isAdmin === 1 && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleEdit}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-base rounded"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-base rounded"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-3 text-lg">{selectedRecipe.description}</p>
              <h3 className="text-xl font-semibold mt-6">Nguyên liệu</h3>
              <div className="flex flex-wrap gap-3 mt-3">
                {selectedRecipe.ingredients.map((ing, index) => (
                  <span
                    key={ing.productID || `custom-${index}`}
                    className="px-3 py-1 rounded text-base bg-gray-100 text-gray-600"
                  >
                    {ing.productName} {ing.isCustom && "(Tùy chỉnh)"}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-semibold mt-6">Hướng dẫn</h3>
              <p className="text-gray-600 mt-3 text-lg whitespace-pre-line">{selectedRecipe.instructions}</p>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;