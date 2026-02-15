import { Hero } from "@/components/home/hero"
import { FeaturedCollections } from "@/components/home/featured-collections"
import { FeaturedProducts } from "@/components/home/featured-products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Hero />
      <FeaturedCollections />
      <FeaturedProducts />

      {/* Newsletter Section */}
      <section className="py-24 bg-neon-green border-y-[4px] border-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-black leading-none mb-6">
                JOIN THE <br /> COMMUNITY
              </h2>
              <p className="text-black/70 text-lg font-medium uppercase tracking-wider">
                Get early access to exclusive drops and digital events.
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <form className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="EMAIL@FUTURE.COM"
                  className="h-16 bg-white border-2 border-black rounded-none text-black font-bold placeholder:text-black/40 text-lg px-6 focus-visible:ring-black"
                />
                <Button className="h-16 px-10 bg-black text-neon-green font-black uppercase tracking-widest rounded-none text-lg hover:bg-black/90 hover:scale-105 transition-all">
                  Subscribe
                </Button>
              </form>
              <p className="text-[10px] text-black font-bold uppercase tracking-[0.2em] mt-6">
                By subscribing, you agree to our terms of service and privacy policy. No spam, only heat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Component will go here next */}
    </div>
  )
}
