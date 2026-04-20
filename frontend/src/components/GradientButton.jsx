import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function GradientButton({ 
  to, 
  onClick, 
  children, 
  variant = 'primary',
  size = 'md',
  icon = true,
  className = '',
  external = false
}) {
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl',
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    white: 'bg-white text-indigo-600 hover:bg-gray-50 shadow-lg hover:shadow-xl',
    'outline-white': 'bg-transparent border-2 border-white text-white hover:bg-white/10',
    dark: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black'
  };

  const ButtonContent = () => (
    <>
      <span>{children}</span>
      {icon && <FiArrowRight className={`transition-transform duration-300 group-hover:translate-x-1 ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />}
    </>
  );

  const buttonClasses = `
    inline-flex items-center gap-2 font-semibold transition-all duration-300
    ${sizes[size]} ${variants[variant]} ${className} group
    ${variant !== 'outline' && variant !== 'outline-white' ? 'hover:-translate-y-0.5' : ''}
  `;

  if (to && !external) {
    return (
      <Link to={to} className={buttonClasses}>
        <ButtonContent />
      </Link>
    );
  }

  if (external && to) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={buttonClasses}>
        <ButtonContent />
      </a>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      <ButtonContent />
    </button>
  );
}