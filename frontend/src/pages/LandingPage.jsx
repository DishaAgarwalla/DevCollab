import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { 
  FiUsers, FiCode, FiZap, FiAward, FiGithub, FiGlobe, 
  FiArrowRight, FiStar, FiTrendingUp, FiPlay, 
  FiBriefcase, FiMessageSquare, FiCheckCircle, FiClock,
  FiShield, FiBarChart2, FiSmile
} from 'react-icons/fi';
import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import GradientButton from '../components/GradientButton';
import ParticleBackground from '../components/ParticleBackground';
import CountUp from '../components/CountUp';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (pricingRef.current) observer.observe(pricingRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const features = [
    {
      icon: <FiUsers className="w-7 h-7" />,
      title: "Find Teammates",
      description: "Connect with developers worldwide who share your interests and skills.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FiCode className="w-7 h-7" />,
      title: "Build Together",
      description: "Collaborate on real-world projects and build an impressive portfolio.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <FiMessageSquare className="w-7 h-7" />,
      title: "Real-time Chat",
      description: "Communicate seamlessly with built-in team chat and @mentions.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <FiBriefcase className="w-7 h-7" />,
      title: "Task Management",
      description: "Organize work with tasks, labels, comments, and file attachments.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <FiShield className="w-7 h-7" />,
      title: "Enterprise Grade",
      description: "Secure, scalable, and built for teams of any size.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: <FiBarChart2 className="w-7 h-7" />,
      title: "Analytics & Insights",
      description: "Track progress with detailed analytics and exportable reports.",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const stats = [
    { value: 10000, suffix: '+', label: 'Active Developers', icon: <FiUsers /> },
    { value: 500, suffix: '+', label: 'Projects Created', icon: <FiBriefcase /> },
    { value: 50, suffix: '+', label: 'Technologies', icon: <FiCode /> },
    { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: <FiSmile /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      <ParticleBackground />
      <LandingNavbar scrolled={scrolled} />
      
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <AnimatedSection animation="fadeIn" delay={0}>
              <div className="inline-flex items-center gap-2 bg-indigo-100/80 backdrop-blur-sm text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-indigo-200/50">
                <FiTrendingUp className="w-4 h-4" />
                Join 10,000+ developers already collaborating
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Build Amazing Projects
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Together
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                The all-in-one collaboration platform where developers connect, 
                share ideas, and build incredible projects together.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <GradientButton to="/register" variant="primary" size="lg">
                  Start Building Free
                </GradientButton>
                <GradientButton to="/projects" variant="outline" size="lg" icon={false}>
                  <FiPlay className="w-5 h-5" />
                  Explore Projects
                </GradientButton>
              </div>
              
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="ml-2">Rated 4.9/5 by 2,000+ teams</span>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <AnimatedSection key={index} animation="scaleUp" delay={index * 100}>
                <div className="group hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                    <CountUp end={stat.value} suffix={stat.suffix} duration={2000} />
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section ref={featuresRef} id="features" className="py-24 bg-white scroll-mt-16 scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeIn" delay={0}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to <span className="gradient-text">Collaborate</span>
              </h2>
              <p className="text-xl text-gray-600">
                Powerful features designed to help you and your team build amazing software together.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 100}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-500"></div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeIn" delay={0}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Get Started in <span className="gradient-text">3 Simple Steps</span>
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of developers already building amazing projects
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Create Account", description: "Sign up for free and set up your developer profile in minutes", icon: "🚀" },
              { step: "02", title: "Join or Create", description: "Find a project that matches your skills or start your own", icon: "🎯" },
              { step: "03", title: "Start Building", description: "Chat, share tasks, and build amazing projects together", icon: "💪" }
            ].map((item, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 150}>
                <div className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">{item.icon}</span>
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden scroll-reveal">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="scaleUp" delay={0}>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Join thousands of developers already collaborating on DevCollab and start building amazing projects today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton to="/register" variant="white" size="lg">
                Get Started Free
              </GradientButton>
              <GradientButton to="/projects" variant="outline-white" size="lg" icon={false}>
                Explore Projects
              </GradientButton>
            </div>
            <p className="text-indigo-200 text-sm mt-6">No credit card required. Free forever.</p>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}