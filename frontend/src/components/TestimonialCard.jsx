import { FiStar } from 'react-icons/fi';

export default function TestimonialCard({ name, role, company, content, rating, avatar }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <FiStar key={i} className="text-yellow-500 fill-yellow-500" />
        ))}
      </div>
      <p className="text-gray-600 mb-6 leading-relaxed">"{content}"</p>
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role} at {company}</p>
        </div>
      </div>
    </div>
  );
}