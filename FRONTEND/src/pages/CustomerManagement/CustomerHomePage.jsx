import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import axios from "axios";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import AuthContext from "../../context/AuthContext";
import CustomerAppointmentStatus from "../../components/Customer/CustomerAppointmentStatus";

const testimonials = [
  {
    name: "Ava Thompson",
    role: "Customer",
    quote: "LeafSphere made booking a landscaper so easy! My garden looks amazing and the process was seamless.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "James Lee",
    role: "Customer",
    quote: "Professional service and great communication. Highly recommend for anyone needing landscaping work.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sophia Patel",
    role: "Customer",
    quote: "I loved the variety of specialists available. Booking and project tracking was super simple.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

const CustomerHomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [landscapers, setLandscapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLandscaper, setSelectedLandscaper] = useState(null);
  const { user } = useContext(AuthContext);

  // Track mouse position for the hero section effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    // Fetch landscapers from your API
    console.log(user);
    const fetchLandscapers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5001/api/landscaper");
        setLandscapers(response.data);
      } catch (error) {
        console.error("Failed to fetch landscapers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandscapers();
  }, []);

  return (
    <div className="bg-white">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden py-20 px-20 pt-40">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-700 to-green-800 z-0">
          {/* Animated circular overlays */}
          <div
            className="absolute top-0 left-0 w-96 h-[96] bg-green-400 rounded-full mix-blend-soft-light blur-3xl opacity-30 animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
              transition: "transform 0.5s ease-out",
            }}
          ></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-soft-light blur-3xl opacity-20 animate-pulse"
            style={{ animationDuration: "7s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-soft-light blur-3xl opacity-10 animate-pulse"
            style={{ animationDuration: "10s", animationDelay: "1s" }}
          ></div>

          {/* Dotted overlay pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-white">
              <h1 className="text-5xl font-extrabold leading-tight mb-6 text-shadow-sm mt-10">
                Welcome to LeafSphere{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-xl mb-8 text-green-50 text-shadow-sm">
                Book trusted landscapers, track your projects, and shop for products—all in one place.
              </p>
              <div className="flex flex-wrap gap-4 mt-20">
                <Link
                  to="/customer/book"
                  className="px-8 py-4 bg-white text-green-700 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                >
                  Book a Landscaper
                </Link>
                <Link
                  to="/customer/products"
                  className="px-8 py-4 bg-green-600 bg-opacity-100 backdrop-blur-sm text-white font-bold rounded-xl border border-green-200 border-opacity-40 hover:bg-green-700 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Shop Products
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-300 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="Customer gardening"
                className="relative rounded-2xl shadow-2xl z-10"
              />
            </motion.div>
          </div>
        </div>

        {/* Enhanced decorative wave element */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,160L48,154.7C96,149,192,139,288,144C384,149,480,171,576,170.7C672,171,768,149,864,144C960,139,1056,149,1152,165.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-20 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23047857' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What You Can Do</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">LeafSphere makes it easy for you to manage all your landscaping needs.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌱",
                title: "Book Services",
                description: "Find and book professional landscapers for your home or business projects.",
                link: "/customer/book",
                linkText: "Book Now",
              },
              {
                icon: "🛒",
                title: "Shop Products",
                description: "Browse and purchase top-quality gardening and landscaping products.",
                link: "/customer/products",
                linkText: "Shop Now",
              },
              {
                icon: "�",
                title: "Track Projects",
                description: "View the status and progress of your landscaping projects at any time.",
                link: "/customer/my-projects",
                linkText: "View Projects",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg border border-green-100 transition-all duration-300 h-full hover:shadow-2xl hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-400 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 text-2xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <Link
                    to={feature.link}
                    className="text-green-600 font-semibold flex items-center hover:text-green-800 transition-all duration-200 group-hover:translate-x-1"
                  >
                    {feature.linkText}{" "}
                    <ArrowRightIcon className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Landscaper Booking Section */}
      <section className="py-20 px-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Expert Landscapers</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Book directly with one of our professional landscapers for your next project.</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Landscaper Cards */}
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-6 px-4">
                  {landscapers.map((landscaper) => (
                    <motion.div
                      key={landscaper._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className="flex-shrink-0 w-72 bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                      onClick={() => setSelectedLandscaper(landscaper)}
                    >
                      <div className="h-40 bg-green-100 relative overflow-hidden">
                        <img
                          src={
                            landscaper.image ||
                            "https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                          }
                          alt={landscaper.name}
                          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{landscaper.name}</h3>
                        <div className="mb-3 flex flex-wrap gap-1">
                          {landscaper.specialties &&
                            landscaper.specialties.slice(0, 3).map((specialty, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                {specialty}
                              </span>
                            ))}
                          {landscaper.specialties && landscaper.specialties.length > 3 && (
                            <span className="inline-block px-2 py-1 text-gray-500 text-xs">+{landscaper.specialties.length - 3} more</span>
                          )}
                        </div>
                        <Link
                          to={`/book/${landscaper._id}`}
                          className="block w-full py-2 text-center bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Book Now
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Booking Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-12 bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg border border-green-100"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Booking</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select a Landscaper</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        const selected = landscapers.find((l) => l._id === e.target.value);
                        setSelectedLandscaper(selected);
                      }}
                      value={selectedLandscaper?._id || ""}
                    >
                      <option value="">Choose a landscaper</option>
                      {landscapers.map((landscaper) => (
                        <option key={landscaper._id} value={landscaper._id}>
                          {landscaper.name} - {landscaper.specialties?.[0] || "General"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Service Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                      <option>Garden Design</option>
                      <option>Lawn Maintenance</option>
                      <option>Planting & Cultivation</option>
                      <option>Irrigation Systems</option>
                      <option>Other Services</option>
                    </select>
                  </div>
                  <div className="md:self-end">
                    <Link
                      to={selectedLandscaper ? `/book/${selectedLandscaper._id}` : "/customer/book"}
                      className="block w-full py-3 text-center bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Continue to Booking
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      <div className="flex flex-col items-center">{/* <CustomerAppointmentStatus customerId={user.id} /> */}</div>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 px-20 relative overflow-hidden">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-green-50 to-white z-0">
          {/* Background blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-300 rounded-full mix-blend-soft-light blur-3xl opacity-30"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-100 rounded-full mix-blend-soft-light blur-3xl opacity-30"></div>

          {/* Light pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.4) 75%, transparent 75%, transparent)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Real feedback from customers who trust LeafSphere for their landscaping needs.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="relative group"
              >
                {/* Card glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-300 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                <div className="bg-white backdrop-filter backdrop-blur-sm bg-opacity-95 rounded-2xl shadow-lg border border-green-100 p-8 flex flex-col items-center relative hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-green-100 shadow-md"
                  />
                  <h4 className="text-lg font-bold text-green-700">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{testimonial.role}</p>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 italic text-center">"{testimonial.quote}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-20 relative overflow-hidden">
        {/* Enhanced gradient background with multiple layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-700 to-green-800 z-0">
          {/* Animated wave overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Crect fill='%23ffffff' width='800' height='800'/%3E%3Cg fill-opacity='0.15'%3E%3Ccircle fill='%23ffffff' cx='400' cy='400' r='600'/%3E%3Ccircle fill='%23ffffff' cx='400' cy='400' r='500'/%3E%3Ccircle fill='%23ffffff' cx='400' cy='400' r='400'/%3E%3Ccircle fill='%23ffffff' cx='400' cy='400' r='300'/%3E%3Ccircle fill='%23ffffff' cx='400' cy='400' r='200'/%3E%3Ccircle fill='%23ffffff' cx='400' cy='400' r='100'/%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "cover",
            }}
          ></div>

          {/* Light beam effect */}
          <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-1/2 h-96 bg-white opacity-10 blur-3xl rotate-12"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6 text-white text-shadow-sm">Ready to Start Your Next Project?</h2>
            <p className="text-xl mb-8 text-green-100">Book a landscaper or shop for products today and make your outdoor dreams a reality.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/customer/book"
                className="px-8 py-4 bg-white bg-opacity-90 backdrop-blur-sm text-green-700 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Book a Landscaper
              </Link>
              <Link
                to="/customer/products"
                className="px-8 py-4 bg-green-600 bg-opacity-40 backdrop-blur-sm border border-white border-opacity-30 text-white font-bold rounded-xl hover:bg-opacity-60 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Shop Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CustomerHomePage;
