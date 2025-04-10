import React, { useEffect, useState } from "react";
import Header from "../_Component/Header/index";
import Footer from "../_Component/Footer/index";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles

import HomeImage from "../../../assets/Home.png";
import BeachImage from "../../../assets/Beach.png";
import HillImage from "../../../assets/Hill.png";
import DogImage from "../../../assets/Dog.png";

function HomePage() {
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNearbyLocations = async () => {
      try {
        const response = await api.get(
          "/vi-tri/phan-trang-tim-kiem?pageIndex=1&pageSize=8"
        );
        setNearbyLocations(response.data.content.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu địa điểm gần đây:", error);
      }
    };

    fetchNearbyLocations();
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 800, // values from 0 to 3000, with step 50ms
    });
  }, []);

  const travelTimes = {
    1: "15 phút lái xe",
    2: "3 giờ lái xe",
    3: "6.5 giờ lái xe",
    4: "15 phút lái xe",
    5: "7.5 giờ lái xe",
    6: "45 phút lái xe",
    7: "30 phút lái xe",
    8: "5 giờ lái xe",
  };

  const stayAnywhereItems = [
    {
      id: 1,
      image: HomeImage,
      title: "Toàn bộ nhà",
      link: "roomLocation/hồchíminh",
    },
    {
      id: 2,
      image: BeachImage,
      title: "Chỗ ở độc đáo",
      link: "/rooms/nha-trang",
    },
    {
      id: 3,
      image: HillImage,
      title: "Trang trại và thiên nhiên",
      link: "/rooms/da-lat",
    },
    {
      id: 4,
      image: DogImage,
      title: "Cho phép mang thú cưng",
      link: "/rooms/da-nang",
    },
  ];

  return (
    <div className="bg-white">
      <section className="hero bg-gray-100 py-12">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">
            Nhà ở, trải nghiệm và nhiều hơn nữa
          </h1>
          <p className="text-gray-700">
            Khám phá những điều mới mẻ ngay hôm nay
          </p>
        </div>
      </section>

      {/* Khám phá những điểm đến gần đây */}
      <section className="nearby-locations py-8">
        <div className="container mx-auto">
          <h2 className="text-2xl font-semibold mb-4">
            Khám phá những điểm đến gần đây
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nearbyLocations.map((location) => (
              <div
                key={location.id}
                className="location-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer flex items-center border border-gray-200"
                // onClick={() => navigate(`/roomLocation?maViTri=${location.id}`)}
              >
                <div className="mx-3 my-3 w-12 h-12 flex-shrink-0">
                  <img
                    src={location.hinhAnh}
                    alt={location.tenViTri}
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium">{location.tinhThanh}</h3>
                  <p className="text-xs text-gray-500">
                    {travelTimes[location.id] || "Thời gian di chuyển"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ở bất cứ đâu */}
      <section className="stay-anywhere py-8 rounded-xl">
        <div className="container mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Ở bất cứ đâu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-9">
            {stayAnywhereItems.map((item) => (
              <a
                key={item.id}
                href={item.link}
                data-aos="flip-left"
                className="flex flex-col items-center shadow-sm hover:shadow-lg transition-shadow transition-transform transform hover:scale-105 rounded-xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-50 h-50 object-cover rounded-xl"
                />
                <h3 className="text-sm font-medium mx-2 my-5 text-center object-cover">
                  {item.title}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
