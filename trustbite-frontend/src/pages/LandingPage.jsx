import HeroSection from '../components/sections/HeroSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import StatsSection from '../components/sections/StatsSection';
import FeaturedMessSection from '../components/sections/FeaturedMessSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import PricingSection from '../components/sections/PricingSection';
import CTASection from '../components/sections/CTASection';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <main className="bg-white">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <FeaturedMessSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
