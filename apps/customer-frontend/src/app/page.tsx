import Image from "next/image";
import Link from "next/link";
import {
  BarChart,
  Building2,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Shield,
  Truck,
  User,
} from "lucide-react";

import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">VanNova</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="#services"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Services
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Testimonials
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-b from-blue-50 to-white py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Fast, Reliable Delivery for{" "}
                  <span className="text-blue-600">
                    Businesses & Individuals
                  </span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  VanNova provides seamless delivery solutions for both B2B and
                  B2C needs. Join us to experience the future of delivery
                  services.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="#user-type">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="#services">
                    <Button variant="outline">Explore Services</Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
                <Image
                  src="/placeholder.svg?height=800&width=1200"
                  alt="Delivery van on the road"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Our Delivery Services
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Tailored solutions for businesses and individuals with
                  flexible options to meet your delivery needs.
                </p>
              </div>
            </div>

            <Tabs defaultValue="b2b" className="mt-12">
              <div className="mb-8 flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="b2b" className="text-base">
                    <Building2 className="mr-2 h-4 w-4" />
                    Business (B2B)
                  </TabsTrigger>
                  <TabsTrigger value="b2c" className="text-base">
                    <User className="mr-2 h-4 w-4" />
                    Individual (B2C)
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="b2b" className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <Package className="mb-2 h-10 w-10 text-blue-600" />
                      <CardTitle>Bulk Shipping</CardTitle>
                      <CardDescription>
                        Efficient delivery of large quantities of goods to
                        multiple destinations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Volume-based pricing
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Scheduled deliveries
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Warehouse integration
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Clock className="mb-2 h-10 w-10 text-blue-600" />
                      <CardTitle>Same-Day Delivery</CardTitle>
                      <CardDescription>
                        Urgent delivery services for time-sensitive business
                        needs.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Priority handling
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Real-time tracking
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Dedicated courier
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <BarChart className="mb-2 h-10 w-10 text-blue-600" />
                      <CardTitle>Supply Chain Solutions</CardTitle>
                      <CardDescription>
                        End-to-end logistics management for your business.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Inventory management
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Distribution planning
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Analytics dashboard
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="b2c" className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <Package className="mb-2 h-10 w-10 text-blue-600" />
                      <CardTitle>Standard Delivery</CardTitle>
                      <CardDescription>
                        Reliable package delivery for everyday needs.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Affordable rates
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          1-3 day delivery
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Package protection
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Clock className="mb-2 h-10 w-10 text-blue-600" />
                      <CardTitle>Express Delivery</CardTitle>
                      <CardDescription>
                        Fast delivery options for urgent personal packages.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Same-day delivery
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Live tracking
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Delivery time selection
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Shield className="mb-2 h-10 w-10 text-blue-600" />
                      <CardTitle>Secure Delivery</CardTitle>
                      <CardDescription>
                        Extra protection for valuable or sensitive items.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Signature confirmation
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Insurance options
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                          Tamper-evident packaging
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="w-full bg-gray-50 py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  How VanNova Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A simple process designed to make delivery seamless for
                  everyone involved.
                </p>
              </div>
            </div>

            <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">1. Create an Account</h3>
                <p className="text-muted-foreground">
                  Sign up as a client or driver to access our platform and
                  services.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Package className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">
                  2. Schedule a Delivery
                </h3>
                <p className="text-muted-foreground">
                  Enter package details, choose service type, and select
                  delivery time.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Truck className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">
                  3. Track Your Delivery
                </h3>
                <p className="text-muted-foreground">
                  Follow your package in real-time until it reaches its
                  destination.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  What Our Customers Say
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from businesses and individuals who trust VanNova for
                  their delivery needs.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-gray-50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                      <Image
                        src="/placeholder.svg?height=100&width=100"
                        alt="Profile picture"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Sarah Johnson</CardTitle>
                      <CardDescription>
                        E-commerce Business Owner
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "VanNova has transformed our logistics operations. Their B2B
                    services have helped us scale our delivery capabilities
                    while reducing costs."
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                      <Image
                        src="/placeholder.svg?height=100&width=100"
                        alt="Profile picture"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Michael Chen</CardTitle>
                      <CardDescription>Regular Customer</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "The express delivery service is incredibly reliable. I can
                    always count on VanNova to deliver my packages on time and
                    in perfect condition."
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                      <Image
                        src="/placeholder.svg?height=100&width=100"
                        alt="Profile picture"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">David Rodriguez</CardTitle>
                      <CardDescription>Delivery Driver</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "Working as a driver for VanNova has been a great
                    experience. The platform is easy to use, and the support
                    team is always helpful."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* User Type Selection */}
        <section
          id="user-type"
          className="w-full bg-blue-50 py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Join VanNova Today
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose your role and create an account to get started with our
                  services.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <Card className="relative overflow-hidden border-2 transition-all hover:border-blue-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">I'm a Client</CardTitle>
                  <CardDescription>
                    Looking to ship packages or use delivery services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                      Schedule deliveries for your business or personal needs
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                      Track packages in real-time
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                      Manage billing and payment options
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                      Access delivery history and analytics
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register/client" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Sign Up as Client
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="relative overflow-hidden border-2 transition-all hover:border-blue-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">I'm a Driver</CardTitle>
                  <CardDescription>
                    Looking to deliver packages and earn money
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                      Choose your own schedule and delivery areas
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                      Receive delivery requests and navigate efficiently
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                      Track earnings and payment history
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                      Access driver support and resources
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register/driver" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Sign Up as Driver
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                <span className="font-medium">Note:</span> Admin accounts are
                created internally. Please contact our team if you need admin
                access.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600">
                  Get in Touch
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Contact VanNova
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Have questions about our services? Our team is here to help
                  you with any inquiries.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-muted-foreground">
                        123 Delivery Street, Logistics City, LC 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-phone"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-muted-foreground">(555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-mail"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">info@vannova.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your message"
                    ></textarea>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-gray-50 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">VanNova</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Providing fast, reliable delivery services for businesses and
                individuals since 2020.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Services</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    B2B Delivery
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    B2C Delivery
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Same-Day Delivery
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Supply Chain Solutions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} VanNova Delivery Services. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
