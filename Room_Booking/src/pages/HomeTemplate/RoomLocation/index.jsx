import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoomsLocation } from "./slice";
import { useNavigate, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { slugifyWithoutDash } from "../../../utils/slugify";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const RoomLocation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tinhThanh } = useParams();

  const {
    list: rooms,
    loading: roomLoading,
    error: roomError,
  } = useSelector((state) => state.roomLocationReducer);

  const {
    locations,
    loading: locationLoading,
    error: locationError,
  } = useSelector((state) => state.locationListReducer);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const defaultCenter = [10.762622, 106.660172]; // Tọa độ mặc định (Ví dụ: TP.HCM - bạn có thể thay đổi)
  const defaultZoom = 12;

  // --- Logic tìm vị trí và lấy thông tin ---
  const selectedLocationData = useMemo(() => {
    // Giá trị mặc định ban đầu
    let result = { maViTri: null, cityName: tinhThanh, center: defaultCenter };

    if (locations && locations.length > 0 && tinhThanh) {
      const slugParam = tinhThanh.toLowerCase();
      const foundLocation = locations.find(
        (loc) =>
          loc.tinhThanh &&
          slugifyWithoutDash(loc.tinhThanh).toLowerCase() === slugParam
      );

      if (foundLocation) {
        // ----- !!! QUAN TRỌNG: THAY THẾ TÊN THUỘC TÍNH Ở ĐÂY !!! -----
        // Kiểm tra xem API địa điểm của bạn dùng tên gì cho vĩ độ và kinh độ.
        // Ví dụ: nếu API dùng 'viDo' và 'kinhDo', hãy thay thế 'latitude' và 'longitude' bên dưới.
        const locationLatProp = "latitude"; // <-- THAY THẾ 'latitude' NẾU CẦN
        const locationLngProp = "longitude"; // <-- THAY THẾ 'longitude' NẾU CẦN

        const lat = foundLocation[locationLatProp];
        const lng = foundLocation[locationLngProp];

        const centerCoordinates =
          typeof lat === "number" && typeof lng === "number"
            ? [lat, lng]
            : defaultCenter;

        if (
          centerCoordinates === defaultCenter &&
          (typeof lat !== "number" || typeof lng !== "number")
        ) {
          console.warn(
            `LOCATION API: Không tìm thấy tọa độ hợp lệ (kiểu số) cho ${foundLocation.tinhThanh} (ID: ${foundLocation.id}) bằng thuộc tính '${locationLatProp}' (${lat}) và '${locationLngProp}' (${lng}). Sử dụng tọa độ mặc định.`
          );
        }

        result = {
          maViTri: foundLocation.id,
          cityName: foundLocation.tinhThanh,
          center: centerCoordinates,
        };
      } else {
        console.warn(
          `Không tìm thấy vị trí trong danh sách locations khớp với slug "${tinhThanh}". Sử dụng giá trị mặc định.`
        );
        // Giữ giá trị mặc định đã khởi tạo ở trên
      }
    } else if (!tinhThanh) {
      console.warn("Tham số 'tinhThanh' từ URL bị thiếu.");
      // Giữ giá trị mặc định
    } else if (
      locationLoading === "succeeded" &&
      (!locations || locations.length === 0)
    ) {
      console.warn("Danh sách 'locations' từ reducer rỗng sau khi tải xong.");
      // Giữ giá trị mặc định
    }
    // Nếu đang loading hoặc có lỗi thì cũng trả về giá trị mặc định tạm thời

    return result;
  }, [locations, locationLoading, tinhThanh, defaultCenter]); // Thêm locationLoading để đảm bảo tính toán lại khi locations có

  const { maViTri, cityName, center } = selectedLocationData;

  // --- Effect để fetch phòng theo maViTri ---
  useEffect(() => {
    if (maViTri !== null) {
      // Chỉ fetch khi tìm thấy maViTri hợp lệ
      console.log(`Fetching rooms for maViTri: ${maViTri}`);
      dispatch(fetchRoomsLocation(maViTri));
    } else if (locationLoading === "succeeded") {
      // Chỉ log khi location đã load xong mà vẫn ko có maViTri
      console.log("maViTri is null, not fetching rooms.");
      // Có thể dispatch action để xóa danh sách phòng cũ nếu cần
      // dispatch(clearRoomsAction());
    }
  }, [dispatch, maViTri, locationLoading]); // Thêm locationLoading để đảm bảo maViTri đã được tính toán cuối cùng

  // --- Effect để quản lý bản đồ ---
  useEffect(() => {
    // Chỉ thực thi khi container đã render và location *không* còn đang tải
    // (để đảm bảo 'center' đã được tính toán với dữ liệu locations mới nhất)
    if (!mapContainer.current || locationLoading === "loading") {
      return;
    }

    // Khởi tạo bản đồ nếu chưa có
    if (!mapRef.current) {
      console.log("Initializing map with center:", center);
      mapRef.current = L.map(mapContainer.current).setView(center, defaultZoom);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    } else {
      // Chỉ cập nhật view nếu 'center' thực sự thay đổi
      const currentCenter = mapRef.current.getCenter();
      const currentZoom = mapRef.current.getZoom();
      // So sánh tọa độ (cần xử lý sai số nhỏ của số thực nếu cần)
      const centerChanged =
        Math.abs(currentCenter.lat - center[0]) > 1e-6 ||
        Math.abs(currentCenter.lng - center[1]) > 1e-6;
      const zoomChanged = currentZoom !== defaultZoom;

      if (centerChanged || zoomChanged) {
        console.log(
          "Updating map view to center:",
          center,
          "Zoom:",
          defaultZoom
        );
        // mapRef.current.setView(center, defaultZoom); // Bay tới vị trí mới mượt hơn
        mapRef.current.flyTo(center, defaultZoom);
      }
    }

    // Logic hiển thị marker (chạy khi phòng load xong *và* bản đồ sẵn sàng)
    if (roomLoading === "succeeded" && mapRef.current) {
      console.log("Rendering markers for rooms:", rooms);
      clearMarkers(mapRef.current); // Xóa marker cũ trước
      renderMarkers(rooms, mapRef.current); // Vẽ marker mới
    } else if (mapRef.current) {
      // Nếu phòng đang tải hoặc lỗi, hoặc chưa có phòng, đảm bảo xóa marker cũ
      clearMarkers(mapRef.current);
    }
  }, [center, defaultZoom, rooms, roomLoading, locationLoading]); // Bỏ navigate nếu không dùng trong effect này

  // Hàm cleanup khi component unmount hoàn toàn
  useEffect(() => {
    const map = mapRef.current; // Lưu trữ tham chiếu hiện tại
    return () => {
      if (map) {
        // Sử dụng tham chiếu đã lưu
        console.log("Component unmounting, removing map instance.");
        map.remove();
        // Không cần gán mapRef.current = null ở đây vì component sắp unmount
      }
      // Reset lại ref khi unmount để lần sau vào lại sẽ khởi tạo mới
      mapRef.current = null;
    };
  }, []); // Chạy một lần duy nhất khi unmount

  // --- Các hàm helper cho bản đồ ---
  const clearMarkers = (map) => {
    if (!map) return;
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
  };

  const renderMarkers = (roomsToRender, map) => {
    if (!map || !roomsToRender) return;
    console.log(`Attempting to render ${roomsToRender.length} markers.`);

    // ----- !!! QUAN TRỌNG: THAY THẾ TÊN THUỘC TÍNH Ở ĐÂY !!! -----
    // Kiểm tra xem API phòng của bạn dùng tên gì cho vĩ độ và kinh độ.
    // Ví dụ: nếu API dùng 'viDoPhong' và 'kinhDoPhong', hãy thay thế 'latitude' và 'longitude'.
    const roomLatProp = "latitude"; // <-- THAY THẾ 'latitude' NẾU CẦN
    const roomLngProp = "longitude"; // <-- THAY THẾ 'longitude' NẾU CẦN

    roomsToRender.forEach((room) => {
      const lat = room[roomLatProp];
      const lng = room[roomLngProp];

      if (typeof lat === "number" && typeof lng === "number") {
        try {
          const marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(
            `<h3>${
              room.tenPhong || "Chưa có tên"
            }</h3><p style="max-width: 200px; white-space: normal;">${
              // Giới hạn chiều rộng popup
              room.moTa || "Không có mô tả"
            }</p><p><b>${
              room.giaTien != null
                ? room.giaTien.toLocaleString("vi-VN") + " đ/đêm"
                : "Liên hệ giá"
            }</b></p>`
          );
        } catch (e) {
          console.error(
            `Lỗi khi tạo marker cho phòng ${room.id} tại [${lat}, ${lng}]:`,
            e
          );
        }
      } else {
        console.warn(
          `ROOM API: Tọa độ không hợp lệ (kiểu số) cho phòng ${room.id} (${room.tenPhong}) bằng thuộc tính '${roomLatProp}' (${lat}) và '${roomLngProp}' (${lng})`
        );
      }
    });
  };

  const handleDetail = (roomId) => {
    navigate(`/detailroom/${roomId}`);
  };

  // --- Phần Render ---
  if (locationLoading === "loading") {
    return <div className="p-4">Đang tải danh sách địa điểm...</div>;
  }

  if (locationError) {
    return (
      <div className="p-4 text-red-500">
        Lỗi tải danh sách địa điểm: {locationError}
      </div>
    );
  }

  // Quan trọng: Kiểm tra locations sau khi loading xong
  if (!locations || locations.length === 0) {
    return (
      <div className="p-4">
        Không có dữ liệu địa điểm. Vui lòng thử lại sau.
      </div>
    );
  }

  // Nếu không tìm thấy vị trí khớp với URL slug (sau khi đã load xong location)
  if (maViTri === null && locationLoading === "succeeded") {
    return (
      <div className="p-4">
        Không tìm thấy thông tin cho địa điểm "{tinhThanh}". Vui lòng kiểm tra
        lại đường dẫn hoặc chọn địa điểm khác.
      </div>
    );
  }

  return (
    <div className="room-location p-4">
      <h2 className="text-2xl font-semibold mb-5">
        Chỗ ở tại {cityName || tinhThanh}
      </h2>{" "}
      {/* Hiển thị tên từ URL nếu chưa có cityName */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {" "}
        {/* Thay đổi grid và gap */}
        {/* Danh sách phòng */}
        <div className="room-list flex flex-col gap-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
          {" "}
          {/* Thêm class scrollbar tùy chỉnh nếu có */}
          {/* Trạng thái loading phòng */}
          {roomLoading === "loading" &&
            // Hiển thị nhiều skeleton hơn cho đẹp
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg shadow bg-white animate-pulse"
              >
                <div className="w-full h-48 md:h-60 rounded-lg mb-3 bg-gray-300"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          {/* Trạng thái lỗi tải phòng */}
          {roomLoading === "failed" && (
            <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-700">
              <p className="font-semibold">Lỗi tải danh sách phòng:</p>
              <p>{roomError}</p>
            </div>
          )}
          {/* Trạng thái thành công nhưng không có phòng */}
          {roomLoading === "succeeded" && rooms.length === 0 && (
            <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-700">
              <p>Không tìm thấy phòng nào phù hợp tại địa điểm này.</p>
            </div>
          )}
          {/* Hiển thị danh sách phòng */}
          {roomLoading === "succeeded" &&
            rooms.map((room) => (
              <div
                key={room.id}
                className="border p-4 rounded-lg shadow hover:shadow-xl transition duration-200 cursor-pointer bg-white flex flex-col sm:flex-row gap-4" // Layout flex cho màn hình nhỏ
                onClick={() => handleDetail(room.id)}
              >
                <img
                  src={room.hinhAnh || "/placeholder-image.png"} // Sử dụng ảnh placeholder cục bộ nếu có
                  alt={room.tenPhong || "Hình ảnh phòng"}
                  className="w-full sm:w-1/3 h-48 sm:h-auto object-cover rounded-lg bg-gray-200 flex-shrink-0" // Kích thước ảnh cố định hơn trên màn nhỏ
                  onError={(e) => {
                    e.target.onerror = null; // Ngăn lặp lỗi
                    e.target.src = "/placeholder-image-error.png"; // Ảnh báo lỗi cục bộ
                  }}
                />
                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <h3
                      className="text-lg font-semibold mb-1 line-clamp-2" // Cho phép 2 dòng tên phòng
                      title={room.tenPhong}
                    >
                      {room.tenPhong || "Phòng chưa đặt tên"}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                      {" "}
                      {/* Cho phép 3 dòng mô tả */}
                      {room.moTa || "Không có mô tả chi tiết."}
                    </p>
                  </div>
                  <span className="text-lg font-bold mt-1 text-red-600">
                    {" "}
                    {/* Giá nổi bật hơn */}
                    {room.giaTien != null
                      ? `${room.giaTien.toLocaleString("vi-VN")} đ/đêm`
                      : "Liên hệ giá"}
                  </span>
                </div>
              </div>
            ))}
        </div>
        {/* Phần bản đồ */}
        {/* Sử dụng sticky để map cố định khi cuộn danh sách phòng */}
        <div className="map-wrapper lg:sticky top-[80px] h-[50vh] lg:h-[calc(100vh-100px)] rounded-lg overflow-hidden shadow-lg border">
          <div
            ref={mapContainer}
            className="map-container w-full h-full" // Đảm bảo map chiếm đủ không gian
            // Thêm aria-label cho khả năng tiếp cận
            aria-label={`Bản đồ vị trí các phòng tại ${cityName || tinhThanh}`}
          />
          {/* Có thể thêm lớp phủ loading trên bản đồ nếu muốn */}
          {/* {roomLoading === 'loading' && (
                 <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                     <p>Đang tải dữ liệu bản đồ...</p>
                 </div>
             )} */}
        </div>
      </div>
    </div>
  );
};

export default RoomLocation;
