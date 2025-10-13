import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getProgressForLandscape } from "../../api/progressApi";
import ProgressPostCard from "../ProgressPostCard";
import { PlusCircle } from "lucide-react";
import LandscaperNavbar from "../LandscaperNavbar"; 

const AddProgressPage = () => {
  // Get the specific landscape project ID from the URL
  const { landscapeId } = useParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      // Ensure we have an ID before fetching
      if (!landscapeId) {
        setError("No landscape project ID provided.");
        setIsLoading(false);
        return;
      }
      try {
        // Fetch posts specifically for this landscape project
        const data = await getProgressForLandscape(landscapeId);
        setPosts(data);
      } catch (err) {
        setError("Failed to fetch progress posts for this project.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [landscapeId]); // Re-run the fetch if the landscapeId in the URL changes

  return (
    <>
    <LandscaperNavbar />
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project Progress Feed
          </h1>

          {/* This link now dynamically points to the create page for the current project */}
          <Link
            to={`/createprogress/${landscapeId}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-transform hover:scale-105"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Progress
          </Link>
        </div>

        {/* --- UI Feedback Section --- */}
        {isLoading && (
          <p className="text-center text-gray-600">Loading posts...</p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!isLoading && !error && (
          <div className="space-y-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <ProgressPostCard key={post._id} post={post} />
              ))
            ) : (
              <p className="text-center text-gray-500 bg-white p-6 rounded-lg shadow-sm">
                No progress has been posted for this project yet. Click the
                button above to get started!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AddProgressPage;
