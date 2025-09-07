'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, Shield, Key, TrendingUp, Users, Car, FileText, CheckCircle, Star, MapPin, Mail, Phone } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Label } from '@kit/ui/label';
import { useState } from 'react';


function Home() {
  const [activeTab, setActiveTab] = useState('instant-government');

  const features = {
    'instant-government': {
      title: 'Instant Government Integration',
      description: 'Full compliance with the requirements of the Transport Authority and ZATCA. Direct integration with Tajeer, Absher, Tamm, Nafath, and ZATCA for contract registration, identity verification, and invoicing.',
      image: '/images/LandingPage/4. Features & Benefits/Features Screenshot/Instant Government Integration.png'
    },
    'fleet-management': {
      title: 'Comprehensive Fleet Management',
      description: 'Track vehicle locations live, schedule maintenance, and manage insurance and registration documents. Get proactive alerts before documents expire.',
      image: '/images/LandingPage/4. Features & Benefits/Features Screenshot/Comprehensive Fleet Management.png'
    },
    'electronic-contracts': {
      title: 'Automated Electronic Contracts',
      description: 'Create electronic contracts in minutes. Customer and vehicle data is pulled automatically, reducing errors and speeding up the rental process.',
      image: '/images/LandingPage/4. Features & Benefits/Features Screenshot/Automated Electronic Contracts.png'
    },
    'reporting-analytics': {
      title: 'Smart Reporting and Analytics',
      description: 'Interactive dashboards give you a comprehensive view of your business performance. Analyze revenue, utilization rates, and maintenance costs to make informed decisions.',
      image: '/images/LandingPage/4. Features & Benefits/Features Screenshot/Smart Reporting and analytics.png'
    }
  };

  return (
    <div className="flex flex-col bg-[#F9F9F9]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/LandingPage/1. Hero/Hero Pattern .png"
            alt="Hero Pattern"
            fill
            className="object-fill"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="space-y-12">
            {/* Heading */}
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Automate Car Rental Operations in Saudi Arabia and Increase Your Profits
              </h1>
            </div>

            {/* Dashboard Image */}
            <div className="relative w-full max-w-6xl mx-auto">
              <Image
                src="/images/LandingPage/1. Hero/Hero Image.png"
                alt="Tajeer Plus Dashboard"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Paragraph */}
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-xl text-white/90 leading-relaxed">
                An integrated cloud platform for fleet management, electronic contracts, and instant integration with government services (Absher, Tamm, Nafath, Tajeer) for full compliance and enhanced efficiency
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary px-8 py-4 text-lg">
                Watch Video (90 Seconds)
              </Button>
              <Button size="lg" className="bg-[#00A8AB] hover:bg-[#00A8AB]/90 text-white px-8 py-4 text-lg">
                Request A Free Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-white min-h-[30vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <p className="text-[#4F4F4F] text-lg">
              Trusted by the best car rental offices in the Kingdom
            </p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <Image
                src="/images/LandingPage/2. Trusted by/Placeholder Logo/Placeholder_logo_1.svg"
                alt="Partner Logo 1"
                width={200}
                height={250}
                className="opacity-60"
              />
              <Image
                src="/images/LandingPage/2. Trusted by/Placeholder Logo/Placeholder_logo_2.svg"
                alt="Partner Logo 2"
                width={200}
                height={250}
                className="opacity-60"
              />
              <Image
                src="/images/LandingPage/2. Trusted by/Placeholder Logo/Placeholder_logo_1.svg"
                alt="Partner Logo 3"
                width={200}
                height={250}
                className="opacity-60"
              />
              <Image
                src="/images/LandingPage/2. Trusted by/Placeholder Logo/Placeholder_logo_2.svg"
                alt="Partner Logo 4"
                width={200}
                height={250}
                className="opacity-60"
              />
              <Image
                src="/images/LandingPage/2. Trusted by/Placeholder Logo/Placeholder_logo_1.svg"
                alt="Partner Logo 5"
                width={200}
                height={250}
                className="opacity-60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Paperwork & Compliance Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0">
          <Image
            src="/images/LandingPage/3. Paperwork_compliance Section/Background Image.png"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10" style={{ marginLeft: '10vw', marginRight: '10vw', width: '80vw' }}>
          <div className="text-center space-y-16">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-[#4F4F4F] leading-tight">
                Paperwork, compliance, and delays slowing you down?
              </h2>
              <p className="text-xl text-[#4F4F4F] max-w-4xl mx-auto leading-relaxed">
                Tajeer plus transforms your traditional operations into a fully automated digital system
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {/* The Old Way Card */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg" >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(245.68deg, #008C89 -13.75%, #00706D 99.81%)'
                  }}
                ></div>
                <div className="relative z-10 h-full flex flex-col justify-center p-8 text-white space-y-8">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/LandingPage/3. Paperwork_compliance Section/Icons/The Old Way.svg"
                      alt="The Old Way"
                      width={48}
                      height={48}
                      className="filter brightness-0 invert"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-left">The Old Way</h3>
                    <p className="text-white/90 text-lg text-left leading-relaxed">
                      Endless paperwork, manual errors, and delays in contract completion
                    </p>
                  </div>
                </div>
              </div>

              {/* The Tajeer Plus Way Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200" style={{ height: '400px' }}>
                <div className="h-full flex flex-col justify-center p-8 space-y-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/LandingPage/3. Paperwork_compliance Section/Icons/The Tajeer Plus Way.svg"
                      alt="The Tajeer Plus Way"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl text-left font-bold text-[#4F4F4F]">The Tajeer Plus Way</h3>
                    <p className="text-[#4F4F4F] text-lg text-left leading-relaxed">
                      Full automation, instant compliance with government systems, and a fast, seamless customer experience
                    </p>
                  </div>
                </div>
              </div>

              {/* The Result Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200" style={{ height: '400px' }}>
                <div className="h-full flex flex-col justify-center p-8 space-y-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/LandingPage/3. Paperwork_compliance Section/Icons/The Result.svg"
                      alt="The Result"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-[#4F4F4F] text-left">The Result</h3>
                    <p className="text-[#4F4F4F] text-lg text-left leading-relaxed">
                      Increased efficiency, reduced costs, and growth in profits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Benefits Section */}
      <section
        className="py-20"
        style={{
          background: 'linear-gradient(181.61deg, #CED4DA -61.17%, #F9F9F9 136.02%)'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-wider text-[#4F4F4F] mb-4">FEATURES & BENEFITS</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#4F4F4F] leading-tight">
              Everything You Need to Manage Your Business in One Platform
            </h2>
          </div>

          {/* Feature Tabs */}
          <div className="flex justify-center mb-16">
            <div className="grid grid-cols-4 gap-4 max-w-4xl w-full">
              <button
                onClick={() => setActiveTab('instant-government')}
                className={`p-6 rounded-xl transition-all duration-300 ${
                  activeTab === 'instant-government'
                    ? 'bg-white shadow-lg border-2 border-primary'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <Image
                    src="/images/LandingPage/4. Features & Benefits/Icons/Instant Givernmetn Integration.svg"
                    alt="Instant Government Integration"
                    width={32}
                    height={32}
                  />
                  <span className="text-sm font-medium text-[#4F4F4F] text-center">
                    Instant Government Integration
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('fleet-management')}
                className={`p-6 rounded-xl transition-all duration-300 ${
                  activeTab === 'fleet-management'
                    ? 'bg-white shadow-lg border-2 border-primary'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <Image
                    src="/images/LandingPage/4. Features & Benefits/Icons/Comprehensive Fleet Management.svg"
                    alt="Comprehensive Fleet Management"
                    width={32}
                    height={32}
                  />
                  <span className="text-sm font-medium text-[#4F4F4F] text-center">
                    Comprehensive Fleet Management
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('electronic-contracts')}
                className={`p-6 rounded-xl transition-all duration-300 ${
                  activeTab === 'electronic-contracts'
                    ? 'bg-white shadow-lg border-2 border-primary'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <Image
                    src="/images/LandingPage/4. Features & Benefits/Icons/Automated Electronics Contracts.svg"
                    alt="Automated Electronic Contracts"
                    width={32}
                    height={32}
                  />
                  <span className="text-sm font-medium text-[#4F4F4F] text-center">
                    Automated Electronic Contracts
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('reporting-analytics')}
                className={`p-6 rounded-xl transition-all duration-300 ${
                  activeTab === 'reporting-analytics'
                    ? 'bg-white shadow-lg border-2 border-primary'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <Image
                    src="/images/LandingPage/4. Features & Benefits/Icons/Smart Reporting.svg"
                    alt="Smart Reporting and Analytics"
                    width={32}
                    height={32}
                  />
                  <span className="text-sm font-medium text-[#4F4F4F] text-center">
                    Smart Reporting and Analytics
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Feature Content */}
          <div className="flex flex-col lg:flex-row gap-6 items-center px-4 max-w-7xl mx-auto">
            {/* Dashboard Screenshot */}
            <div className="relative flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={features[activeTab as keyof typeof features].image}
                  alt={features[activeTab as keyof typeof features].title}
                  className="w-full h-auto max-w-full"
                />
              </div>
            </div>

            {/* Feature Description */}
            <div className="space-y-6 flex-1 lg:pl-8">
              <h3 className="text-3xl lg:text-4xl font-bold text-[#4F4F4F] leading-tight">
                {features[activeTab as keyof typeof features].title}
              </h3>
              <p className="text-lg text-[#4F4F4F] leading-relaxed">
                {features[activeTab as keyof typeof features].description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/LandingPage/5. Testimonials/Background Image.png"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6 items-center max-w-6xl mx-auto">
            {/* Quote Section */}
            <div className="flex-1 relative z-20">
              <div className="relative max-w-md">
                <Image
                  src="/images/LandingPage/5. Testimonials/Quote Background.png"
                  alt="Quote Background"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-6">
                  <div className="space-y-3">
                    <blockquote className="text-xl lg:text-2xl text-[#4F4F4F] leading-relaxed font-medium">
                      "Tajeer Plus changed the way we work. We saved over 40% of the time we used to spend on manual data entry and document verification. Now, we can focus on serving our customers better."
                    </blockquote>
                  </div>
                </div>
                <div className="absolute -bottom-6 left-0 space-y-1">
                  <p className="text-base font-semibold text-[#4F4F4F]">
                    Branch Manager
                  </p>
                  <p className="text-sm text-[#4F4F4F]/80">
                    Car Rental Company
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Image */}
            <div className="flex-1 flex justify-center relative z-30">
              <div className="relative w-full max-w-lg" style={{ height: '90vh' }}>
                <Image
                  src="/images/LandingPage/5. Testimonials/Customer Image.png"
                  alt="Customer"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/LandingPage/6. Our Mission/Background Image.png"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10" style={{ marginLeft: '15vw', marginRight: '15vw', width: '70vw' }}>
          <div className="space-y-8">
            <p className="text-sm uppercase tracking-wider text-white font-normal">
              OUR MISSION
            </p>
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight max-w-2xl">
              Empowering car rental offices in the Kingdom with the latest technology
            </h2>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative min-h-[65vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/LandingPage/7. Our Story/Background Image.png"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <p className="text-2xl uppercase tracking-wider text-[#4F4F4F] font-medium">
              OUR STORY
            </p>
            <p className="text-3xl lg:text-5xl text-[#4F4F4F] leading-tight font-medium">
              Founded by experts in car rental and technology, Tajeer Plus was created to solve the Saudi market's challenges of manual processes, compliance issues, and disconnected systems with one powerful solution for growth.
            </p>
          </div>
        </div>
      </section>

      {/* Team Image Section */}
      <section className="relative w-full" style={{ height: '65vh' }}>
        <Image
          src="/images/LandingPage/7. Our Story/Team Image.png"
          alt="Our Team"
          fill
          className="object-cover"
        />
      </section>

      {/* Call to Action Banner */}
      <section className="py-40">
        <div className="w-full flex justify-center">
          <div className="w-[90%]">
            <div className="relative rounded-4xl overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="/images/LandingPage/8. Banner/Banner Background Image.png"
                  alt="Banner Background"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative z-10 p-12 lg:p-16 text-center space-y-8">
                <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Ready to elevate your<br />car rental business?
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  Join the leading rental offices in the Kingdom that use Tajeer Plus to increase efficiency and profitability.
                </p>
                <div className="space-y-4">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold">
                    Request A Free Demo
                  </Button>
                  <p className="text-sm text-white/80">
                    Free trial, no credit card required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section className="py-20 ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#4F4F4F] leading-tight">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Innovation Card */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:scale-110 hover:z-10 cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src="/images/LandingPage/9. Our Core Values/Values/Innovation.png"
                  alt="Innovation"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Innovation</h3>
                  <div className="overflow-hidden transition-all duration-500 group-hover:max-h-32 max-h-0">
                    <p className="text-white/90 text-sm leading-relaxed">
                      We are committed to continuous development to meet the evolving needs of the market
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer First Card */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:scale-110 hover:z-10 cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src="/images/LandingPage/9. Our Core Values/Values/Customer First.png"
                  alt="Customer First"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Customer First</h3>
                  <div className="overflow-hidden transition-all duration-500 group-hover:max-h-32 max-h-0">
                    <p className="text-white/90 text-sm leading-relaxed">
                      Your success is our success. We provide exceptional support and service to help you grow
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Card */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:scale-110 hover:z-10 cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src="/images/LandingPage/9. Our Core Values/Values/Compliance.png"
                  alt="Compliance"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Compliance</h3>
                  <div className="overflow-hidden transition-all duration-500 group-hover:max-h-32 max-h-0">
                    <p className="text-white/90 text-sm leading-relaxed">
                      We are dedicated to providing a platform that is always up-to-date with the latest regulations in Saudi Arabia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simplicity Card */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:scale-110 hover:z-10 cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src="/images/LandingPage/9. Our Core Values/Values/Simplicity.png"
                  alt="Simplicity"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Simplicity</h3>
                  <div className="overflow-hidden transition-all duration-500 group-hover:max-h-32 max-h-0">
                    <p className="text-white/90 text-sm leading-relaxed">
                      Powerful technology should be easy to use. We design our platform to be intuitive and user-friendly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/LandingPage/10. Join Our team/Background Image.png"
            alt="Join Our Team Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 px-4 w-full">
          <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            Join Our Team
          </h2>
          <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
            We are always looking for talented individuals to join our mission.
          </p>
          <div className="pt-8 flex justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold flex items-center gap-2">
              View Open Positions
              <Image
                src="/images/LandingPage/10. Join Our team/External link.svg"
                alt="External Link"
                width={20}
                height={20}
              />
            </Button>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <Image
            src="/images/LandingPage/11. Get in Touch/Background Image.png"
            alt="Get in Touch Background"
            fill
            className="object-fill"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#4F4F4F] leading-tight mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-[#4F4F4F] max-w-2xl mx-auto">
              Our team is ready to help you. Fill out the form below or contact us directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Left Column - Map and Contact Info */}
            <div className="space-y-8">
              {/* Map */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/LandingPage/11. Get in Touch/Map.png"
                  alt="Riyadh Map"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 text-primary mt-1">
                    <MapPin className="w-full h-full" />
                  </div>
                  <div>
                    <p className="text-[#4F4F4F] font-medium">
                      King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia
                    </p>
                    <a href="#" className="text-primary hover:underline text-sm">
                      View in map →
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 text-primary mt-1">
                    <Mail className="w-full h-full" />
                  </div>
                  <div>
                    <p className="text-[#4F4F4F] font-medium">
                      sales@tajeerplus.com
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 text-primary mt-1">
                    <Phone className="w-full h-full" />
                  </div>
                  <div>
                    <p className="text-[#4F4F4F] font-medium">
                      +966 55 123 4567
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <form className="space-y-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-[#4F4F4F] font-medium mb-2 block">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    className="w-full"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <Label htmlFor="company" className="text-[#4F4F4F] font-medium mb-2 block">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Enter your company name"
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-[#4F4F4F] font-medium mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone" className="text-[#4F4F4F] font-medium mb-2 block">
                    Phone Number
                  </Label>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-[#4F4F4F]">
                      <option value="+966">+966</option>
                    </select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Number of Vehicles */}
                <div>
                  <Label htmlFor="vehicles" className="text-[#4F4F4F] font-medium mb-2 block">
                    Number of Vehicles
                  </Label>
                  <select
                    id="vehicles"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-[#4F4F4F]"
                  >
                    <option value="">Select number of vehicles</option>
                    <option value="1-5">1-5</option>
                    <option value="6-10">6-10</option>
                    <option value="11-25">11-25</option>
                    <option value="26-50">26-50</option>
                    <option value="50+">50+</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="text-[#4F4F4F] font-medium mb-2 block">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Enter a description..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Logo */}
            <div className="mb-4 md:mb-0">
              <Image
                src="/images/LandingPage/12. Footer/Logo.svg"
                alt="Tajeer Plus Logo"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                © 2025 Tajeer Plus. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;