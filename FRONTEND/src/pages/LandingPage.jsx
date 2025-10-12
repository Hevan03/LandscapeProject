import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import imageurl from "../../public/image.jpg";
import axios from "axios";

const LandingPage = () => {
  const _fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const [topLandscapers, setTopLandscapers] = useState([]);

  useEffect(() => {
    // Fetch top-rated landscapers (public endpoint provided by backend)
    axios
      .get("http://localhost:5001/api/rating/landscapers/grades")
      .then((res) => setTopLandscapers(res.data?.landscapers?.slice(0, 3) || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}

      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute top-0 right-0 -mr-16 w-1/3 h-1/3 bg-gradient-to-br from-green-300/10 to-green-500/20 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-green-700/10 to-green-400/20 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />

        {/* Main content */}
        <div className="container mx-auto px-6 py-12 md:py-24 lg:py-32">
          <div className="grid md:grid-cols-2 gap-12 md:gap-0 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="order-2 md:order-1"
            >
              <div className="max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-green-100/80 text-green-800 font-medium text-sm mb-8 backdrop-blur-sm border border-green-200/50"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Transforming outdoor spaces since 2015
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-900 to-green-500">Transform</span> your outdoor living
                  space
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl text-gray-600 mb-10 leading-relaxed"
                >
                  Professional landscaping solutions with premium equipment and exceptional service. Create your dream outdoor environment today.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link
                    to="/register"
                    className="group flex items-center py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-lg shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 transform transition-all duration-300 hover:-translate-y-1"
                  >
                    <span>Get Started</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/shop"
                    className="group flex items-center py-3 px-6 bg-white border border-green-200 hover:border-green-300 text-green-700 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-300 hover:-translate-y-1"
                  >
                    Shop Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-10 flex items-center gap-6"
                >
                  <div className="flex -space-x-3">
                    {[
                      "https://randomuser.me/api/portraits/women/44.jpg",
                      "https://randomuser.me/api/portraits/men/51.jpg",
                      "https://randomuser.me/api/portraits/women/63.jpg",
                      "https://randomuser.me/api/portraits/men/29.jpg",
                    ].map((img, i) => (
                      <img key={i} src={img} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Customer" />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-800 text-xs font-medium">
                      50+
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-semibold">Trusted by 50+ satisfied customers</span>
                    <br />
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Top-rated landscapers preview */}
                {topLandscapers.length > 0 && (
                  <div className="mt-6 flex items-center gap-3 text-sm">
                    <span className="text-gray-600">Top landscapers:</span>
                    {topLandscapers.map((l) => (
                      <span key={l.id} className="px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                        {l.name} · Grade {l.grade} · ⭐ {l.rating}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="order-1 md:order-2 relative"
            >
              <div className="relative h-[500px] md:h-[600px] w-full">
                {/* Main image with rounded corners and shadow */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
                  <img src={imageurl} alt="Beautiful landscape design" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-900/30 to-transparent" />
                </div>

                {/* Floating elements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="absolute -bottom-6 -left-6 md:bottom-10 md:left-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs border border-gray-100"
                >
                  <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-semibold">Free Design Consultation</h3>
                    <p className="text-sm text-gray-600">Book a session with our experts</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -top-6 -right-6 md:top-10 md:right-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs border border-gray-100"
                >
                  <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-semibold">100% Satisfaction</h3>
                    <p className="text-sm text-gray-600">Our quality guarantee</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer complete landscape management solutions to help you create and maintain your ideal outdoor space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: "🌱",
                title: "Landscape Design",
                description: "Professional landscape design and implementation for residential and commercial properties.",
                link: "/create-landscape",
              },
              {
                icon: "🛒",
                title: "Equipment Shop",
                description: "Quality tools, plants and landscaping materials for all your outdoor projects.",
                link: "/shop",
              },
              {
                icon: "🚚",
                title: "Delivery Service",
                description: "Fast and reliable delivery of all your landscaping equipment and materials.",
                link: "/rentals",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <Link to={service.link} className="text-green-600 hover:text-green-700 font-medium flex items-center">
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Top-rated Landscapers */}
      {topLandscapers?.length > 0 && (
        <div className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-3">Top-rated Landscapers</h2>
              <p className="text-gray-600">Browse our best performers based on customer feedback</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {topLandscapers.slice(0, 6).map((l, idx) => {
                const name = l.name || l.fullName || l.username || "Landscaper";
                const grade = (l.grade || "-").toString();
                const rating = Number(l.rating || 0);
                const totalReviews = l.reviewsCount || l.totalReviews || l.ratingCount || 0;
                const filled = Math.floor(rating);
                const hasHalf = rating - filled >= 0.5;

                const gradeColor =
                  grade === "A"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : grade === "B"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : grade === "C"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-gray-100 text-gray-700 border-gray-200";

                return (
                  <motion.div
                    key={l.id || l._id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-xl font-semibold shadow">
                        {name?.[0]?.toUpperCase() || "L"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${gradeColor}`}>Grade {grade}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {/* Stars */}
                          <div className="flex items-center text-yellow-400">
                            {[...Array(5)].map((_, i) => {
                              const full = i < filled;
                              const half = i === filled && hasHalf;
                              return (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 mr-0.5">
                                  {full ? (
                                    <path
                                      fill="currentColor"
                                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    />
                                  ) : half ? (
                                    <g>
                                      <defs>
                                        <linearGradient id={`half-${idx}-${i}`} x1="0" x2="1">
                                          <stop offset="50%" stopColor="currentColor" />
                                          <stop offset="50%" stopColor="transparent" />
                                        </linearGradient>
                                      </defs>
                                      <path
                                        fill={`url(#half-${idx}-${i})`}
                                        stroke="currentColor"
                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                      />
                                    </g>
                                  ) : (
                                    <path
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      d="M10 2l2.35 7.23H20l-6.18 4.49 2.36 7.28L10 16.5 3.82 21 6.18 13.72 0 9.23h7.65L10 2z"
                                    />
                                  )}
                                </svg>
                              );
                            })}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{rating.toFixed(1)}</span>
                          {totalReviews > 0 && <span className="text-xs text-gray-500">({totalReviews})</span>}
                        </div>
                      </div>
                    </div>

                    {/* Subtext */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      Experienced landscaper delivering quality work and customer satisfaction.
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Verified Professional</span>
                      <Link to={"/ratings"} className="text-sm text-green-700 hover:text-green-800 font-medium">
                        View reviews →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Career Section */}
      <div className="py-20 bg-gradient-to-br from-green-700 to-green-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold mb-6">Join Our Team</h2>
              <p className="text-xl text-green-100 mb-10">
                We're looking for talented individuals to help us grow. Whether you're a landscaper, driver, or customer service specialist, we'd love
                to hear from you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  { title: "Landscaper", icon: "🌳", description: "Design and implement beautiful outdoor spaces" },
                  { title: "Driver", icon: "🚚", description: "Deliver products and equipment to our valued customers" },
                  { title: "Staff", icon: "👥", description: "Support our operations in various administrative roles" },
                ].map((role, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <div className="text-3xl mb-3">{role.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                    <p className="text-green-100">{role.description}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/application"
                className="inline-block px-8 py-4 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-100 transition duration-300 shadow-lg transform hover:scale-105"
              >
                Apply for Career
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Here's what our customers have to say about our services.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: "Sarah Johnson",
                role: "Homeowner",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                quote: "The team transformed my backyard into a beautiful space for entertaining. I couldn't be happier with the results!",
              },
              {
                name: "Mark Davis",
                role: "Business Owner",
                image: "https://randomuser.me/api/portraits/men/35.jpg",
                quote: "Their commercial landscaping services have elevated the appearance of our office building. Very professional team.",
              },
              {
                name: "Emily Wilson",
                role: "Garden Enthusiast",
                image: "https://randomuser.me/api/portraits/women/68.jpg",
                quote: "The quality of their plants and gardening tools is exceptional. Fast delivery and great customer service too!",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-green-50 p-8 rounded-2xl border border-green-100"
              >
                <div className="flex items-center mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full mr-4 border-2 border-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{testimonial.name}</h3>
                    <p className="text-green-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="mt-4 text-yellow-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/ratings" className="text-green-600 hover:text-green-700 font-medium">
              View All Reviews →
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl overflow-hidden shadow-2xl">
            <div className="md:flex">
              <div className="md:w-1/2 p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to transform your space?</h2>
                <p className="text-green-100 mb-8 text-lg">Get started today and experience our professional landscape services.</p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-white hover:bg-gray-100 text-green-700 rounded-lg font-semibold transition duration-300 shadow-lg"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold transition duration-300 shadow-lg"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
              <div
                className="md:w-1/2 bg-cover bg-center h-64 md:h-auto"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1558904541-efa843a96f01?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1335&q=80')",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Landscape Project</h3>
              <p className="text-gray-400 mb-4">Professional landscaping services for residential and commercial properties.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/create-landscape" className="text-gray-400 hover:text-green-400">
                    Landscape Design
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-gray-400 hover:text-green-400">
                    Equipment Shop
                  </Link>
                </li>
                <li>
                  <Link to="/rentals" className="text-gray-400 hover:text-green-400">
                    Tool Rentals
                  </Link>
                </li>
                <li>
                  <Link to="/book" className="text-gray-400 hover:text-green-400">
                    Book Appointment
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-green-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/career" className="text-gray-400 hover:text-green-400">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/application" className="text-gray-400 hover:text-green-400">
                    Apply Now
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>123 Main Street, City, Country</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>info@landscapeproject.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400">© {new Date().getFullYear()} Landscape Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
