// src/pages/HomeTemplate/Profile/index.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Descriptions,
  Tabs,
  Table,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Radio,
  message,
  Row,
  Col,
} from "antd";
import Typography from "antd/es/typography";
import Title from "antd/es/typography/Title";
import {
  UserOutlined,
  EditOutlined,
  HistoryOutlined,
  TransactionOutlined,
} from "@ant-design/icons";
import moment from "moment"; // Cần moment cho DatePicker

// Import actions và selectors từ slice profile và login
import {
  fetchUserProfile,
  fetchUserBookingHistory,
  updateUserProfile,
  clearProfileState,
  selectProfileData,
  selectBookingHistory,
  selectProfileLoading,
  selectHistoryLoading,
  selectProfileError,
  selectHistoryError,
  selectUpdateProfileLoading,
  selectUpdateProfileSuccess,
  clearUpdateStatus,
} from "./slice";
import { selectUserData, selectUserEmail } from "../Login/slice"; // Lấy user từ login state

const { TabPane } = Tabs;
const { Item } = Descriptions;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Form cho modal cập nhật

  // Lấy thông tin user hiện tại từ login state
  const currentUser = useSelector(selectUserData);
  // Lấy ID người dùng (ưu tiên ID từ API signin, nếu không có dùng email)
  const userId = currentUser?.id; // API signin trả về user.id
  const userEmailForHistory = currentUser?.email; // API lịch sử có thể dùng email? (Check Swagger) -> API dùng MaNguoiDung (chính là user.id)

  // Lấy state từ profile slice (key profileReducer)
  const profileData = useSelector(selectProfileData);
  const bookingHistory = useSelector(selectBookingHistory);
  const profileLoading = useSelector(selectProfileLoading);
  const historyLoading = useSelector(selectHistoryLoading);
  const profileError = useSelector(selectProfileError);
  const historyError = useSelector(selectHistoryError);
  const updateLoading = useSelector(selectUpdateProfileLoading);
  const updateSuccess = useSelector(selectUpdateProfileSuccess);

  // State cho modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch dữ liệu khi có userId
  useEffect(() => {
    if (userId) {
      console.log("Fetching profile and history for userId:", userId);
      if (typeof fetchUserProfile === "function")
        dispatch(fetchUserProfile(userId));
      if (typeof fetchUserBookingHistory === "function")
        dispatch(fetchUserBookingHistory(userId)); // API dùng MaNguoiDung (là userId)
    } else {
      // Nếu không có userId (chưa login?), có thể redirect về login
      console.warn("ProfilePage: No userId found, redirecting to login.");
      // navigate('/login'); // Hoặc AuthGuard đã xử lý
    }

    // Cleanup state khi unmount
    return () => {
      if (typeof clearProfileState === "function")
        dispatch(clearProfileState());
    };
  }, [dispatch, userId]);

  // Xử lý hiển thị lỗi
  useEffect(() => {
    if (profileError) message.error(`Lỗi tải thông tin: ${profileError}`);
    if (historyError) message.error(`Lỗi tải lịch sử: ${historyError}`);
  }, [profileError, historyError]);

  // Xử lý sau khi cập nhật thành công
  useEffect(() => {
    if (updateSuccess) {
      setIsModalVisible(false); // Đóng modal
      // Không cần message ở đây vì slice đã có
      if (typeof clearUpdateStatus === "function")
        dispatch(clearUpdateStatus()); // Reset trạng thái update
      // Fetch lại profile để hiển thị thông tin mới nhất
      if (userId && typeof fetchUserProfile === "function")
        dispatch(fetchUserProfile(userId));
    }
  }, [updateSuccess, dispatch, userId]);

  // --- Modal và Form cập nhật ---
  const showModal = () => {
    if (profileData) {
      // Đặt giá trị ban đầu cho form từ profileData
      form.setFieldsValue({
        ...profileData,
        // Chuyển đổi gender và birthday cho Form
        gender: profileData.gender ? "male" : "female",
        birthday: profileData.birthday
          ? moment(profileData.birthday, "YYYY-MM-DD")
          : null, // Parse ngày
      });
      setIsModalVisible(true);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    if (typeof clearUpdateStatus === "function") dispatch(clearUpdateStatus()); // Reset lỗi/success nếu có
  };

  const handleUpdateProfile = (values) => {
    console.log("Updating profile with values:", values);
    // Chuẩn bị payload cho API PUT /api/users/{id}
    const payload = {
      id: userId, // API yêu cầu ID trong body? (Swagger không ghi rõ, nhưng thường là vậy)
      name: values.name,
      email: values.email,
      phone: values.phone,
      birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : "",
      gender: values.gender === "male", // Chuyển về boolean
      role: profileData?.role || "", // Giữ role cũ hoặc mặc định
      // Không gửi password ở đây trừ khi cho phép đổi pass
    };
    if (userId && typeof updateUserProfile === "function") {
      dispatch(updateUserProfile({ userId, userData: payload }));
    }
  };

  // --- Cấu hình cột cho bảng lịch sử đặt phòng ---
  const historyColumns = [
    {
      title: "Mã Phòng",
      dataIndex: "maPhong",
      key: "maPhong",
      render: (id) => <Link to={`/detailroom/${id}`}>{id}</Link>,
    },
    {
      title: "Ngày Đến",
      dataIndex: "ngayDen",
      key: "ngayDen",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Ngày Đi",
      dataIndex: "ngayDi",
      key: "ngayDi",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Số Khách",
      dataIndex: "soLuongKhach",
      key: "soLuongKhach",
      align: "center",
    },
    // Thêm cột xem chi tiết phòng nếu cần
    {
      title: "Chi tiết",
      key: "action",
      render: (_, record) => (
        <Link to={`/detailroom/${record.maPhong}`}>Xem phòng</Link>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">
        Thông tin cá nhân
      </Title>
      <Spin spinning={profileLoading || historyLoading} tip="Đang tải...">
        <Row gutter={[24, 24]}>
          {/* Cột thông tin cá nhân */}
          <Col xs={24} md={8} lg={6} className="text-center">
            <Avatar
              size={128}
              icon={<UserOutlined />}
              src={profileData?.avatar}
              className="mb-4 shadow-md"
            />
            <Button
              icon={<EditOutlined />}
              onClick={showModal}
              disabled={!profileData}
            >
              Chỉnh sửa thông tin
            </Button>
          </Col>
          <Col xs={24} md={16} lg={18}>
            {profileData ? (
              <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
                <Item label="Họ tên">{profileData.name}</Item>
                <Item label="Email">{profileData.email}</Item>
                <Item label="Số điện thoại">{profileData.phone}</Item>
                <Item label="Ngày sinh">
                  {profileData.birthday
                    ? moment(profileData.birthday).format("DD/MM/YYYY")
                    : "-"}
                </Item>
                <Item label="Giới tính">
                  {profileData.gender ? "Nam" : "Nữ"}
                </Item>
                <Item label="Vai trò">{profileData.role}</Item>
                {/* Thêm các trường khác nếu API trả về */}
              </Descriptions>
            ) : profileError ? (
              <p className="text-red-500">Không thể tải thông tin cá nhân.</p>
            ) : (
              <p>Đang tải thông tin...</p>
            )}
          </Col>
        </Row>

        {/* Tabs Lịch sử */}
        <Tabs defaultActiveKey="1" className="mt-8">
          <TabPane
            tab={
              <span className="flex items-center">
                <HistoryOutlined className="mr-2" /> Lịch sử đặt phòng
              </span>
            }
            key="1"
          >
            {historyError ? (
              <p className="text-red-500">Không thể tải lịch sử đặt phòng.</p>
            ) : (
              <Table
                columns={historyColumns}
                dataSource={bookingHistory}
                loading={historyLoading}
                rowKey="id" // Sử dụng id của lượt đặt phòng làm key
                pagination={{ pageSize: 5 }}
                scroll={{ x: "max-content" }} // Cho phép cuộn ngang nếu cần
              />
            )}
          </TabPane>
          <TabPane
            tab={
              <span className="flex items-center">
                <TransactionOutlined className="mr-2" /> Lịch sử giao dịch
              </span>
            }
            key="2"
          >
            <p>Chức năng lịch sử giao dịch chưa được hỗ trợ.</p>
            {/* Placeholder cho lịch sử giao dịch */}
          </TabPane>
        </Tabs>
      </Spin>

      {/* Modal chỉnh sửa thông tin */}
      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            {" "}
            Hủy{" "}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateLoading}
            onClick={() => form.submit()}
          >
            {" "}
            Lưu thay đổi{" "}
          </Button>,
        ]}
        destroyOnClose // Reset form khi đóng modal
        maskClosable={false}
      >
        <Spin spinning={updateLoading} tip="Đang cập nhật...">
          <Form
            form={form}
            layout="vertical"
            name="update_profile_form"
            onFinish={handleUpdateProfile}
          >
            {/* Các trường giống với form đăng ký, nhưng không có password */}
            <Form.Item
              label="Họ và Tên"
              name="name"
              rules={[{ required: true, message: "Nhập họ tên!" }]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Nhập số điện thoại!" },
                {
                  pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input placeholder="09xxxxxxxx" />
            </Form.Item>
            <Form.Item
              label="Ngày sinh"
              name="birthday"
              rules={[{ required: true, message: "Chọn ngày sinh!" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
              />
            </Form.Item>
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Chọn giới tính!" }]}
            >
              <Radio.Group>
                {" "}
                <Radio value="male">Nam</Radio> <Radio value="female">Nữ</Radio>{" "}
              </Radio.Group>
            </Form.Item>
            {/* Có thể thêm trường cập nhật avatar nếu API hỗ trợ */}
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default ProfilePage;
