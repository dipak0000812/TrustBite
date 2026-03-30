import HeroSection from '../components/sections/HeroSection';
import TrustHygieneSection from '../components/sections/TrustHygieneSection';
import FeaturedMessSection from '../components/sections/FeaturedMessSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import AIRecommendationSection from '../components/sections/AIRecommendationSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import CTASection from '../components/sections/CTASection';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <main className="bg-white">
      <HeroSection />
      <TrustHygieneSection />
      <FeaturedMessSection />
      <HowItWorksSection />
      <AIRecommendationSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
