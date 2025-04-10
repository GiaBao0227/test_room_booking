import React, { useState, useEffect, forwardRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LocationList from "../../../HomeTemplate/LocationList/index";
import {
  selectIsUserLoggedIn,
  selectUserData,
  logout,
} from "../../../HomeTemplate/Login/slice";
import {
  fetchLocations,
  setSelectedLocation,
} from "../../../HomeTemplate/LocationList/slice";
// import { Button, Avatar, Dropdown, Menu, Space } from "antd";
// import {
//   UserOutlined,
//   LogoutOutlined,
//   HistoryOutlined,
// } from "@ant-design/icons";
import { FiSearch, FiUser } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  slugifyWithoutDash,
  slugifyWithDash,
} from "./../../../../utils/slugify";
import {
  Button,
  Avatar,
  Dropdown,
  Menu,
  Space,
  Popover,
  InputNumber,
  Divider,
  message,
  Spin,
  Typography,
} from "antd"; // Thêm Typography nếu cần Title/Text
import {
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
  GlobalOutlined,
  MenuOutlined,
  SearchOutlined,
} from "@ant-design/icons";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsUserLoggedIn);
  const userData = useSelector(selectUserData);

  const { locations } = useSelector((state) => state.locationListReducer);
  const [activeTab, setActiveTab] = useState("chothue");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const selectedLocation = useSelector(
    (state) => state.locationListReducer.selectedLocation
  );
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (selectedLocation) {
      setSelectedLocationId(selectedLocation.id);
    } else {
      setSelectedLocationId(null);
    }
  }, [selectedLocation]);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleGuestChange(type, value) {
    setGuests((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + value) }));
  }

  function totalGuests() {
    const { adults, children, infants, pets } = guests;
    let display = [];
    if (adults) {
      display.push(`${adults} người lớn`);
    }
    if (children) {
      display.push(`${children} trẻ em`);
    }
    if (infants) {
      display.push(`${infants} em bé`);
    }
    if (pets) {
      display.push(`${pets} thú cưng`);
    }

    return display.join(", ") || "Thêm khách";
  }

  const handleSearch = () => {
    if (selectedLocation && selectedLocation.tinhThanh) {
      const tinhThanhSlug = slugifyWithoutDash(selectedLocation.tinhThanh); // Tạo slug không dấu
      navigate(`/roomLocation/${tinhThanhSlug}`);
    } else {
      alert("Vui lòng chọn địa điểm!");
    }
  };

  const limitedLocations = locations.slice(0, 8);

  // GuestPicker Component (Inline)
  function GuestPicker({ guests, handleGuestChange }) {
    return (
      <div>
        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <p className="font-semibold">Người lớn</p>
            <p className="text-gray-500 text-sm">Từ 13 tuổi trở lên</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => handleGuestChange("adults", -1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center"
            >
              -
            </button>
            <span className="px-4">{guests.adults}</span>
            <button
              onClick={() => handleGuestChange("adults", 1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <p className="font-semibold">Trẻ em</p>
            <p className="text-gray-500 text-sm">Độ tuổi 2 - 12</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => handleGuestChange("children", -1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center"
            >
              -
            </button>
            <span className="px-4">{guests.children}</span>
            <button
              onClick={() => handleGuestChange("children", 1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <p className="font-semibold">Em bé</p>
            <p className="text-gray-500 text-sm">Dưới 2 tuổi</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => handleGuestChange("infants", -1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center"
            >
              -
            </button>
            <span className="px-4">{guests.infants}</span>
            <button
              onClick={() => handleGuestChange("infants", 1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="font-semibold">Thú cưng</p>
            <p className="text-gray-500 text-sm">
              <a href="#">Bạn sẽ mang theo động vật phục vụ?</a>
            </p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => handleGuestChange("pets", -1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center"
            >
              -
            </button>
            <span className="px-4">{guests.pets}</span>
            <button
              onClick={() => handleGuestChange("pets", 1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Custom Input Component
  const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <button
      className="text-sm font-medium text-left"
      onClick={onClick}
      ref={ref}
    >
      {value || "Thêm ngày"}
    </button>
  ));

  const locationSlugWithoutDash = selectedLocation
    ? slugifyWithoutDash(selectedLocation.tinhThanh)
    : "";

  const handleLogout = () => {
    dispatch(logout());
    // Có thể thêm message.info ở đây nếu muốn
    navigate("/"); // Chuyển về trang chủ sau khi logout
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="greeting"
        disabled
        style={{
          cursor: "default",
          fontWeight: "bold",
          color: "rgba(0, 0, 0, 0.85)",
        }}
      >
        Xin chào, {userData?.name || userData?.email || "bạn"}!
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Thông tin tài khoản</Link>
      </Menu.Item>
      {/* <Menu.Item key="history" icon={<HistoryOutlined />}><Link to="/profile">Lịch sử đặt phòng</Link></Menu.Item> */}
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        danger
      >
        {" "}
        Đăng xuất{" "}
      </Menu.Item>
    </Menu>
  );

  // Menu cho Dropdown Guest (Khi chưa đăng nhập)
  const guestMenu = (
    <Menu>
      <Menu.Item key="login" style={{ fontWeight: "600" }}>
        {" "}
        <Link to="/login">Đăng nhập</Link>{" "}
      </Menu.Item>
      <Menu.Item key="register">
        {" "}
        <Link to="/register">Đăng ký</Link>{" "}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="host">Trở thành chủ nhà</Menu.Item>
      <Menu.Item key="help">Trợ giúp</Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="p-4 container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/">
            <img
              src="https://i.pinimg.com/originals/56/5c/2a/565c2a824c7c184e326c751a0fb7e73e.png"
              alt="Airbnb"
              className="h-8"
            />
            <h1 className="text-red-500 text-2xl font-bold">airbnb</h1>
          </Link>
        </div>

        {/* Navbar */}
        <nav className="hidden md:flex space-x-4 flex-grow justify-center">
          <button
            className={`font-semibold ${
              activeTab === "chothue"
                ? "text-black border-b-2 border-black"
                : "text-gray-500"
            } hover:text-black`}
            onClick={() => setActiveTab("chothue")}
          >
            Chỗ ở
          </button>
          <button
            className={`font-semibold ${
              activeTab === "trainghiem"
                ? "text-black border-b-2 border-black"
                : "text-gray-500"
            } hover:text-black`}
            onClick={() => setActiveTab("trainghiem")}
          >
            Trải nghiệm
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoggedIn && userData ? (
            // Đã đăng nhập: Hiển thị Dropdown với Avatar và tên
            <Dropdown overlay={menu} placement="bottomRight">
              <Space className="cursor-pointer">
                <Avatar src={userData.avatar} icon={<UserOutlined />} />
                <span className="hidden md:inline font-medium">
                  {userData.name || userData.email}
                </span>
              </Space>
            </Dropdown>
          ) : (
            // Chưa đăng nhập: Hiển thị nút Đăng nhập/Đăng ký
            <>
              <Link to="/login">
                <Button type="default">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button type="primary" danger>
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => toggleDropdown("userMenu")}
                className="flex items-center"
              >
                <FiUser size={24} className="mr-2" />
              </button>

              {activeDropdown === "userMenu" && (
                <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md overflow-hidden z-10">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    to="/logout"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {isLargeScreen ? (
        <div className="flex justify-center pb-4">
          <div className="flex items-center bg-white rounded-full shadow-md px-4 border border-gray-200">
            {/* Địa chỉ */}
            <div className="relative px-4 py-2 flex flex-col text-left border-r border-gray-200">
              <span className="text-xs font-semibold text-gray-500">
                Địa chỉ
              </span>
              <button
                onClick={() => toggleDropdown("location")}
                className="text-sm font-medium text-left"
              >
                {selectedLocation ? selectedLocation.tinhThanh : "Hồ Chí Minh"}
              </button>
              {activeDropdown === "location" && (
                <div className="absolute top-full left-0 mt-2 w-68 bg-white shadow-lg rounded p-2 z-10">
                  <LocationList locations={limitedLocations} />
                </div>
              )}
            </div>

            {/* Ngày nhận & trả phòng */}
            <div className="relative px-4 py-2 flex flex-col text-left border-r border-gray-200">
              <span className="text-xs font-semibold text-gray-500">
                Nhận phòng
              </span>
              <DatePicker
                selected={checkInDate}
                onChange={(date) => setCheckInDate(date)}
                placeholderText={
                  checkInDate ? checkInDate.toLocaleDateString() : "Thêm ngày"
                }
                className="text-sm font-medium text-left focus:outline-none"
                customInput={<CustomDateInput />}
              />
            </div>
            <div className="relative px-4 py-2 flex flex-col text-left border-r border-gray-200">
              <span className="text-xs font-semibold text-gray-500">
                Trả phòng
              </span>
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                placeholderText={
                  checkOutDate ? checkOutDate.toLocaleDateString() : "Thêm ngày"
                }
                className="text-sm font-medium text-left focus:outline-none"
                customInput={<CustomDateInput />}
              />
            </div>

            {/* Khách */}
            <div className="relative px-4 py-2 flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-500">Khách</span>
              <button
                onClick={() => toggleDropdown("guest")}
                className="text-sm font-medium text-left"
              >
                {totalGuests()}
              </button>
              {activeDropdown === "guest" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white shadow-lg rounded-xl p-4 z-10">
                  <GuestPicker
                    guests={guests}
                    handleGuestChange={handleGuestChange}
                  />
                </div>
              )}
            </div>

            {/* Nút Tìm kiếm */}
            <button
              onClick={handleSearch}
              className="bg-red-500 text-white rounded-full px-4 py-2 ml-2 font-semibold hover:bg-red-600 transition"
            >
              <FiSearch size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 flex bg-gray-100 rounded-lg flex-wrap justify-center">
          <input
            className="w-full p-3 rounded-md border"
            type="text"
            placeholder="Bắt đầu tìm kiếm"
          />
        </div>
      )}
    </header>
  );
}

export default Header;
