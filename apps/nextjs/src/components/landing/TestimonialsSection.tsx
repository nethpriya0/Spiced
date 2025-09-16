import React from 'react'
import Image from 'next/image'
import { Star, Quote } from 'lucide-react'
import { DEMO_TESTIMONIALS } from '@/data/demoData'

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from chefs, restaurateurs, and food businesses who've transformed 
            their sourcing with authentic, blockchain-verified spices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DEMO_TESTIMONIALS.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative group"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-orange-200 group-hover:text-orange-300 transition-colors">
                <Quote className="h-8 w-8" />
              </div>

              {/* Stars */}
              <div className="flex space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= testimonial.rating
                        ? 'text-amber-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial text */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "{testimonial.message}"
              </blockquote>

              {/* Author info */}
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.restaurant || testimonial.business || testimonial.specialty}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-orange-600 to-red-500 text-white px-8 py-4 rounded-2xl shadow-lg">
            <div className="flex -space-x-2">
              {DEMO_TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
                <div key={index} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <span className="font-semibold">Join 500+ satisfied buyers</span>
              <div className="text-sm text-orange-100">Start sourcing authentic spices today</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection