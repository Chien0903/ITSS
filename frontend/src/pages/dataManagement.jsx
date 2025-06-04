import React, { useState } from "react";
import { Button, Input, Modal, Form, Table, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import { useToast } from '../hooks/use-toast';
// import { foodCategories } from '../data/mockData';

// Dữ liệu mẫu nếu chưa có import
const foodCategories = {
  vegetables: { name: "Rau củ", color: "#4CAF50", icon: "🥬" },
  fruits: { name: "Trái cây", color: "#FF9800", icon: "🍎" },
  meat: { name: "Thịt", color: "#F44336", icon: "🍖" },
};

const DataManagement = () => {
  // const { toast } = useToast();
  const [categories, setCategories] = useState(Object.entries(foodCategories));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleAddCategory = () => {
    form.validateFields().then((values) => {
      if (!values.key || !values.name) {
        // toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
        message.error("Vui lòng điền đầy đủ thông tin");
        return;
      }
      setCategories([
        ...categories,
        [
          values.key,
          {
            name: values.name,
            color: values.color,
            icon: values.icon,
          },
        ],
      ]);
      form.resetFields();
      setIsAddModalOpen(false);
      // toast({ title: 'Thành công', description: 'Đã thêm loại thực phẩm mới' });
      message.success("Đã thêm loại thực phẩm mới");
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    editForm.setFieldsValue({
      key: category[0],
      name: category[1].name,
      color: category[1].color,
      icon: category[1].icon,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = () => {
    editForm.validateFields().then((values) => {
      setCategories(
        categories.map((cat) =>
          cat[0] === editingCategory[0]
            ? [
                values.key,
                { name: values.name, color: values.color, icon: values.icon },
              ]
            : cat
        )
      );
      setIsEditModalOpen(false);
      setEditingCategory(null);
      // toast({ title: 'Thành công', description: 'Đã cập nhật loại thực phẩm' });
      message.success("Đã cập nhật loại thực phẩm");
    });
  };

  const handleDeleteCategory = (key) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa loại thực phẩm này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setCategories(categories.filter((cat) => cat[0] !== key));
        // toast({ title: 'Thành công', description: 'Đã xóa loại thực phẩm' });
        message.success("Đã xóa loại thực phẩm");
      },
    });
  };

  const columns = [
    {
      title: "Biểu tượng",
      dataIndex: "icon",
      key: "icon",
      render: (icon) => <span style={{ fontSize: 22 }}>{icon}</span>,
    },
    {
      title: "Tên loại",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Mã loại",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (color) => (
        <span>
          <Tag color={color} style={{ borderRadius: 6 }}>
            &nbsp;
          </Tag>
          <span style={{ marginLeft: 8 }}>{color}</span>
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <span style={{ display: "flex", gap: 8 }}>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              handleEditCategory([
                record.key,
                {
                  name: record.name,
                  color: record.color,
                  icon: record.icon,
                },
              ])
            }
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteCategory(record.key)}
          />
        </span>
      ),
    },
  ];

  const dataSource = categories.map(([key, category]) => ({
    key,
    name: category.name,
    color: category.color,
    icon: category.icon,
  }));

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>
          Danh sách loại thực phẩm
        </h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Thêm loại mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
      />

      {/* Modal thêm loại */}
      <Modal
        title="Thêm loại thực phẩm mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={handleAddCategory}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã loại"
            name="key"
            rules={[{ required: true, message: "Vui lòng nhập mã loại" }]}
          >
            <Input placeholder="vd: vegetables" />
          </Form.Item>
          <Form.Item
            label="Tên loại"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên loại" }]}
          >
            <Input placeholder="vd: Rau củ" />
          </Form.Item>
          <Form.Item label="Màu sắc" name="color" initialValue="#4CAF50">
            <Input
              type="color"
              style={{ width: 60, height: 32, padding: 0, border: "none" }}
            />
          </Form.Item>
          <Form.Item label="Biểu tượng" name="icon" initialValue="📦">
            <Input placeholder="vd: 🥬" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa loại */}
      <Modal
        title="Chỉnh sửa loại thực phẩm"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleUpdateCategory}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Mã loại" name="key">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Tên loại"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên loại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Màu sắc" name="color">
            <Input
              type="color"
              style={{ width: 60, height: 32, padding: 0, border: "none" }}
            />
          </Form.Item>
          <Form.Item label="Biểu tượng" name="icon">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataManagement;
