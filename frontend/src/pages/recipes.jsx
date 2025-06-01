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
    ingredients: [],
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Dùng cho tìm kiếm nguyên liệu trong modal
  const [mainSearchTerm, setMainSearchTerm] = useState(""); // Dùng cho thanh tìm kiếm chính
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [ingredientType, setIngredientType] = useState("catalog"); // "catalog" hoặc "custom"
  const [customIngredientName, setCustomIngredientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get("/api/recipes/");
        const fetchedRecipes = response.data.map((recipe) => ({
          id: recipe.recipeID,
          title: recipe.recipeName,
          description: recipe.description,
          instructions: recipe.instruction,
          image: recipe.image || "/images/default.jpg",
          tags: recipe.recipeName.split(" ").slice(0, 3),
          liked: false,
          ingredients: recipe.isingredient_set.map((ing) => ({
            productID: ing.product ? ing.product.productID : null,
            productName: ing.product
              ? ing.product.productName
              : ing.ingredientName,
            unit: ing.product ? ing.product.unit : "unit",
            isCustom: !ing.product,
          })),
        }));
        setRecipes(fetchedRecipes);
        setFilteredRecipes(fetchedRecipes);
      } catch (err) {
        setMessage("Lỗi khi lấy thực đơn");
        console.error(err);
      }
    };
    fetchRecipes();
  }, []);

  // Handle main search
  const handleMainSearch = (e) => {
    const term = e.target.value;
    setMainSearchTerm(term);
    if (term.trim() === "") {
      setFilteredRecipes(recipes);
      return;
    }
    const lowerCaseTerm = term.toLowerCase();
    const filtered = recipes.filter((recipe) => {
      const matchesRecipeName = recipe.title
        .toLowerCase()
        .includes(lowerCaseTerm);
      const matchesIngredients = recipe.ingredients.some((ing) =>
        ing.productName.toLowerCase().includes(lowerCaseTerm)
      );
      return matchesRecipeName || matchesIngredients;
    });
    setFilteredRecipes(filtered);
  };

  // Handle search for catalog ingredients
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
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
        }))
      );
    } catch (err) {
      console.error("Search error:", err);
      setFilteredIngredients([]);
    }
  };

  // Select catalog ingredient
  const handleSelectIngredient = (ingredient) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          productID: ingredient.productID,
          productName: ingredient.productName,
          unit: ingredient.unit,
          isCustom: false,
        },
      ],
    }));
    setSearchTerm("");
    setFilteredIngredients([]);
  };

  // Add custom ingredient
  const handleAddCustomIngredient = () => {
    if (!customIngredientName.trim()) {
      setMessage("Vui lòng nhập tên nguyên liệu tùy chỉnh.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          productID: null,
          productName: customIngredientName.trim(),
          unit: "unit",
          isCustom: true,
        },
      ],
    }));
    setCustomIngredientName("");
    setMessage("");
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove image
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
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
    setCustomIngredientName("");
    setIngredientType("catalog");
    setFilteredIngredients([]);
    setMessage("");
  };

  // Handle edit
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

  // Handle delete
  const handleDelete = async () => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa công thức "${selectedRecipe.title}"?`
      )
    )
      return;
    try {
      await api.delete(`/api/recipes/${selectedRecipe.id}/`);
      setRecipes(recipes.filter((recipe) => recipe.id !== selectedRecipe.id));
      setFilteredRecipes(
        filteredRecipes.filter((recipe) => recipe.id !== selectedRecipe.id)
      );
      setIsDetailsModalOpen(false);
      setMessage("Xóa công thức thành công");
    } catch (err) {
      setMessage("Lỗi khi xóa công thức");
      console.error(err);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.recipeName ||
      !formData.description ||
      !formData.instruction
    ) {
      setMessage("Vui lòng điền đầy đủ tên món ăn, mô tả và hướng dẫn.");
      return;
    }
    setLoading(true);
    setMessage("");

    const formDataToSend = new FormData();
    formDataToSend.append("recipeName", formData.recipeName);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("instruction", formData.instruction);
    formDataToSend.append("isCustom", formData.isCustom || true);
    if (formData.image) {
      formDataToSend.append("image_upload", formData.image);
    }
    const ingredientData = formData.ingredients.map((ing) => ({
      product_id: ing.isCustom ? null : ing.productID,
      ingredientName: ing.isCustom ? ing.productName : null,
    }));
    ingredientData.forEach((item, index) => {
      formDataToSend.append(
        `ingredient_data[${index}][product_id]`,
        item.product_id ?? ""
      );
      formDataToSend.append(
        `ingredient_data[${index}][ingredientName]`,
        item.ingredientName ?? ""
      );
    });
    console.log(
      "Sending ingredient_data:",
      JSON.stringify(ingredientData, null, 2)
    );
    const formDataObject = {};
    for (const [key, value] of formDataToSend.entries()) {
      formDataObject[key] =
        value instanceof File ? `[File: ${value.name}]` : value;
    }
    console.log("Sent FormData:", JSON.stringify(formDataObject, null, 2));

    try {
      let response;
      if (isEditMode && selectedRecipe) {
        response = await api.put(
          `/api/recipes/${selectedRecipe.id}/`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setMessage("Cập nhật công thức thành công");
        setRecipes((prev) =>
          prev.map((recipe) =>
            recipe.id === selectedRecipe.id
              ? {
                  ...recipe,
                  title: formData.recipeName,
                  description: formData.description,
                  instructions: formData.instruction,
                  ingredients: formData.ingredients,
                  image: formData.image
                    ? URL.createObjectURL(formData.image)
                    : recipe.image,
                }
              : recipe
          )
        );
        setFilteredRecipes((prev) =>
          prev.map((recipe) =>
            recipe.id === selectedRecipe.id
              ? {
                  ...recipe,
                  title: formData.recipeName,
                  description: formData.description,
                  instructions: formData.instruction,
                  ingredients: formData.ingredients,
                  image: formData.image
                    ? URL.createObjectURL(formData.image)
                    : recipe.image,
                }
              : recipe
          )
        );
      } else {
        response = await api.post("/api/recipes/", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Thêm công thức thành công");
        const newRecipe = {
          id: response.data.recipeID,
          title: formData.recipeName,
          description: formData.description,
          instructions: formData.instruction,
          image: response.data.image || "/images/default.jpg",
          tags: formData.recipeName.split(" ").slice(0, 3),
          liked: false,
          ingredients: formData.ingredients,
        };
        setRecipes((prev) => [...prev, newRecipe]);
        setFilteredRecipes((prev) => [...prev, newRecipe]);
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data, null, 2) ||
        "Unknown error";
      setMessage(`Có lỗi xảy ra khi lưu công thức: ${errorMessage}`);
      console.error(
        "Error response:",
        JSON.stringify(err.response?.data, null, 2)
      );
      console.error("Full error:", err);
      console.error("Sent FormData:", JSON.stringify(formDataObject, null, 2));
    } finally {
      setLoading(false);
    }
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
        placeholder="Tìm kiếm công thức hoặc nguyên liệu..."
        value={mainSearchTerm}
        onChange={handleMainSearch}
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
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
            >
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
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            Không tìm thấy công thức phù hợp.
          </p>
        )}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên món ăn *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hướng dẫn *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nguyên liệu
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ingredientType"
                      value="catalog"
                      checked={ingredientType === "catalog"}
                      onChange={() => setIngredientType("catalog")}
                      className="mr-2"
                    />
                    Nguyên liệu có sẵn
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ingredientType"
                      value="custom"
                      checked={ingredientType === "custom"}
                      onChange={() => setIngredientType("custom")}
                      className="mr-2"
                    />
                    Nguyên liệu tùy chỉnh
                  </label>
                </div>
                {ingredientType === "catalog" ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm nguyên liệu..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchTerm && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto border rounded bg-white shadow-lg z-50">
                        {filteredIngredients.length > 0 ? (
                          filteredIngredients.map((ingredient) => (
                            <div
                              key={ingredient.productID}
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleSelectIngredient(ingredient)}
                            >
                              {ingredient.productName} ({ingredient.unit})
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500 text-center">
                            Không tìm thấy nguyên liệu
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập tên nguyên liệu tùy chỉnh"
                      value={customIngredientName}
                      onChange={(e) => setCustomIngredientName(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomIngredient}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md"
                    >
                      Thêm
                    </button>
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
                              (_, i) => i !== index
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh
                </label>
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
                <h2 className="text-3xl font-semibold">
                  {selectedRecipe.title}
                </h2>
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
              <p className="text-gray-600 mt-3 text-lg">
                {selectedRecipe.description}
              </p>
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
              <p className="text-gray-600 mt-3 text-lg whitespace-pre-line">
                {selectedRecipe.instructions}
              </p>
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
