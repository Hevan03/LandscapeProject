import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Slider from "react-slick";
import { getProgressForCustomer, getProgressForLandscape } from "../../api/progressApi";
import { useAuth } from "../../context/AuthContext";
import { Square, CheckSquare, TreePine, HardHat, ChevronLeft, ChevronRight } from "lucide-react";


// Custom Arrow Components for the Slider
const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10"
  >
    <ChevronRight size={24} />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10"
  >
    <ChevronLeft size={24} />
  </button>
);

const CustomerProgressPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const { landscapeId } = useParams();
  const customerId = user?.id ?? user?._id ?? user?.userId ?? null;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (landscapeId) {
          const data = await getProgressForLandscape(landscapeId);
          setPosts(data);
        } else if (customerId) {
          const data = await getProgressForCustomer(customerId);
          setPosts(data);
        } else {
          setError("No customer or project provided.");
        }
      } catch (err) {
        setError("Failed to fetch progress updates.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [customerId, landscapeId]);

  // Settings for the image carousel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  const getImageUrl = (imagePath) => {
    return `http://localhost:5001/${imagePath.replace(/\\/g, "/")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading your project progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Your Project Progress</h1>

        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-xl overflow-hidden">
                {/*Header*/}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900">{post.name}</h2>
                  <div className="mt-4 space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <TreePine size={16} className="mr-3 text-green-600" />{" "}
                      <span>
                        Project: <strong>{post.landscapeId.name}</strong>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <HardHat size={16} className="mr-3 text-green-600" />{" "}
                      <span>
                        Handled by: <strong>{post.landscaperId.name}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/*Image Carousel*/}
                {post.images && post.images.length > 0 && (
                  <div className="w-full bg-black">
                    <Slider {...sliderSettings}>
                      {post.images.map((image, index) => (
                        <div key={index}>
                          <img src={getImageUrl(image)} alt={`${post.name} - view ${index + 1}`} className="w-full h-[500px] object-contain" />
                        </div>
                      ))}
                    </Slider>
                  </div>
                )}

                {/*Description*/}
                {post.description && (
                  <div className="p-6 border-t border-gray-200">
                    <p className="text-gray-700 text-base whitespace-pre-wrap">{post.description}</p>
                  </div>
                )}

                {/*Tasks & Progress*/}
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Tasks Checklist</h3>
                  <ul className="space-y-3 mb-6">
                    {post.tasks.map((task, index) => (
                      <li key={index} className="flex items-center">
                        {task.completed ? <CheckSquare size={20} className="text-green-600" /> : <Square size={20} className="text-gray-400" />}
                        <span className={`ml-3 text-base ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}>{task.name}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Overall Progress</h3>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-green-600 h-6 flex items-center justify-center text-sm font-medium text-white"
                      style={{ width: `${post.percentage}%` }}
                    >
                      {post.percentage}%
                    </div>
                  </div>
                </div>

                {/*Timestamps*/}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right">
                  <p className="text-xs text-gray-500">Last updated: {formatDate(post.updatedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 bg-white p-6 rounded-lg shadow-sm">No progress updates have been posted for your projects yet.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerProgressPage;
