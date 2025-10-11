import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, CheckCircleIcon, StarIcon, UserIcon, LightBulbIcon } from "@heroicons/react/24/outline";

const HomePage = () => {
  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Emily Johnson",
      role: "Residential Client",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      quote:
        "The LeafSphere team transformed our backyard into an oasis. Their attention to detail and sustainable practices exceeded our expectations.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Landscaper",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      quote:
        "Working with LeafSphere has been a game-changer for my career. The platform connects me with clients consistently, and the support is amazing.",
      rating: 5,
    },
    {
      id: 3,
      name: "Sarah Williams",
      role: "Business Owner",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      quote: "LeafSphere helped us completely revitalize our commercial property's exterior, creating an inviting environment for our customers.",
      rating: 4,
    },
  ];

  // How it works steps
  const howItWorks = [
    {
      id: 1,
      title: "Register",
      description: "Create your professional profile with your skills and experience",
      icon: <UserIcon className="w-8 h-8 text-green-500" />,
    },
    {
      id: 2,
      title: "Get Matched",
      description: "We connect you with clients based on your expertise and availability",
      icon: <CheckCircleIcon className="w-8 h-8 text-green-500" />,
    },
    {
      id: 3,
      title: "Complete Projects",
      description: "Work on landscaping projects and build your professional reputation",
      icon: <StarIcon className="w-8 h-8 text-green-500" />,
    },
    {
      id: 4,
      title: "Grow",
      description: "Expand your client base and increase your earnings with us",
      icon: <LightBulbIcon className="w-8 h-8 text-green-500" />,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-700 to-green-500 py-20 px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl font-extrabold leading-tight mb-6">Grow Your Career with LeafSphere</h1>
              <p className="text-xl mb-8 text-green-50">
                Join our network of professional landscapers and connect with clients looking for your expertise.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/application"
                  className="px-8 py-4 bg-white text-green-700 font-bold rounded-xl shadow-lg hover:bg-green-50 transition-all duration-300"
                >
                  Apply Now
                </Link>
                <Link
                  to="/staff/dashboard"
                  className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl border border-white hover:bg-green-700 transition-all duration-300"
                >
                  Staff Dashboard
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Landscaping professional"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive landscaping services and employment opportunities for professionals in the field.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 text-2xl">🌱</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Landscaping Services</h3>
              <p className="text-gray-600 mb-6">
                Professional landscaping solutions for residential and commercial properties with sustainable practices.
              </p>
              <Link to="/services" className="text-green-600 font-semibold flex items-center hover:text-green-800">
                Learn More <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 text-2xl">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Employment Opportunities</h3>
              <p className="text-gray-600 mb-6">Join our network of landscaping professionals and build a rewarding career with consistent work.</p>
              <Link to="/careers" className="text-green-600 font-semibold flex items-center hover:text-green-800">
                Learn More <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 text-2xl">⭐</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Client Feedback</h3>
              <p className="text-gray-600 mb-6">
                We value transparency and showcase authentic feedback from clients about our services and professionals.
              </p>
              <Link to="/testimonials" className="text-green-600 font-semibold flex items-center hover:text-green-800">
                Learn More <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes it easy for landscaping professionals to find work and grow their career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step) => (
              <div key={step.id} className="relative">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
                  <div className="bg-green-50 p-4 rounded-full inline-block mb-6">{step.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {step.id < howItWorks.length && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowRightIcon className="w-8 h-8 text-green-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-20 bg-green-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              LeafSphere is growing every day, connecting professionals with clients and creating beautiful landscapes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-green-600 bg-opacity-50 p-8 rounded-2xl text-center">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-xl font-medium text-green-100">Projects Completed</div>
            </div>
            <div className="bg-green-600 bg-opacity-50 p-8 rounded-2xl text-center">
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-xl font-medium text-green-100">Happy Employees</div>
            </div>
            <div className="bg-green-600 bg-opacity-50 p-8 rounded-2xl text-center">
              <div className="text-5xl font-bold mb-2">4.8★</div>
              <div className="text-xl font-medium text-green-100">Average Rating</div>
            </div>
            <div className="bg-green-600 bg-opacity-50 p-8 rounded-2xl text-center">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-xl font-medium text-green-100">Active Landscapers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What People Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our clients and professional landscapers about their experience with LeafSphere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg border border-green-100">
                <div className="flex items-center mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/testimonials"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
            >
              View All Testimonials <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-20 bg-gradient-to-br from-green-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-green-100">
                Join our growing community of landscaping professionals and connect with clients looking for your expertise. Apply today and transform
                your career.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/application"
                  className="px-8 py-4 bg-white text-green-700 font-bold rounded-xl shadow-lg hover:bg-green-50 transition-all duration-300"
                >
                  Apply Now
                </Link>
                <Link
                  to="/employee-ratings"
                  className="px-8 py-4 border border-white text-white font-bold rounded-xl hover:bg-green-600 transition-all duration-300"
                >
                  View Ratings
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1600240644455-3edc55c375fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Landscaping team"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white font-bold"
                      >
                        {i}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full bg-green-700 border-2 border-white flex items-center justify-center text-white font-bold">
                      +47
                    </div>
                  </div>
                  <div className="text-green-700">
                    <p className="font-bold">Join our team</p>
                    <p className="text-sm">of professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
