import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { getProgressById, deleteProgress } from '../api/progressApi';
import { 
  Square, 
  CheckSquare, 
  User, 
  TreePine, 
  HardHat,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2
} from 'lucide-react';

// Arrow navigate to next image
const NextArrow = ({ onClick }) => (
  <button onClick={onClick} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10">
    <ChevronRight size={24} />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button onClick={onClick} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10">
    <ChevronLeft size={24} />
  </button>
);

const LandscaperProgressPage = () => {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getProgressById(id);
        setPost(data);
      } catch (err) {
        setError('Failed to fetch the progress post. It may have been deleted or the link is incorrect.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]); 

  // delete handler
  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this progress post? This action cannot be undone.'
    );

    if (isConfirmed) {
      try {
        await deleteProgress(id);

        toast.success('Progress post deleted successfully.');
        setTimeout(() => {navigate(`/addprogress/${post.landscapeId._id}`);}, 2000); 
      
      } catch (err) {
        console.error('Failed to delete post:', err);
        toast.error('Failed to delete the post. Please try again.');
      }
    }
  };

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
    return `http://localhost:5001/${imagePath.replace(/\\/g, '/')}`;
  };

  // Helper to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading progress details...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  }

  if (!post) {
    return <div className="flex justify-center items-center h-screen"><p>Post not found.</p></div>;
  }



  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        
        {/*Header*/}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{post.name}</h1>
          <div className="mt-4 space-y-2 text-gray-600">
            <div className="flex items-center"><TreePine size={16} className="mr-3 text-green-600" /> <span>Project: <strong>{post.landscapeId.name}</strong></span></div>
            <div className="flex items-center"><User size={16} className="mr-3 text-green-600" /> <span>Customer: <strong>{post.customerId.name}</strong></span></div>
            <div className="flex items-center"><HardHat size={16} className="mr-3 text-green-600" /> <span>Landscaper: <strong>{post.landscaperId.name}</strong></span></div>
          </div>
        </div>

        {/*Image Carousel*/}
        {post.images && post.images.length > 0 && (
          <div className="w-full bg-black">
            <Slider {...sliderSettings}>
              {post.images.map((image, index) => (
                <div key={index}>
                  <img
                    src={getImageUrl(image)}
                    alt={`${post.name} - view ${index + 1}`}
                    className="w-full h-[500px] object-contain"
                  />
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
        
        {/*Tasks  Progress*/}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Tasks Checklist</h3>
          <ul className="space-y-3 mb-6">
            {post.tasks.map((task, index) => (
              <li key={index} className="flex items-center">
                {task.completed ? 
                  <CheckSquare size={20} className="text-green-600" /> : 
                  <Square size={20} className="text-gray-400" />
                }
                <span className={`ml-3 text-base ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.name}
                </span>
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
        <div className="px-6 py-4 border-t border-gray-200 text-right">
          <p className="text-xs text-gray-500">Created on: {formatDate(post.createdAt)}</p>
          {post.createdAt !== post.updatedAt && (
             <p className="text-xs text-gray-500 mt-1">Last updated: {formatDate(post.updatedAt)}</p>
          )}
        </div>

        {/*Update Button*/}
        <div className="p-6 bg-gray-50 border-t border-t-gray-200">
            <Link 
              to={`/updateprogress/${post._id}`}
              className="w-full flex items-center justify-center py-3 px-4 bg-gray-800 text-white font-bold rounded-lg shadow-md hover:bg-black transition-colors"
            >
                <Edit size={18} className="mr-2"/>
                Update Progress Post
            </Link>
             {/*UPDATE: Add the delete button */}
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center mt-4 py-2 px-4 text-red-600 font-semibold hover:text-red-800 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Progress Post
            </button>
        </div>
        

      </div>
    </div>
  );
};

export default LandscaperProgressPage;

