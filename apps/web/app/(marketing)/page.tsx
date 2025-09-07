import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, Shield, Key, TrendingUp, Users, Car, FileText, CheckCircle, Star, MapPin, Mail, Phone } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Label } from '@kit/ui/label';

import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 w-full h-full"

        >
          <Image
            src="/images/Dashboard pattern/Pattern [2x].png"
            alt="Background Pattern"
            fill
            className=" object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  Automate Car Rental Operations in{' '}
                  <span className="text-white">Saudi Arabia</span> and Increase Your Profits
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Tajeer Plus is a cloud-based car rental management system designed to streamline operations,
                  enhance customer experience, and boost profitability for car rental businesses in Saudi Arabia.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary px-8 py-4 text-lg">
                  Book a Demo
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <Image
                  src="/images/Dashboard pattern/dashboard-ss.png"
                  alt="Tajeer Plus Dashboard"
                  width={800}
                  height={500}
                  className="rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-8 opacity-60">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 font-semibold">BEAM</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Paperwork, compliance, and delays slowing you down?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tajeer Plus simplifies your operational complexities, delivering speed and accuracy to your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-lg">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Stay Up-to-Date</h3>
                <p className="text-gray-600">
                  Automate compliance checks and stay updated with regulatory changes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Key className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">The Smart Way</h3>
                <p className="text-gray-600">
                  Digitize your operations, manage your fleet, customers, and contracts with ease.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">The Result</h3>
                <p className="text-gray-600">
                  Increase efficiency, reduce costs, and boost your bottom line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Everything You Need to Manage Your Business in One Platform
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Instant Government Integration</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tajeer Plus integrates seamlessly with government systems including Absher, Tajeer, and Najm
                  for real-time data verification and compliance. Stay ahead of regulatory requirements with
                  automated updates and instant validation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Real-time verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Automated compliance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Instant updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Secure integration</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <Image
                  src="/images/Dashboard pattern/dashboard-ss.png"
                  alt="Government Integration Dashboard"
                  width={600}
                  height={400}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                "Tajeer Plus changed the way we work. We cut down over 40% of the time we used in operations,
                manual data entry, and document verification. Now, we can focus on serving our customers better."
              </div>
              <div className="space-y-2">
                <div className="text-xl font-semibold text-gray-900">Khalid Al-Saud</div>
                <div className="text-gray-600">CEO, Al-Saud Car Rental</div>
              </div>
            </div>

            <div className="relative">
              <div className="w-80 h-80 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-32 h-32 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                <p className="text-xl text-gray-600">
                  Empowering car rental offices in the Kingdom with the latest technology.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
                <p className="text-gray-600 leading-relaxed">
                  Founded by experts in car rental and technology, Tajeer Plus was created to solve the Saudi
                  market's challenges of manual processes, compliance issues, and disconnected systems with
                  one powerful solution for growth.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
                <Users className="w-24 h-24 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to elevate your car rental business?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Let's talk about how Tajeer Plus can help you achieve your business goals.
            </p>
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary px-8 py-4 text-lg">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Core Values</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Innovation", icon: Car },
              { title: "Customer First", icon: Users },
              { title: "Compliance", icon: Shield },
              { title: "Simplicity", icon: FileText }
            ].map((value, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
                <Users className="w-24 h-24 text-gray-400" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Join Our Team</h2>
                <p className="text-xl text-gray-600">
                  We're always looking for talented individuals to join our growing team.
                </p>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
                View Open Positions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Get In Touch</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions or want to learn more? We'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>

                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Enter your company name" />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Enter your message" rows={4} />
                </div>

                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white">
                  Send Message
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">info@tajeerplus.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">+966 50 123 4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Riyadh, Saudi Arabia</span>
                </div>
              </div>

              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default withI18n(Home);