import { Link } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';

export default function PricingCard({ name, price, period, description, features, buttonText, buttonLink, popular }) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border ${popular ? 'border-indigo-200 shadow-md' : 'border-gray-100'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          {period && <span className="text-gray-500">/{period}</span>}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <FiCheck className="text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to={buttonLink}
        className={`block text-center py-3 rounded-xl font-semibold transition ${popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
      >
        {buttonText}
      </Link>
    </div>
  );
}