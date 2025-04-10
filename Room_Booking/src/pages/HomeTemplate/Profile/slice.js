import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../services/api";

import { message } from "antd";
import { logout, updateLoginUser } from "../Login/slice"; // Import updateLoginUser để đồng bộ tên/email nếu sửa

// Thunk: Lấy thông tin chi tiết user bằng ID
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (userId, { rejectWithValue, dispatch }) => {
    if (!userId) return rejectWithValue({ message: "User ID is required." }); // Cần userId
    try {
      const response = await api.get(`/users/${userId}`); // API GET /api/users/{id}
      if (response.data.statusCode === 200 && response.data.content) {
        return response.data.content; // Trả về user detail object
      } else {
        return rejectWithValue({
          message:
            response.data.content || "Không thể lấy thông tin người dùng.",
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.content ||
        error.message ||
        "Lỗi tải thông tin cá nhân.";
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (typeof logout === "function") dispatch(logout());
        return rejectWithValue({
          message: "Phiên đăng nhập hết hạn.",
          status: error.response.status,
        });
      }
      return rejectWithValue({ message: msg });
    }
  }
);

// Thunk: Cập nhật thông tin user bằng ID
export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async ({ userId, userData }, { rejectWithValue, dispatch }) => {
    // userData là object chứa các field cần update
    if (!userId || !userData)
      return rejectWithValue({ message: "User ID and data are required." });
    try {
      // API PUT /api/users/{id} yêu cầu các trường tương tự signup
      const response = await api.put(`/users/${userId}`, userData);
      if (response.data.statusCode === 200 && response.data.content) {
        // Cập nhật thành công, trả về thông tin user mới nhất
        message.success("Cập nhật thông tin thành công!");
        // Đồng bộ thông tin user trong login state (ví dụ: tên, email)
        if (typeof updateLoginUser === "function") {
          dispatch(
            updateLoginUser({
              name: response.data.content.name, // Cập nhật name trong login state
              email: response.data.content.email, // Cập nhật email nếu có thay đổi
              // Cập nhật các trường khác nếu cần đồng bộ
            })
          );
        }
        return response.data.content;
      } else {
        return rejectWithValue({
          message: response.data.content || "Cập nhật thất bại.",
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.content ||
        error.message ||
        "Lỗi khi cập nhật thông tin.";
      message.error(msg); // Hiển thị lỗi
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (typeof logout === "function") dispatch(logout());
        return rejectWithValue({
          message: "Phiên đăng nhập hết hạn.",
          status: error.response.status,
        });
      }
      return rejectWithValue({ message: msg });
    }
  }
);

// Thunk: Lấy lịch sử đặt phòng của user bằng Mã người dùng (user ID)
export const fetchUserBookingHistory = createAsyncThunk(
  "profile/fetchUserBookingHistory",
  async (userId, { rejectWithValue, dispatch }) => {
    if (!userId) return rejectWithValue({ message: "User ID is required." });
    try {
      // API GET /api/dat-phong/lay-theo-nguoi-dung/{MaNguoiDung}
      const response = await api.get(
        `/dat-phong/lay-theo-nguoi-dung/${userId}`
      );
      if (
        response.data.statusCode === 200 &&
        Array.isArray(response.data.content)
      ) {
        return response.data.content; // Trả về mảng lịch sử đặt phòng
      } else if (
        response.data.statusCode === 404 ||
        response.data.message?.toLowerCase().includes("không tìm thấy")
      ) {
        return []; // Trả về mảng rỗng nếu không có lịch sử
      } else {
        return rejectWithValue({
          message: response.data.content || "Không thể lấy lịch sử đặt phòng.",
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.content ||
        error.message ||
        "Lỗi tải lịch sử đặt phòng.";
      if (error.response?.status === 404) return []; // Trả về mảng rỗng nếu 404
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (typeof logout === "function") dispatch(logout());
        return rejectWithValue({
          message: "Phiên đăng nhập hết hạn.",
          status: error.response.status,
        });
      }
      return rejectWithValue({ message: msg });
    }
  }
);

// --- Initial State ---
const initialState = {
  profileData: null,
  loadingProfile: false,
  errorProfile: null,
  bookingHistory: [],
  loadingHistory: false,
  errorHistory: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false, // Thêm cờ báo thành công
};

// --- Slice Definition ---
const profileSlice = createSlice({
  name: "profile", // Key trong store sẽ là profileReducer (theo cách viết của bạn)
  initialState,
  reducers: {
    // Reset state khi logout hoặc unmount
    clearProfileState: (state) => {
      state.profileData = null;
      state.loadingProfile = false;
      state.errorProfile = null;
      state.bookingHistory = [];
      state.loadingHistory = false;
      state.errorHistory = null;
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    // Reset trạng thái update
    clearUpdateStatus: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (s) => {
        s.loadingProfile = true;
        s.errorProfile = null;
      })
      .addCase(fetchUserProfile.fulfilled, (s, a) => {
        s.loadingProfile = false;
        s.profileData = a.payload;
      })
      .addCase(fetchUserProfile.rejected, (s, a) => {
        s.loadingProfile = false;
        if (a.payload?.status !== 401 && a.payload?.status !== 403)
          s.errorProfile = a.payload?.message;
        s.profileData = null;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (s) => {
        s.updateLoading = true;
        s.updateError = null;
        s.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (s, a) => {
        s.updateLoading = false;
        s.profileData = a.payload;
        s.updateSuccess = true;
        s.updateError = null;
      }) // Cập nhật profile data và đánh dấu thành công
      .addCase(updateUserProfile.rejected, (s, a) => {
        s.updateLoading = false;
        if (a.payload?.status !== 401 && a.payload?.status !== 403)
          s.updateError = a.payload?.message;
        s.updateSuccess = false;
      })
      // Fetch Booking History
      .addCase(fetchUserBookingHistory.pending, (s) => {
        s.loadingHistory = true;
        s.errorHistory = null;
      })
      .addCase(fetchUserBookingHistory.fulfilled, (s, a) => {
        s.loadingHistory = false;
        s.bookingHistory = a.payload || [];
      })
      .addCase(fetchUserBookingHistory.rejected, (s, a) => {
        s.loadingHistory = false;
        if (a.payload?.status !== 401 && a.payload?.status !== 403)
          s.errorHistory = a.payload?.message;
        s.bookingHistory = [];
      });
  },
});

export const { clearProfileState, clearUpdateStatus } = profileSlice.actions;
export default profileSlice.reducer;

// --- Selectors --- (Truy cập state.profileReducer)
export const selectProfileData = (state) => state.profileReducer.profileData;
export const selectProfileLoading = (state) =>
  state.profileReducer.loadingProfile;
export const selectProfileError = (state) => state.profileReducer.errorProfile;
export const selectBookingHistory = (state) =>
  state.profileReducer.bookingHistory;
export const selectHistoryLoading = (state) =>
  state.profileReducer.loadingHistory;
export const selectHistoryError = (state) => state.profileReducer.errorHistory;
export const selectUpdateProfileLoading = (state) =>
  state.profileReducer.updateLoading;
export const selectUpdateProfileError = (state) =>
  state.profileReducer.updateError;
export const selectUpdateProfileSuccess = (state) =>
  state.profileReducer.updateSuccess;
