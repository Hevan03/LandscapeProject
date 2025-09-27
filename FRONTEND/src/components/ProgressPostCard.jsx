import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Custom Arrow 
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-arrow`}
      style={{ ...style, display: 'block', right: '10px' }}
      onClick={onClick}
    >
      <ChevronRight color="white" />
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-arrow`}
      style={{ ...style, display: 'block', left: '10px', zIndex: 1 }}
      onClick={onClick}
    >
      <ChevronLeft color="white" />
    </div>
  );
};


const ProgressPostCard = ({ post }) => {
  // Settings image slide
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,  
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  
  const getImageUrl = (imagePath) => {
    return `http://localhost:5001/${imagePath.replace(/\\/g, '/')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md max-w-lg mx-auto overflow-hidden">
      {/*Post Header*/}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">{post.name}</h2>
        <p className="text-sm text-gray-500">Project: {post.landscapeId?.name}</p>
      </div>

      {/*Image Slide*/}
      {post.images && post.images.length > 0 && (
        <Slider {...sliderSettings}>
          {post.images.map((image, index) => (
            <div key={index}>
              <img 
                src={getImageUrl(image)} 
                alt={`${post.name} - view ${index + 1}`} 
                className="w-full h-80 object-cover"
              />
            </div>
          ))}
        </Slider>
      )}

      {/* Post Actions*/}
      <div className="p-4 text-center mt-4">
        <Link
          to={`/landscaperprogress/${post._id}`}
          className="w-full block bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          See More
        </Link>
      </div>
    </div>
  );
};

export default ProgressPostCard;
