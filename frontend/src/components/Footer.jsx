import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiArrowUp, FiHeart } from 'react-icons/fi';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features', isHash: true },
        { name: 'Pricing', href: '#pricing', isHash: true },
        { name: 'Projects', href: '/projects', isHash: false },
        { name: 'Roadmap', href: '/roadmap', isHash: false },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about', isHash: false },
        { name: 'Blog', href: '/blog', isHash: false },
        { name: 'Careers', href: '/careers', isHash: false },
        { name: 'Contact', href: '/contact', isHash: false },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs', isHash: false },
        { name: 'Help Center', href: '/help', isHash: false },
        { name: 'Community', href: '/community', isHash: false },
        { name: 'Status', href: '/status', isHash: false },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy', isHash: false },
        { name: 'Terms of Service', href: '/terms', isHash: false },
        { name: 'Cookie Policy', href: '/cookies', isHash: false },
      ]
    }
  ];

  const socialLinks = [
    { icon: <FiGithub className="w-5 h-5" />, href: 'https://github.com/devcollab', label: 'GitHub' },
    { icon: <FiTwitter className="w-5 h-5" />, href: 'https://twitter.com/devcollab', label: 'Twitter' },
    { icon: <FiLinkedin className="w-5 h-5" />, href: 'https://linkedin.com/company/devcollab', label: 'LinkedIn' },
    { icon: <FiMail className="w-5 h-5" />, href: 'mailto:hello@devcollab.com', label: 'Email' },
  ];

  const handleHashLink = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">DC</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                DevCollab
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              The all-in-one collaboration platform where developers connect, share ideas, and build incredible projects together.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.isHash ? (
                      <button
                        onClick={() => handleHashLink(link.href)}
                        className="text-gray-400 hover:text-white transition text-sm cursor-pointer"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link to={link.href} className="text-gray-400 hover:text-white transition text-sm">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 flex items-center gap-1">
            © {new Date().getFullYear()} DevCollab. Built with <FiHeart className="text-red-500 w-3 h-3" /> for developers worldwide.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
          >
            <span className="text-sm">Back to top</span>
            <FiArrowUp className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}