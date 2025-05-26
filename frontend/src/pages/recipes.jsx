import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";

const user = JSON.parse(localStorage.getItem("user"));
const isAdmin = user && user.role === "admin";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    recipeName: "",
    description: "",
    instruction: "",
    ingredient_ids: [], // Changed to store product IDs
    image: null, // This will hold the File object for upload
  });
  const [imagePreview, setImagePreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]); // For display purposes
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get("api/recipes/");
        setRecipes(
          response.data.map((recipe) => ({
            id: recipe.recipeID,
            title: recipe.recipeName,
            description: recipe.description,
            instructions: recipe.instruction,
            // START: THAY ĐỔI ĐỂ LẤY URL ẢNH TỪ CLOUDINARY
            image: recipe.image // Dùng trực tiếp URL từ API (do Django lưu từ Cloudinary)
              ? recipe.image
              : "/images/default.jpg", // Ảnh mặc định nếu không có
            // END: THAY ĐỔI
            tags: recipe.recipeName.split(" ").slice(0, 3),
            liked: false,
            ingredients: recipe.isingredient_set
              ? recipe.isingredient_set.map((ing) => ({
                  id: ing.product.productID,
                  name: ing.product.productName,
                  available: true,
                  // Nếu bạn đã thêm trường 'quantity' vào model IsIngredient
                  // thì cũng nên thêm vào đây:
                  // quantity: ing.quantity,
                }))
              : [],
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
    if (term.trim()) {
      try {
        const response = await api.get(`api/products/search/?q=${term}`);
        const results = response.data.map((product) => ({
          id: product.productID,
          name: product.productName,
        }));
        setFilteredIngredients(results);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm nguyên liệu:", err);
        setFilteredIngredients([]);
      }
    } else {
      setFilteredIngredients([]);
    }
  };

  // Handle selecting an existing ingredient
  const handleSelectIngredient = (ingredient) => {
    if (!formData.ingredient_ids.includes(ingredient.id)) {
      setFormData((prev) => ({
        ...prev,
        ingredient_ids: [...prev.ingredient_ids, ingredient.id],
      }));
      setSelectedIngredients((prev) => [
        ...prev,
        { id: ingredient.id, name: ingredient.name },
      ]);
    }
    setSearchTerm("");
    setFilteredIngredients([]);
  };

  // Handle adding a new ingredient
  const handleAddNewIngredient = async () => {
    if (!searchTerm.trim()) return;
    try {
      const productData = {
        productName: searchTerm.trim(),
        original_price: 0,
        price: 0,
        unit: "unit",
        shelfLife: 7,
        isCustom: true,
      };
      const response = await api.post("api/products/", productData);
      const newProduct = {
        id: response.data.productID,
        name: response.data.productName,
      };
      setFormData((prev) => ({
        ...prev,
        ingredient_ids: [...prev.ingredient_ids, newProduct.id],
      }));
      setSelectedIngredients((prev) => [...prev, newProduct]);
      setSearchTerm("");
      setFilteredIngredients([]);
    } catch (err) {
      setMessage("Lỗi khi thêm nguyên liệu mới");
      console.error(err);
    }
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
    setFormData({ ...formData, image: null }); // Quan trọng: set image về null
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recipeName || !formData.description || !formData.instruction) {
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
      submitFormData.append("isCustom", true);

      // Append each ingredient ID individually
      // Nếu bạn đã thay đổi backend để nhận list of dicts cho ingredients (có quantity)
      // thì bạn sẽ cần thay đổi logic append FormData tại đây
      formData.ingredient_ids.forEach((id) => {
        submitFormData.append("ingredient_ids", id);
      });

      if (formData.image) {
        // Đây là trường bạn đã đặt trong serializer của Django (ví dụ: image_upload)
        // Nếu bạn dùng tên khác, hãy thay đổi "image_upload" cho phù hợp
        submitFormData.append("image_upload", formData.image);
      } else if (isEditMode && imagePreview === "") {
        // Nếu đang ở chế độ chỉnh sửa và người dùng đã xóa ảnh cũ
        submitFormData.append("image_upload", ""); // Gửi rỗng để backend biết xóa ảnh cũ
      }


      let recipeId;
      if (isEditMode) {
        await api.put(`api/recipes/${selectedRecipe.id}/`, submitFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        recipeId = selectedRecipe.id;
      } else {
        const response = await api.post("api/recipes/", submitFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        recipeId = response.data.recipeID;
      }

      // Re-fetch recipes after successful add/edit to ensure data consistency
      const response = await api.get("api/recipes/");
      setRecipes(
        response.data.map((recipe) => ({
          id: recipe.recipeID,
          title: recipe.recipeName,
          description: recipe.description,
          instructions: recipe.instruction,
          // START: THAY ĐỔI ĐỂ LẤY URL ẢNH TỪ CLOUDINARY
          image: recipe.image // Dùng trực tiếp URL từ API (do Django lưu từ Cloudinary)
            ? recipe.image
            : "/images/default.jpg", // Ảnh mặc định nếu không có
          // END: THAY ĐỔI
          tags: recipe.recipeName.split(" ").slice(0, 3),
          time: "30 phút", // These seem like static values, consider if they should be dynamic
          people: 4, // These seem like static values, consider if they should be dynamic
          liked: false,
          ingredients: recipe.isingredient_set
            ? recipe.isingredient_set.map((ing) => ({
                id: ing.product.productID,
                name: ing.product.productName,
                available: true,
                // Nếu bạn đã thêm trường 'quantity' vào model IsIngredient
                // thì cũng nên thêm vào đây:
                // quantity: ing.quantity,
              }))
            : [],
        }))
      );

      setMessage("Recipe saved successfully!");
      setTimeout(() => {
        setIsAddModalOpen(false);
        setIsEditMode(false);
        setFormData({ recipeName: "", description: "", instruction: "", ingredient_ids: [], image: null });
        setImagePreview("");
        setSearchTerm("");
        setFilteredIngredients([]);
        setSelectedIngredients([]);
        setMessage(""); // Clear message after successful operation
      }, 1500);
    } catch (err) {
      setMessage("Failed to save recipe");
      console.error("Error saving recipe:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete recipe
  const handleDelete = async () => {
    try {
      await api.delete(`api/recipes/${selectedRecipe.id}/`);
      setRecipes(recipes.filter((recipe) => recipe.id !== selectedRecipe.id));
      setIsDetailsModalOpen(false);
      setSelectedRecipe(null);
      setMessage("Recipe deleted successfully!");
      setTimeout(() => setMessage(""), 1500);
    } catch (err) {
      setMessage("Failed to delete recipe");
      console.error(err);
    }
  };

  // Open edit form
  const handleEdit = () => {
    setFormData({
      recipeName: selectedRecipe.title,
      description: selectedRecipe.description,
      instruction: selectedRecipe.instructions,
      ingredient_ids: selectedRecipe.ingredients.map((ing) => ing.id),
      image: null, // Đặt image về null, vì bạn sẽ hiển thị qua imagePreview
    });
    setSelectedIngredients(selectedRecipe.ingredients); // Populate selectedIngredients for display
    setImagePreview(selectedRecipe.image); // Sử dụng URL ảnh hiện có để hiển thị preview
    setIsEditMode(true);
    setIsDetailsModalOpen(false);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/store"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại cửa hàng
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Công thức nấu ăn</h1>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        {isAdmin && (
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setIsEditMode(false);
              setFormData({ recipeName: "", description: "", instruction: "", ingredient_ids: [], image: null });
              setImagePreview("");
              setSelectedIngredients([]);
              setMessage(""); // Clear message when opening add modal
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
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <img
              src={recipe.image} // Dùng trực tiếp URL ảnh
              alt={recipe.title}
              className="w-full h-40 object-cover rounded mb-3"
              onError={(e) => {
                e.target.src = "/images/default.jpg"; // Fallback nếu ảnh lỗi
              }}
            />
            <h2 className="text-xl font-semibold mb-1">{recipe.title}</h2>
            <p className="text-gray-500 text-sm mb-2">{recipe.description}</p>
            <div className="flex flex-wrap gap-2 text-xs mb-2">
            </div>
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
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
                        key={ingredient.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectIngredient(ingredient)}
                      >
                        {ingredient.name}
                      </div>
                    ))}
                    {searchTerm &&
                      !filteredIngredients.some(
                        (ing) => ing.name.toLowerCase() === searchTerm.toLowerCase()
                      ) && (
                        <div
                          className="p-2 hover:bg-gray-100 cursor-pointer text-blue-500"
                          onClick={handleAddNewIngredient}
                        >
                          Thêm nguyên liệu mới: {searchTerm}
                        </div>
                      )}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedIngredients.map((ing, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">
                      {ing.name}
                      <button
                        type="button"
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => {
                          setSelectedIngredients(selectedIngredients.filter(item => item.id !== ing.id));
                          setFormData(prev => ({
                            ...prev,
                            ingredient_ids: prev.ingredient_ids.filter(id => id !== ing.id)
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
                    setSearchTerm("");
                    setFilteredIngredients([]);
                    setSelectedIngredients([]);
                    setMessage(""); // Clear message when closing add modal
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
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-5xl flex">
            <div className="w-1/2">
              <img
                src={selectedRecipe.image} // Dùng trực tiếp URL ảnh
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
                {isAdmin && (
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
                    key={index}
                    className={`px-3 py-1 rounded text-base ${
                      ing.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ing.name}
                    {/* Nếu có quantity, hiển thị ở đây */}
                    {/* {ing.quantity && ` (${ing.quantity})`} */}
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