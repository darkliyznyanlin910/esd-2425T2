"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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

import { getServiceBaseUrl } from "@repo/service-discovery";
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
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/auth-images/vannova-icon.png"
                alt="VanNova Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold"
            >
              VanNova
            </motion.span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <motion.div
              className="flex gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, staggerChildren: 0.1 }}
            >
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
            </motion.div>
          </nav>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="transition-transform hover:scale-105"
                >
                  Log In
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-b from-blue-50 to-white py-12 md:py-24 lg:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-10 top-20 h-64 w-64 rounded-full bg-blue-200 opacity-20 blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 15,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-300 opacity-20 blur-3xl"
              animate={{
                x: [0, -70, 0],
                y: [0, 50, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 20,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="container relative px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h1
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                >
                  Fast, Reliable Delivery for{" "}
                  <motion.span
                    className="text-blue-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                  >
                    Businesses & Individuals
                  </motion.span>
                </motion.h1>
                <motion.p
                  className="max-w-[600px] text-muted-foreground md:text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                >
                  VanNova provides seamless delivery solutions for both B2B and
                  B2C needs. Join us to experience the future of delivery
                  services.
                </motion.p>
                <motion.div
                  className="flex flex-col gap-4 sm:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="#user-type">
                      <Button className="bg-blue-600 shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-300/50">
                        Get Started
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="#services">
                      <Button
                        variant="outline"
                        className="transition-all duration-300"
                      >
                        Explore Services
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div
                className="relative h-[400px] w-full overflow-hidden rounded-xl"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                whileHover={{ scale: 1.03 }}
              >
                <Image
                  src="/delivery-van.jpg"
                  alt="Delivery van on the road"
                  fill
                  className="object-cover"
                  priority
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Our Delivery Services
                </motion.h2>
                <motion.p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Tailored solutions for businesses and individuals with
                  flexible options to meet your delivery needs.
                </motion.p>
              </div>
            </motion.div>

            <Tabs defaultValue="b2b" className="mt-12">
              <motion.div
                className="mb-8 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger
                    value="b2b"
                    className="group relative overflow-hidden text-base"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Business (B2B)
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-data-[state=active]:w-full"
                      layoutId="activeTabIndicator"
                    />
                  </TabsTrigger>
                  <TabsTrigger
                    value="b2c"
                    className="group relative overflow-hidden text-base"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Individual (B2C)
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-data-[state=active]:w-full"
                      layoutId="activeTabIndicator"
                    />
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              <TabsContent value="b2b" className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                      <CardHeader>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <Package className="mb-2 h-10 w-10 text-blue-600" />
                        </motion.div>
                        <CardTitle>Bulk Shipping</CardTitle>
                        <CardDescription>
                          Efficient delivery of large quantities of goods to
                          multiple destinations.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Volume-based pricing
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Scheduled deliveries
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Warehouse integration
                          </motion.li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="w-full bg-blue-600 transition-all duration-300 hover:bg-blue-700">
                            Learn More
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                      <CardHeader>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <Clock className="mb-2 h-10 w-10 text-blue-600" />
                        </motion.div>
                        <CardTitle>Same-Day Delivery</CardTitle>
                        <CardDescription>
                          Urgent delivery services for time-sensitive business
                          needs.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Priority handling
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Real-time tracking
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Dedicated courier
                          </motion.li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="w-full bg-blue-600 transition-all duration-300 hover:bg-blue-700">
                            Learn More
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                      <CardHeader>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <BarChart className="mb-2 h-10 w-10 text-blue-600" />
                        </motion.div>
                        <CardTitle>Supply Chain Solutions</CardTitle>
                        <CardDescription>
                          End-to-end logistics management for your business.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Inventory management
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Distribution planning
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Analytics dashboard
                          </motion.li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="w-full bg-blue-600 transition-all duration-300 hover:bg-blue-700">
                            Learn More
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="b2c" className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                      <CardHeader>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <Package className="mb-2 h-10 w-10 text-blue-600" />
                        </motion.div>
                        <CardTitle>Standard Delivery</CardTitle>
                        <CardDescription>
                          Reliable package delivery for everyday needs.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Affordable rates
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            1-3 day delivery
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Package protection
                          </motion.li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="w-full bg-blue-600 transition-all duration-300 hover:bg-blue-700">
                            Learn More
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                      <CardHeader>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <Clock className="mb-2 h-10 w-10 text-blue-600" />
                        </motion.div>
                        <CardTitle>Express Delivery</CardTitle>
                        <CardDescription>
                          Fast delivery options for urgent personal packages.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Same-day delivery
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Live tracking
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Delivery time selection
                          </motion.li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="w-full bg-blue-600 transition-all duration-300 hover:bg-blue-700">
                            Learn More
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                      <CardHeader>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <Shield className="mb-2 h-10 w-10 text-blue-600" />
                        </motion.div>
                        <CardTitle>Secure Delivery</CardTitle>
                        <CardDescription>
                          Extra protection for valuable or sensitive items.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Signature confirmation
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Insurance options
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                            Tamper-evident packaging
                          </motion.li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="w-full bg-blue-600 transition-all duration-300 hover:bg-blue-700">
                            Learn More
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="relative w-full overflow-hidden bg-gray-50 py-12 md:py-24 lg:py-32"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute right-20 top-40 h-72 w-72 rounded-full bg-blue-200 opacity-10 blur-3xl"
              animate={{
                x: [0, -50, 0],
                y: [0, 40, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 18,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="container relative px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  How VanNova Works
                </motion.h2>
                <motion.p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  A simple process designed to make delivery seamless for
                  everyone involved.
                </motion.p>
              </div>
            </motion.div>

            <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <User className="h-8 w-8" />
                </motion.div>
                <motion.h3
                  className="mb-2 text-xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  1. Create an Account
                </motion.h3>
                <motion.p
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Sign up as a client or driver to access our platform and
                  services.
                </motion.p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.3,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Package className="h-8 w-8" />
                </motion.div>
                <motion.h3
                  className="mb-2 text-xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  2. Schedule a Delivery
                </motion.h3>
                <motion.p
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  Enter package details, choose service type, and select
                  delivery time.
                </motion.p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Image
                    src="/auth-images/vannova-icon.png"
                    alt="VanNova Logo"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </motion.div>
                <motion.h3
                  className="mb-2 text-xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  3. Track Your Delivery
                </motion.h3>
                <motion.p
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  Follow your package in real-time until it reaches its
                  destination.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  What Our Customers Say
                </motion.h2>
                <motion.p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Hear from businesses and individuals who trust VanNova for
                  their delivery needs.
                </motion.p>
              </div>
            </motion.div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Sarah Johnson",
                  role: "E-commerce Business Owner",
                  quote:
                    "VanNova has transformed our logistics operations. Their B2B services have helped us scale our delivery capabilities while reducing costs.",
                },
                {
                  name: "Michael Chen",
                  role: "Regular Customer",
                  quote:
                    "The express delivery service is incredibly reliable. I can always count on VanNova to deliver my packages on time and in perfect condition.",
                },
                {
                  name: "David Rodriguez",
                  role: "Delivery Driver",
                  quote:
                    "Working as a driver for VanNova has been a great experience. The platform is easy to use, and the support team is always helpful.",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="h-full bg-gray-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="h-12 w-12 overflow-hidden rounded-full bg-gray-200"
                          initial={{ scale: 0.5, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2 + index * 0.1,
                          }}
                        >
                          <Image
                            src="/landing/person.jpeg"
                            alt="Profile picture"
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </motion.div>
                        <div>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: 0.3 + index * 0.1,
                              duration: 0.5,
                            }}
                          >
                            <CardTitle className="text-lg">
                              {testimonial.name}
                            </CardTitle>
                            <CardDescription>
                              {testimonial.role}
                            </CardDescription>
                          </motion.div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <motion.p
                        className="text-muted-foreground"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      >
                        "{testimonial.quote}"
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* User Type Selection */}
        <section
          id="user-type"
          className="relative w-full overflow-hidden bg-blue-50 py-12 md:py-24 lg:py-32"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-blue-200 opacity-20 blur-3xl"
              animate={{
                x: [0, 60, 0],
                y: [0, -40, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 20,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="container relative px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Join VanNova Today
                </motion.h2>
                <motion.p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Choose your role and create an account to get started with our
                  services.
                </motion.p>
              </div>
            </motion.div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -10 }}
              >
                <Card className="relative h-full overflow-hidden border-2 transition-all duration-300 hover:border-blue-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">I'm a Client</CardTitle>
                    <CardDescription>
                      Looking to ship packages or use delivery services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                        Schedule deliveries for your business or personal needs
                      </motion.li>
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                        Track packages in real-time
                      </motion.li>
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                        Manage billing and payment options
                      </motion.li>
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                        Access delivery history and analytics
                      </motion.li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <motion.div
                      className="w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/auth" className="w-full">
                        <Button className="w-full bg-blue-600 shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-300/50">
                          Sign Up as Client
                        </Button>
                      </Link>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -10 }}
              >
                <Card className="relative h-full overflow-hidden border-2 transition-all duration-300 hover:border-blue-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">I'm a Driver</CardTitle>
                    <CardDescription>
                      Looking to deliver packages and earn money
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                        Choose your own schedule and delivery areas
                      </motion.li>
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                        Receive delivery requests and navigate efficiently
                      </motion.li>
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                        Track earnings and payment history
                      </motion.li>
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4 text-blue-600" />
                        Access driver support and resources
                      </motion.li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <motion.div
                      className="w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={getServiceBaseUrl("driver-frontend") + "/auth"}
                        className="w-full"
                      >
                        <Button className="w-full bg-blue-600 shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-300/50">
                          Sign Up as Driver
                        </Button>
                      </Link>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>

            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <p className="text-muted-foreground">
                <span className="font-medium">Note:</span> Admin accounts are
                created internally. Please contact our team if you need admin
                access.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-gray-50 py-12">
        <div className="container px-4 md:px-6">
          <motion.div
            className="grid gap-8 lg:grid-cols-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ x: 5 }}
              >
                <Truck className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">VanNova</span>
              </motion.div>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Providing fast, reliable delivery services for businesses and
                individuals since 2025.
              </motion.p>
            </div>
            <div>
              <motion.h3
                className="mb-4 text-lg font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Services
              </motion.h3>
              <ul className="space-y-2 text-sm">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    B2B Delivery
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    B2C Delivery
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Same-Day Delivery
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Supply Chain Solutions
                  </Link>
                </motion.li>
              </ul>
            </div>
            <div>
              <motion.h3
                className="mb-4 text-lg font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Company
              </motion.h3>
              <ul className="space-y-2 text-sm">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    About Us
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Careers
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Blog
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Press
                  </Link>
                </motion.li>
              </ul>
            </div>
            <div>
              <motion.h3
                className="mb-4 text-lg font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Legal
              </motion.h3>
              <ul className="space-y-2 text-sm">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </motion.li>
              </ul>
            </div>
          </motion.div>
          <motion.div
            className="mt-8 border-t pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} VanNova Delivery Services. All
              rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
