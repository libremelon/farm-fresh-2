"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import {
  mockApi,
  MultiSellerCrop,
  SellerListing,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Check,
  Phone,
  Truck,
  QrCode,
  Star,
  Layers,
  CreditCard,
  User,
  Package,
  RotateCcw,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export interface FlattenedListing {
  cropId: string;
  cropName: string;
  category: "Vegetables" | "Fruits" | "Grains & Pulses" | "Spices" | "Organic";
  cropImage: string;
  mandiBenchmarkPrice: number;
  cropDescription: string;
  seller: SellerListing;
  allSellersInCrop: SellerListing[];
}

export interface CartItem {
  sellerId: string;
  cropId: string;
  cropName: string;
  cropImage: string;
  sellerName: string;
  sellerLocation: string;
  sellerRating: number;
  sellerGrade: string;
  pricePerKg: number;
  quantityKg: number;
  availableStockKg: number;
  listing: FlattenedListing;
  seller: SellerListing;
}

type DeliveryAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

type DeliveryPartner = {
  id: string;
  name: string;
  rating: number;
  eta: string;
  fee: number;
  contact: string;
  vehicle: string;
};

type Rider = {
  id: string;
  name: string;
  rating: number;
  completedTrips: number;
  vehicle: string;
  capacity: string;
  eta: string;
  phone: string;
  partnerId: string;
};

type PlacedOrder = {
  orderId: string;
  items: CartItem[];
  totalPrice: number;
  totalKg: number;
  address: DeliveryAddress;
  deliveryMode: "self" | "partner";
  partner?: DeliveryPartner;
  rider?: Rider;
  paymentMethod: "cod" | "card" | "upi";
  paymentStatus: "pending" | "paid";
  placedAt: Date;
};

const DELIVERY_PARTNERS: DeliveryPartner[] = [
  {
    id: "agri_express",
    name: "AgriExpress",
    rating: 4.9,
    eta: "2–4 hours",
    fee: 0,
    contact: "+91 98765 40001",
    vehicle: "HR 69 AG 4821",
  },
  {
    id: "farm_link",
    name: "FarmLink Logistics",
    rating: 4.7,
    eta: "3–5 hours",
    fee: 49,
    contact: "+91 98765 40002",
    vehicle: "DL 1L F 7740",
  },
  {
    id: "rapid_rider",
    name: "RapidRider",
    rating: 4.6,
    eta: "90–150 min",
    fee: 79,
    contact: "+91 98765 40003",
    vehicle: "DL 8S CJ 2304",
  },
];

const RIDERS: Rider[] = [
  {
    id: "rider_aman",
    name: "Aman Kumar",
    rating: 4.9,
    completedTrips: 482,
    vehicle: "Tata Ace mini-truck",
    capacity: "Up to 750 kg",
    eta: "18 min away",
    phone: "+91 98100 12345",
    partnerId: "agri_express",
  },
  {
    id: "rider_sunita",
    name: "Sunita Devi",
    rating: 4.8,
    completedTrips: 367,
    vehicle: "Electric cargo auto",
    capacity: "Up to 400 kg",
    eta: "24 min away",
    phone: "+91 98100 23456",
    partnerId: "agri_express",
  },
  {
    id: "rider_rahul",
    name: "Rahul Singh",
    rating: 4.7,
    completedTrips: 291,
    vehicle: "Mahindra Jeeto",
    capacity: "Up to 600 kg",
    eta: "30 min away",
    phone: "+91 98100 34567",
    partnerId: "farm_link",
  },
  {
    id: "rider_neha",
    name: "Neha Yadav",
    rating: 4.9,
    completedTrips: 525,
    vehicle: "Two-wheeler cargo",
    capacity: "Up to 80 kg",
    eta: "12 min away",
    phone: "+91 98100 45678",
    partnerId: "rapid_rider",
  },
];

export interface DirectOrderSuccess {
  orderId: string;
  seller: SellerListing;
  listing: FlattenedListing;
  quantityKg: number;
  mode: "retail" | "bulk";
  rawPrice: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: "cod" | "card" | "upi";
  paymentStatus: "pending" | "paid";
}

export interface AssignedRiderInfo {
  riderName: string;
  riderPhone: string;
  vehicle: string;
  etaMinutes: number;
  routePolyline?: string;
}

export interface OrderRecord {
  orderId: string;
  placedAt: Date;
  status: "Confirmed" | "In Transit" | "Out for Delivery" | "Delivered" | "Cancelled";
  items: {
    cropId: string;
    cropName: string;
    cropImage: string;
    sellerName: string;
    pricePerKg: number;
    quantityKg: number;
  }[];
  totalPrice: number;
  totalKg: number;
  paymentMethod: "cod" | "card" | "upi";
  paymentStatus: "pending" | "paid";
  deliveryPartner: string;
  riderInfo?: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
  };
  eta: string;
  addressSummary: string;
}

const INITIAL_ORDERS: OrderRecord[] = [
  {
    orderId: "AMZ-AGRI-984210",
    placedAt: new Date(Date.now() - 35 * 60 * 1000),
    status: "Out for Delivery",
    items: [
      {
        cropId: "crop_tomato",
        cropName: "Shimla Himsona Tomato",
        cropImage: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
        sellerName: "Rameshwar Patel",
        pricePerKg: 24,
        quantityKg: 50,
      },
      {
        cropId: "crop_onion",
        cropName: "Nashik Red Onion",
        cropImage: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?w=800&auto=format&fit=crop&q=80",
        sellerName: "Suresh Deshmukh",
        pricePerKg: 32,
        quantityKg: 25,
      },
    ],
    totalPrice: 2000,
    totalKg: 75,
    paymentMethod: "upi",
    paymentStatus: "paid",
    deliveryPartner: "AgriExpress Logistics",
    riderInfo: {
      name: "Aman Kumar",
      phone: "+91 98100 12345",
      vehicle: "Tata Ace (HR 69 AG 4821)",
      rating: 4.9,
    },
    eta: "18 mins away (Arriving ~11:45 AM)",
    addressSummary: "Flat 4B, Gulmohar Enclave, New Delhi",
  },
  {
    orderId: "AMZ-AGRI-742911",
    placedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "Delivered",
    items: [
      {
        cropId: "crop_mango",
        cropName: "Alphonso Ratnagiri Mango",
        cropImage: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80",
        sellerName: "Ganesh Shinde",
        pricePerKg: 140,
        quantityKg: 20,
      },
    ],
    totalPrice: 2800,
    totalKg: 20,
    paymentMethod: "card",
    paymentStatus: "paid",
    deliveryPartner: "FarmLink Express",
    riderInfo: {
      name: "Sunita Devi",
      phone: "+91 98100 23456",
      vehicle: "EV Cargo Auto (DL 1L F 7740)",
      rating: 4.8,
    },
    eta: "Delivered on 27 Aug, 09:30 AM",
    addressSummary: "Flat 4B, Gulmohar Enclave, New Delhi",
  },
];

export default function MarketplacePage() {
  const [commodities, setCommodities] = useState<MultiSellerCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState(
    "Delhi NCR Mandi Corridor",
  );
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { currentUser, openAuthModal, logout } = useAuthStore();

  // CART STATE & DRAWER
  const [cart, setCart] = useState<CartItem[]>([
    {
      sellerId: "farm_tom_01",
      cropId: "crop_tomato",
      cropName: "Tomato",
      cropImage:
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
      sellerName: "Rameshwar Patel",
      sellerLocation: "Sonipat Vegetable Belt (4 km away)",
      sellerRating: 4.9,
      sellerGrade: "Grade A",
      pricePerKg: 24,
      quantityKg: 25,
      availableStockKg: 1500,
      listing: {
        cropId: "crop_tomato",
        cropName: "Tomato",
        category: "Vegetables",
        cropImage:
          "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
        mandiBenchmarkPrice: 28,
        cropDescription: "Daily morning harvested tomatoes.",
        seller: {
          sellerId: "farm_tom_01",
          farmerName: "Rameshwar Patel",
          rating: 4.9,
          grade: "Grade A",
          pricePerKg: 24,
          availableStockKg: 1500,
          location: "Sonipat Vegetable Belt (4 km away)",
          totalSales: "160+ orders fulfilled",
          distanceKm: 4,
          variety: "Shimla Himsona F1",
          phone: "+91 98123 45678",
          harvestBadge: "Morning 6 AM Harvest",
          bulkDiscountPercent: 8,
        },
        allSellersInCrop: [],
      },
      seller: {
        sellerId: "farm_tom_01",
        farmerName: "Rameshwar Patel",
        rating: 4.9,
        grade: "Grade A",
        pricePerKg: 24,
        availableStockKg: 1500,
        location: "Sonipat Vegetable Belt (4 km away)",
        totalSales: "160+ orders fulfilled",
        distanceKm: 4,
        variety: "Shimla Himsona F1",
        phone: "+91 98123 45678",
        harvestBadge: "Morning 6 AM Harvest",
        bulkDiscountPercent: 8,
      },
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOutCart, setIsCheckingOutCart] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [deliveryMode, setDeliveryMode] = useState<"self" | "partner">(
    "partner",
  );
  const [selectedPartner, setSelectedPartner] = useState("agri_express");
  const [selectedRider, setSelectedRider] = useState("rider_aman");
  const [showCheckoutWizard, setShowCheckoutWizard] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [addressError, setAddressError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "upi">("upi");
  const [cardDetails, setCardDetails] = useState({
    name: "Ramesh Kumar",
    number: "4532 8912 3456 7890",
    expiry: "08/28",
    cvv: "892",
  });
  const [upiId, setUpiId] = useState("ramesh.kumar@okaxis");
  const [selectedUpiApp, setSelectedUpiApp] = useState("GPay");
  const [showQrCode, setShowQrCode] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Selected Listing for Detail Modal / Seller Comparison
  const [selectedListing, setSelectedListing] =
    useState<FlattenedListing | null>(null);
  const [activeSellerInModal, setActiveSellerInModal] =
    useState<SellerListing | null>(null);

  // Direct Buy Modal State (Dual-Mode: Retail & Bulk)
  const [orderingItem, setOrderingItem] = useState<{
    listing: FlattenedListing;
    seller: SellerListing;
  } | null>(null);
  const [purchaseMode, setPurchaseMode] = useState<"retail" | "bulk">("retail");
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(25);
  const [orderSuccess, setOrderSuccess] = useState<DirectOrderSuccess | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [riderInfo, setRiderInfo] = useState<AssignedRiderInfo | null>(null);
  const [isAssigningRider, setIsAssigningRider] = useState(false);
  // Orders Management State
  const [ordersHistory, setOrdersHistory] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [ordersTab, setOrdersTab] = useState<"active" | "past">("active");
  const [ratingModalItem, setRatingModalItem] = useState<{ cropName: string; sellerName: string } | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingSuccessToast, setRatingSuccessToast] = useState("");
  const [reAddToast, setReAddToast] = useState("");
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const activeOrdersCount = ordersHistory.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled",
  ).length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("orders") === "true") {
        const timer = setTimeout(() => setIsOrdersModalOpen(true), 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const activeUser = isHydrated ? currentUser : null;

  const categories = [
    "All",
    "Vegetables",
    "Fruits",
    "Grains & Pulses",
    "Spices",
    "Organic",
  ];

  const popularLocations = [
    { name: "Delhi NCR Mandi Corridor", lat: 28.6139, lng: 77.209 },
    { name: "Sonipat Vegetable Belt (Haryana)", lat: 28.9931, lng: 77.0151 },
    { name: "Lasalgaon Onion Hub (Nashik)", lat: 20.1478, lng: 74.2257 },
    { name: "Samana Grain Hub (Punjab)", lat: 30.1557, lng: 76.1917 },
    { name: "Alwar Organic Cluster (Rajasthan)", lat: 27.553, lng: 76.6346 },
    { name: "All India Sourcing", lat: 28.6139, lng: 77.209 },
  ];

  const handleRadiusChange = (newRadius: number) => {
    setLoading(true);
    setRadius(newRadius);
  };

  // Fetch commodities with radius
  useEffect(() => {
    let isCurrent = true;
    mockApi
      .getNearbyCommodities(28.6139, 77.209, radius)
      .then((data) => {
        if (isCurrent) {
          setCommodities(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [radius]);

  // Derived Cart Totals
  const cartTotalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantityKg, 0);
  }, [cart]);

  const cartTotalPrice = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.quantityKg * item.pricePerKg,
      0,
    );
  }, [cart]);

  // CART ACTIONS
  const addToCart = (
    listing: FlattenedListing,
    seller: SellerListing,
    quantityKg: number = 25,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.sellerId === seller.sellerId && item.cropId === listing.cropId,
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          updated[existingIdx].quantityKg + quantityKg,
          seller.availableStockKg,
        );
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantityKg: newQty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            sellerId: seller.sellerId,
            cropId: listing.cropId,
            cropName: listing.cropName,
            cropImage: listing.cropImage,
            sellerName: seller.farmerName,
            sellerLocation: seller.location,
            sellerRating: seller.rating,
            sellerGrade: seller.grade,
            pricePerKg: seller.pricePerKg,
            quantityKg: Math.min(quantityKg, seller.availableStockKg),
            availableStockKg: seller.availableStockKg,
            listing,
            seller,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (
    sellerId: string,
    cropId: string,
    newQty: number,
  ) => {
    if (newQty <= 0) {
      removeFromCart(sellerId, cropId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.sellerId === sellerId && item.cropId === cropId) {
          return {
            ...item,
            quantityKg: Math.min(newQty, item.availableStockKg),
          };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (sellerId: string, cropId: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.sellerId === sellerId && item.cropId === cropId),
      ),
    );
  };

  // Flattened listings for OLX Card View
  const allFlattenedListings: FlattenedListing[] = useMemo(() => {
    const list: FlattenedListing[] = [];
    commodities.forEach((crop) => {
      crop.sellers.forEach((seller) => {
        list.push({
          cropId: crop.cropId,
          cropName: crop.cropName,
          category: crop.category,
          cropImage: crop.image,
          mandiBenchmarkPrice: crop.mandiBenchmarkPrice,
          cropDescription: crop.description,
          seller,
          allSellersInCrop: crop.sellers,
        });
      });
    });
    return list;
  }, [commodities]);

  // Filtered & Sorted listings
  const filteredListings = useMemo(() => {
    return allFlattenedListings
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesCrop =
            item.cropName.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q);
          const matchesFarmer =
            item.seller.farmerName.toLowerCase().includes(q) ||
            item.seller.location.toLowerCase().includes(q) ||
            item.seller.variety.toLowerCase().includes(q);
          if (!matchesCrop && !matchesFarmer) return false;
        }

        // Category filter
        if (selectedCategory !== "All") {
          if (selectedCategory === "Organic" && item.category !== "Organic") {
            return false;
          }
          if (
            selectedCategory !== "Organic" &&
            item.category !== selectedCategory
          ) {
            return false;
          }
        }

        // Quality Grade filter
        if (selectedGrade !== "All" && item.seller.grade !== selectedGrade) {
          return false;
        }

        // Minimum Rating filter
        if (minRating > 0 && item.seller.rating < minRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "featured") {
          if (a.seller.rating >= 4.8 && b.seller.rating < 4.8) return -1;
          if (a.seller.rating < 4.8 && b.seller.rating >= 4.8) return 1;
          return a.seller.distanceKm - b.seller.distanceKm;
        }
        if (sortBy === "price_asc")
          return a.seller.pricePerKg - b.seller.pricePerKg;
        if (sortBy === "price_desc")
          return b.seller.pricePerKg - a.seller.pricePerKg;
        if (sortBy === "rating_desc") return b.seller.rating - a.seller.rating;
        if (sortBy === "distance")
          return a.seller.distanceKm - b.seller.distanceKm;
        if (sortBy === "stock_desc")
          return b.seller.availableStockKg - a.seller.availableStockKg;
        return 0;
      });
  }, [
    allFlattenedListings,
    searchQuery,
    selectedCategory,
    selectedGrade,
    minRating,
    sortBy,
  ]);

  // Open detail modal
  const handleOpenDetailModal = (listing: FlattenedListing) => {
    setSelectedListing(listing);
    setActiveSellerInModal(listing.seller);
  };

  // Open direct buy modal (Retail)
  const handleOpenRetailBuy = (
    listing: FlattenedListing,
    seller: SellerListing,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    setOrderingItem({ listing, seller });
    setPurchaseMode("retail");
    setPurchaseQuantity(25);
    setOrderSuccess(null);
    setRiderInfo(null);
  };

  // Open direct buy modal (Bulk)
  const handleOpenBulkBuy = (
    listing: FlattenedListing,
    seller: SellerListing,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    setOrderingItem({ listing, seller });
    setPurchaseMode("bulk");
    setPurchaseQuantity(1000); // 1 Ton in kg
    setOrderSuccess(null);
    setRiderInfo(null);
  };

  // Calculations for direct purchase modal
  const activeSellerForPurchase = orderingItem?.seller;
  const rawPrice = activeSellerForPurchase
    ? purchaseQuantity * activeSellerForPurchase.pricePerKg
    : 0;
  const isBulkDiscount =
    purchaseMode === "bulk" &&
    purchaseQuantity >= 500 &&
    (activeSellerForPurchase?.bulkDiscountPercent || 0) > 0;
  const discountAmount = isBulkDiscount
    ? Math.round(
        rawPrice * ((activeSellerForPurchase?.bulkDiscountPercent || 0) / 100),
      )
    : 0;
  const finalPayable = rawPrice - discountAmount;

  // Cancel Active Order
  const handleCancelOrder = (orderId: string) => {
    setOrdersHistory((prev) =>
      prev.map((ord) =>
        ord.orderId === orderId ? { ...ord, status: "Cancelled" as const } : ord,
      ),
    );
  };

  // Buy Again Action (Re-adds items to cart)
  const handleBuyAgain = (order: OrderRecord) => {
    const newCartItems: CartItem[] = order.items.map((item) => {
      const mockListing: FlattenedListing = {
        cropId: item.cropId,
        cropName: item.cropName,
        category: "Vegetables",
        cropImage: item.cropImage,
        mandiBenchmarkPrice: item.pricePerKg + 2,
        cropDescription: "Fresh direct farm produce",
        seller: {
          sellerId: "farm_" + item.cropId,
          farmerName: item.sellerName,
          rating: 4.9,
          grade: "Grade A",
          pricePerKg: item.pricePerKg,
          availableStockKg: 1000,
          location: "Sonipat Vegetable Corridor",
          totalSales: "100+ orders",
          distanceKm: 5,
          variety: "Organic Fresh",
          phone: "+91 98123 45678",
          harvestBadge: "Fresh Pick",
        },
        allSellersInCrop: [],
      };
      return {
        sellerId: mockListing.seller.sellerId,
        cropId: item.cropId,
        cropName: item.cropName,
        cropImage: item.cropImage,
        sellerName: item.sellerName,
        sellerLocation: "Sonipat Vegetable Belt (4 km away)",
        sellerRating: 4.9,
        sellerGrade: "Grade A",
        pricePerKg: item.pricePerKg,
        quantityKg: item.quantityKg,
        availableStockKg: 1000,
        listing: mockListing,
        seller: mockListing.seller,
      };
    });

    setCart((prev) => [...prev, ...newCartItems]);
    setIsOrdersModalOpen(false);
    setIsCartOpen(true);
    setReAddToast(`Re-added ${order.items.length} produce item(s) to cart!`);
    setTimeout(() => setReAddToast(""), 4000);
  };

  // Rate Farmer Produce Modal
  const handleOpenRating = (cropName: string, sellerName: string) => {
    setRatingModalItem({ cropName, sellerName });
    setRatingStars(5);
  };

  const handleSubmitRating = () => {
    const target = ratingModalItem;
    setRatingSuccessToast(
      `🌟 Thank you! Your ${ratingStars}-star rating for ${target?.sellerName}'s produce has been recorded.`,
    );
    setRatingModalItem(null);
    setTimeout(() => setRatingSuccessToast(""), 4000);
  };

  // Confirm single order execution
  const handleConfirmOrder = async () => {
    if (!orderingItem || !activeSellerForPurchase) return;
    setIsOrdering(true);
    const codFee = paymentMethod === "cod" ? 20 : 0;
    const finalAmountWithPayment = finalPayable + codFee;

    setTimeout(() => {
      const generatedOrderId = "AGRI-" + Math.floor(100000 + Math.random() * 900000);
      setOrderSuccess({
        orderId: generatedOrderId,
        seller: activeSellerForPurchase,
        listing: orderingItem.listing,
        quantityKg: purchaseQuantity,
        mode: purchaseMode,
        rawPrice,
        discountAmount,
        totalAmount: finalAmountWithPayment,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      });

      // Append to orders history
      const newRecord: OrderRecord = {
        orderId: generatedOrderId,
        placedAt: new Date(),
        status: "Confirmed",
        items: [
          {
            cropId: orderingItem.listing.cropId,
            cropName: orderingItem.listing.cropName,
            cropImage: orderingItem.listing.cropImage,
            sellerName: activeSellerForPurchase.farmerName,
            pricePerKg: activeSellerForPurchase.pricePerKg,
            quantityKg: purchaseQuantity,
          },
        ],
        totalPrice: finalAmountWithPayment,
        totalKg: purchaseQuantity,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        deliveryPartner: "AgriExpress Logistics",
        eta: "25–40 mins away",
        addressSummary: "Default Saved Hub",
      };
      setOrdersHistory((prev) => [newRecord, ...prev]);

      setIsOrdering(false);
    }, 650);
  };

  const deliveryFee =
    deliveryMode === "partner"
      ? (DELIVERY_PARTNERS.find((partner) => partner.id === selectedPartner)
          ?.fee ?? 0)
      : 0;
  const chosenPartner = DELIVERY_PARTNERS.find(
    (partner) => partner.id === selectedPartner,
  );
  const availableRiders = RIDERS.filter(
    (rider) => rider.partnerId === selectedPartner,
  );
  const chosenRider = RIDERS.find((rider) => rider.id === selectedRider);

  const choosePartner = (partnerId: string) => {
    setDeliveryMode("partner");
    setSelectedPartner(partnerId);
    setSelectedRider(
      RIDERS.find((rider) => rider.partnerId === partnerId)?.id ?? "",
    );
  };

  const openCheckoutWizard = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setCheckoutStep(1);
    setAddressError("");
    setPaymentError("");
    if (currentUser?.buyerProfile?.deliveryAddress) {
      setDeliveryAddress(currentUser.buyerProfile.deliveryAddress);
    }
    setShowCheckoutWizard(true);
  };

  const continueFromAddress = () => {
    const required = [
      deliveryAddress.fullName,
      deliveryAddress.phone,
      deliveryAddress.addressLine1,
      deliveryAddress.city,
      deliveryAddress.state,
      deliveryAddress.pincode,
    ];
    if (required.some((field) => !field.trim())) {
      setAddressError("Please complete all required delivery details.");
      return;
    }
    setAddressError("");
    setCheckoutStep(2);
  };

  const continueFromPayment = () => {
    if (paymentMethod === "card") {
      if (!cardDetails.number.trim() || !cardDetails.cvv.trim()) {
        setPaymentError("Please complete all required card fields.");
        return;
      }
    } else if (paymentMethod === "upi" && !showQrCode) {
      if (!upiId.trim()) {
        setPaymentError("Please enter a valid UPI VPA handle or scan QR code.");
        return;
      }
    }
    setPaymentError("");
    setCheckoutStep(4);
  };

  // Finalise Cart Checkout
  const handleProceedCartCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckingOutCart(true);
    const codFee = paymentMethod === "cod" ? 20 : 0;
    const totalOrderAmount = cartTotalPrice + deliveryFee + codFee;

    setTimeout(() => {
      const generatedOrderId = "AMZ-AGRI-" + Math.floor(100000 + Math.random() * 900000);
      setPlacedOrder({
        orderId: generatedOrderId,
        items: [...cart],
        totalPrice: totalOrderAmount,
        totalKg: cartTotalItems,
        address: deliveryAddress,
        deliveryMode,
        partner: deliveryMode === "partner" ? chosenPartner : undefined,
        rider: deliveryMode === "partner" ? chosenRider : undefined,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        placedAt: new Date(),
      });

      // Append to orders history
      const newRecord: OrderRecord = {
        orderId: generatedOrderId,
        placedAt: new Date(),
        status: "In Transit",
        items: cart.map((item) => ({
          cropId: item.cropId,
          cropName: item.cropName,
          cropImage: item.cropImage,
          sellerName: item.sellerName,
          pricePerKg: item.pricePerKg,
          quantityKg: item.quantityKg,
        })),
        totalPrice: totalOrderAmount,
        totalKg: cartTotalItems,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        deliveryPartner: chosenPartner?.name || "AgriExpress Logistics",
        riderInfo: chosenRider
          ? {
              name: chosenRider.name,
              phone: chosenRider.phone,
              vehicle: chosenRider.vehicle,
              rating: chosenRider.rating,
            }
          : undefined,
        eta: chosenPartner?.eta || "30–45 mins away",
        addressSummary: `${deliveryAddress.addressLine1}, ${deliveryAddress.city}`,
      };
      setOrdersHistory((prev) => [newRecord, ...prev]);

      setCart([]);
      setIsCheckingOutCart(false);
      setShowCheckoutWizard(false);
    }, 700);
  };

  // Assign logistics rider
  const handleAssignRider = async () => {
    if (!orderSuccess) return;
    setIsAssigningRider(true);
    const rider = (await mockApi.assignRider(
      orderSuccess.orderId,
    )) as AssignedRiderInfo;
    setRiderInfo(rider);
    setIsAssigningRider(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f9] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* 1. TOP LIVE MANDI TICKER & UNIFIED NAVBAR */}
      <Navbar />

      {/* 2. CONSOLIDATED 2-ROW MARKETPLACE HEADER */}
      <header className="sticky top-[73px] z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* ROW 1: Location Selector, Search Bar, Cart Basket, My Orders & Account */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 md:gap-4">
          {/* Location Selector Dropdown */}
          <div className="relative shrink-0 hidden sm:block">
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              className="flex items-center gap-2 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition cursor-pointer text-xs font-semibold max-w-[200px] truncate text-zinc-900 dark:text-zinc-100 btn-interactive"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{selectedLocationName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-auto" />
            </button>

            {/* Location Dropdown Modal */}
            {showLocationModal && (
              <div className="absolute top-12 left-0 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-xs text-zinc-900 dark:text-white">
                    Delivery & Sourcing Hub
                  </span>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Search Radius</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {radius} km
                      </span>
                    </div>
                    <Slider
                      min={5}
                      max={100}
                      step={5}
                      value={[radius]}
                      onValueChange={(val) =>
                        handleRadiusChange(Array.isArray(val) ? val[0] : Number(val))
                      }
                    />
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5">
                      Popular Agricultural Hubs
                    </span>
                    <div className="space-y-1">
                      {popularLocations.map((loc) => (
                        <button
                          key={loc.name}
                          onClick={() => {
                            setSelectedLocationName(loc.name);
                            setShowLocationModal(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer ${
                            selectedLocationName === loc.name
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <span>{loc.name}</span>
                          {selectedLocationName === loc.name && (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Search Bar */}
          <div className="flex-1 relative flex items-center">
            <div className="w-full relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search "Tomatoes, Onions, MP Wheat, Devgad Mangoes..."'
                className="w-full pl-4 pr-12 py-2 border border-zinc-300 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-800/80 text-xs placeholder-zinc-400 dark:placeholder-zinc-500 transition font-medium text-zinc-900 dark:text-zinc-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-12 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#0b3b20] dark:bg-emerald-600 hover:bg-emerald-800 text-white rounded-xl flex items-center justify-center transition cursor-pointer btn-interactive"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* CART BASKET BUTTON */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs transition cursor-pointer shadow-xs relative btn-interactive border border-amber-500/30"
              title="View Shopping Cart Basket"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-emerald-950" />
                {cart.length > 0 && (
                  <span className="absolute -top-2.5 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {cart.length}
                  </span>
                )}
              </div>
              <span className="font-extrabold text-xs hidden sm:inline">
                ₹{cartTotalPrice.toLocaleString("en-IN")}
              </span>
            </button>

            {/* MY ORDERS BUTTON */}
            <button
              onClick={() => setIsOrdersModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition cursor-pointer border border-zinc-200 dark:border-zinc-700 relative btn-interactive"
              title="View My Orders"
            >
              <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Orders</span>
              {activeOrdersCount > 0 && (
                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            {/* USER PROFILE / SIGN IN */}
            {activeUser && activeUser.role === "buyer" ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 btn-interactive"
                >
                  <Avatar
                    name={activeUser.name}
                    className="w-5 h-5 rounded-full text-[9px] bg-[#0b3b20] text-amber-300"
                  />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hidden sm:inline max-w-[80px] truncate">
                    {activeUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-10 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 animate-in fade-in zoom-in-95 text-xs">
                    <div className="p-2.5 bg-emerald-50 dark:bg-zinc-800 rounded-xl mb-2">
                      <span className="font-extrabold text-xs text-zinc-900 dark:text-white block">
                        {activeUser.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {activeUser.phone}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block mt-1">
                        🏆 {activeUser.buyerProfile?.loyaltyTier || "FarmFresh Gold"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsOrdersModalOpen(true);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-amber-50 dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-zinc-700 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-between cursor-pointer mb-2 border border-amber-200 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>My FarmFresh Orders</span>
                      </div>
                      <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {ordersHistory.length}
                      </span>
                    </button>

                    {activeUser.buyerProfile?.deliveryAddress && (
                      <div className="space-y-1 text-zinc-600 dark:text-zinc-300 pb-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Saved Delivery Hub:
                        </p>
                        <p className="text-[11px] font-medium leading-tight">
                          {activeUser.buyerProfile.deliveryAddress.addressLine1},{" "}
                          {activeUser.buyerProfile.deliveryAddress.city} (
                          {activeUser.buyerProfile.deliveryAddress.pincode})
                        </p>
                      </div>
                    )}

                    <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openAuthModal("buyer");
                        }}
                        className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Switch Account
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("buyer")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition cursor-pointer btn-interactive"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: Horizontal Category Chips & APMC Live Status */}
        <div className="bg-zinc-50/70 dark:bg-zinc-900/90 border-t border-zinc-200/80 dark:border-zinc-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 py-0.5">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer btn-interactive ${
                      isActive
                        ? "bg-[#0b3b20] text-amber-300 dark:bg-emerald-600 dark:text-white font-bold shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* APMC Mandi Live Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-1 rounded-full shrink-0 border border-emerald-300/60 dark:border-emerald-800/40">
              <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>Sonipat & Azadpur APMC Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* 4. MAIN CATALOG BODY: PRODUCE CARDS GRID */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Controls & Horizontal Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight font-sans flex items-center gap-2.5">
              Fresh recommendations
              <span className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                {filteredListings.length} farmer listings
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-sans">
              Direct from verified multi-seller farms within{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {radius} km
              </span>{" "}
              radius
            </p>
          </div>

          {/* Clean Horizontal Pill-Bar Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Radius Quick Selector Pills */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="text-zinc-500 font-medium pl-2 pr-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Radius:
              </span>
              {[15, 30, 50, 100].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRadiusChange(r)}
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] transition cursor-pointer btn-interactive ${
                    radius === r
                      ? "bg-[#0b3b20] text-amber-300 dark:bg-emerald-600 dark:text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            {/* Quality Grade Filter Pills */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs">
              {["All", "Grade A", "Grade B", "Grade C"].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] transition cursor-pointer btn-interactive ${
                    selectedGrade === g
                      ? "bg-[#0b3b20] text-amber-300 dark:bg-emerald-600 dark:text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="rating_desc">Sort: Highest Rated</option>
              <option value="price_asc">Sort: Price Low to High</option>
              <option value="price_desc">Sort: Price High to Low</option>
              <option value="distance_asc">Sort: Nearest First</option>
            </select>
          </div>
        </div>

        {/* Empty Search Results Feedback */}
        {filteredListings.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-sans">
              No crop listings matched your criteria
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Try increasing your search radius to 50 km or clearing specific
              category/quality filters.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleRadiusChange(100);
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedGrade("All");
                  setMinRating(0);
                }}
                className="rounded-2xl"
              >
                Reset all filters
              </Button>
              <Link href="/farmer/crops/new">
                <Button
                  size="sm"
                  className="bg-[#0b3b20] dark:bg-emerald-600 hover:bg-emerald-800 text-white rounded-2xl"
                >
                  Post a Crop Listing
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* 5. UNIFORM PRODUCT CARDS GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredListings.map((item) => {
              const otherSellersCount = item.allSellersInCrop.length - 1;

              return (
                <div
                  key={`${item.cropId}-${item.seller.sellerId}`}
                  onClick={() => handleOpenDetailModal(item)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
                >
                  {/* Top Image Box */}
                  <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={item.cropImage}
                      alt={item.cropName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Single Combined Grade & Rating Pill in Top Corner */}
                    <div className="absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md bg-black/60 text-amber-300 border border-amber-400/30">
                      <span>★ {item.seller.rating}</span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-white">{item.seller.grade}</span>
                    </div>

                    {/* Multi-Seller count pill (Bottom Right of photo) */}
                    {otherSellersCount > 0 && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1 border border-amber-400/30">
                        <Layers className="w-3 h-3 text-amber-400" />
                        <span>+{otherSellersCount} More Farmers</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div>
                      {/* Price & Stock */}
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                          ₹ {item.seller.pricePerKg.toLocaleString("en-IN")}
                          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">
                            / kg
                          </span>
                        </h3>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                          {item.seller.availableStockKg.toLocaleString("en-IN")} kg
                        </span>
                      </div>

                      {/* Produce Title & Variety */}
                      <div className="mt-1">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                          {item.cropName}
                        </p>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                          {item.seller.variety}
                        </p>
                      </div>

                      {/* Single-Line Sleek Farmer Profile Text Row */}
                      <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Avatar
                            name={item.seller.farmerName}
                            className="w-4 h-4 rounded-full text-[8px] bg-[#0b3b20] text-amber-300"
                          />
                          <span className="truncate font-semibold text-zinc-800 dark:text-zinc-200">
                            {item.seller.farmerName}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 shrink-0 font-medium">
                          {item.seller.totalSales}
                        </span>
                      </div>
                    </div>

                    {/* Single Primary Conversion CTA Button */}
                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetailModal(item);
                        }}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-2xl transition cursor-pointer btn-interactive flex items-center justify-center gap-1.5 shadow-xs border border-amber-500/30"
                      >
                        <ShoppingCart className="w-4 h-4 text-emerald-950" />
                        <span>Add to Cart / Order</span>
                      </button>
                    </div>

                    {/* Footer: Location & Distance */}
                    <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      <span className="truncate max-w-[65%]" title={item.seller.location}>
                        {item.seller.location}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {item.seller.distanceKm} km away
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. SLIDE-OVER AMAZON-STYLE CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
              {/* Cart Drawer Header */}
              <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-[#002f34] text-white">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-base tracking-tight">
                    FarmFresh Basket ({cart.length} items)
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Itemized List */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-zinc-800 text-amber-600 flex items-center justify-center text-2xl mx-auto">
                      🛒
                    </div>
                    <h4 className="font-bold text-base text-gray-800 dark:text-gray-200">
                      Your Cart Basket is Empty
                    </h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Explore fresh farmer produce on the marketplace and add
                      items to your basket for instant dispatch.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsCartOpen(false)}
                      className="bg-[#002f34] text-white font-bold text-xs"
                    >
                      Browse Marketplace
                    </Button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const lineTotal = item.quantityKg * item.pricePerKg;
                    return (
                      <div
                        key={`${item.sellerId}-${item.cropId}`}
                        className="p-3 bg-gray-50 dark:bg-zinc-800/70 rounded-xl border border-gray-200 dark:border-zinc-700 flex gap-3 relative group"
                      >
                        {/* Crop Thumbnail */}
                        <img
                          src={item.cropImage}
                          alt={item.cropName}
                          className="w-16 h-16 rounded-lg object-cover border border-amber-300 shrink-0"
                        />

                        {/* Item Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                                {item.cropName}
                              </h4>
                              <p className="text-[10px] text-gray-500 font-medium truncate">
                                👨‍🌾 {item.sellerName}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                removeFromCart(item.sellerId, item.cropId)
                              }
                              className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="font-semibold text-gray-600 dark:text-gray-400">
                              ₹{item.pricePerKg}/kg
                            </span>
                            <span className="font-black text-emerald-900 dark:text-amber-300">
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </span>
                          </div>

                          {/* Stepper Quantity Controls */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg p-0.5 shadow-xs">
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.sellerId,
                                    item.cropId,
                                    item.quantityKg - 5,
                                  )
                                }
                                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-black text-gray-900 dark:text-white">
                                {item.quantityKg} kg
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.sellerId,
                                    item.cropId,
                                    item.quantityKg + 5,
                                  )
                                }
                                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[10px] text-gray-400">
                              Max: {item.availableStockKg}kg
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Footer: Total & Amazon-Yellow Checkout Button */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/90 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Total Produce Weight:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {cartTotalItems.toLocaleString("en-IN")} kg
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Direct Farm Freight:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        FREE (DoCA Sourced)
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-black border-t border-dashed border-gray-300 dark:border-zinc-700 pt-2 text-[#002f34] dark:text-white">
                      <span>Subtotal ({cart.length} items):</span>
                      <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-serif">
                        ₹{cartTotalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Amazon-Yellow Proceed to Checkout Button */}
                  <Button
                    onClick={openCheckoutWizard}
                    className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black font-extrabold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] text-sm flex items-center justify-center gap-2 border border-[#fcd200] cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-black" />
                    <span>{`Proceed to Checkout (${cart.length} items)`}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. CHECKOUT WIZARD */}
      {showCheckoutWizard && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-[#fffdf7] dark:bg-zinc-900 shadow-2xl sm:rounded-3xl border border-amber-100 dark:border-zinc-800">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-amber-100 dark:border-zinc-800 bg-[#fffdf7] dark:bg-zinc-900 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  FarmFresh checkout
                </p>
                <h2 className="text-xl font-black text-emerald-950 dark:text-zinc-100 font-serif">
                  Complete your order
                </h2>
              </div>
              <button
                onClick={() => setShowCheckoutWizard(false)}
                className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 dark:text-zinc-400 cursor-pointer transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-5 pt-5">
              <div className="flex items-center gap-2">
                {["Address", "Delivery", "Payment", "Review"].map((label, index) => (
                  <div key={label} className="flex flex-1 items-center gap-2">
                    <span
                      className={`grid size-7 place-items-center rounded-full text-xs font-black transition ${checkoutStep >= index + 1 ? "bg-emerald-700 dark:bg-emerald-600 text-white" : "bg-stone-200 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400"}`}
                    >
                      {checkoutStep > index + 1 ? (
                        <Check className="size-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="hidden text-xs font-bold text-emerald-900 dark:text-zinc-200 sm:inline">
                      {label}
                    </span>
                    {index < 3 && (
                      <span className="h-px flex-1 bg-stone-200 dark:bg-zinc-800" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              {/* Step 1: Address */}
              {checkoutStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-emerald-950 dark:text-zinc-100">
                      Delivery address
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">
                      Tell us where to bring fresh produce.
                    </p>
                  </div>
                  {currentUser?.buyerProfile?.deliveryAddress && (
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-teal-50 dark:bg-zinc-800 text-[11px] font-bold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Pre-filled from {currentUser.name}&apos;s saved FarmFresh Gold account</span>
                    </div>
                  )}
                  {addressError && (
                    <p className="rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-xs font-semibold text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      {addressError}
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["fullName", "Full name *"],
                        ["phone", "Phone *"],
                        ["addressLine1", "House / street / village *"],
                        ["addressLine2", "Landmark (optional)"],
                        ["city", "City / district *"],
                        ["state", "State *"],
                        ["pincode", "Pincode *"],
                      ] as const
                    ).map(([field, label]) => (
                      <label
                        key={field}
                        className={
                          field.includes("addressLine") ? "sm:col-span-2" : ""
                        }
                      >
                        <span className="mb-1 block text-xs font-bold text-emerald-900 dark:text-zinc-300">
                          {label}
                        </span>
                        <Input
                          value={deliveryAddress[field]}
                          onChange={(event) =>
                            setDeliveryAddress((current) => ({
                              ...current,
                              [field]: event.target.value,
                            }))
                          }
                          className="border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={continueFromAddress}
                      className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Continue <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Delivery Mode */}
              {checkoutStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-extrabold text-emerald-950 dark:text-zinc-100">
                      Delivery mode
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">
                      Pickup is free, or choose a farm logistics partner and
                      rider.
                    </p>
                  </div>
                  <button
                    onClick={() => setDeliveryMode("self")}
                    className={`w-full rounded-xl border-2 p-4 text-left transition cursor-pointer ${deliveryMode === "self" ? "border-emerald-700 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-stone-50 dark:hover:bg-zinc-800"}`}
                  >
                    <p className="font-bold text-emerald-950 dark:text-zinc-100">
                      Self pickup{" "}
                      <span className="float-right text-emerald-700 dark:text-emerald-400">
                        Free
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                      Collect from the farm collection point.
                    </p>
                  </button>
                  {DELIVERY_PARTNERS.map((partner) => (
                    <button
                      key={partner.id}
                      onClick={() => choosePartner(partner.id)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition cursor-pointer ${deliveryMode === "partner" && selectedPartner === partner.id ? "border-emerald-700 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-stone-50 dark:hover:bg-zinc-800"}`}
                    >
                      <p className="font-bold text-emerald-950 dark:text-zinc-100">
                        {partner.name}{" "}
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          ★ {partner.rating}
                        </span>
                        <span className="float-right text-emerald-700 dark:text-emerald-400">
                          {partner.fee ? `₹${partner.fee}` : "Free"}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                        Estimated delivery: {partner.eta}
                      </p>
                    </button>
                  ))}

                  {deliveryMode === "partner" && (
                    <div className="rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50/60 dark:bg-zinc-800/90 p-3">
                      <div className="mb-2">
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-amber-300">
                          Select your rider
                        </p>
                        <p className="text-[11px] text-stone-600 dark:text-zinc-400">
                          Available for {chosenPartner?.name}; one is assigned
                          to your order.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {availableRiders.map((rider) => (
                          <button
                            key={rider.id}
                            onClick={() => setSelectedRider(rider.id)}
                            className={`w-full rounded-lg border-2 p-3 text-left transition cursor-pointer ${selectedRider === rider.id ? "border-emerald-700 dark:border-emerald-500 bg-white dark:bg-zinc-900 shadow-sm" : "border-stone-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 hover:bg-white dark:hover:bg-zinc-800"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-emerald-950 dark:text-zinc-100">
                                  {rider.name}{" "}
                                  <span className="text-xs text-amber-600 dark:text-amber-400">
                                    ★ {rider.rating}
                                  </span>
                                </p>
                                <p className="mt-0.5 text-[11px] text-stone-600 dark:text-zinc-400">
                                  {rider.vehicle} · {rider.capacity}
                                </p>
                                <p className="text-[11px] text-stone-500 dark:text-zinc-500">
                                  {rider.completedTrips} completed trips ·{" "}
                                  {rider.eta}
                                </p>
                              </div>
                              <span
                                className={`mt-1 grid size-5 place-items-center rounded-full border ${selectedRider === rider.id ? "border-emerald-700 dark:border-emerald-500 bg-emerald-700 dark:bg-emerald-600 text-white" : "border-stone-300 dark:border-zinc-600"}`}
                              >
                                {selectedRider === rider.id && (
                                  <Check className="size-3" />
                                )}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutStep(1)}
                      className="border-stone-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCheckoutStep(3)}
                      className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Select Payment <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {checkoutStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-emerald-950 dark:text-zinc-100">
                      Select payment method
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">
                      Choose direct instant escrow or cash on delivery.
                    </p>
                  </div>

                  {paymentError && (
                    <p className="rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-xs font-semibold text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      {paymentError}
                    </p>
                  )}

                  {/* Payment Options Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("upi");
                        setPaymentError("");
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-2 ${paymentMethod === "upi" ? "border-emerald-700 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold" : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-stone-50 dark:hover:bg-zinc-800"}`}
                    >
                      <div className="flex items-center justify-between">
                        <QrCode className="w-5 h-5 text-emerald-700 dark:text-teal-400" />
                        {paymentMethod === "upi" && (
                          <span className="w-4 h-4 rounded-full bg-emerald-700 text-white grid place-items-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-950 dark:text-zinc-100">Instant UPI</p>
                        <p className="text-[10px] text-stone-500 dark:text-zinc-400">GPay / PhonePe</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("card");
                        setPaymentError("");
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-2 ${paymentMethod === "card" ? "border-emerald-700 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold" : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-stone-50 dark:hover:bg-zinc-800"}`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard className="w-5 h-5 text-emerald-700 dark:text-teal-400" />
                        {paymentMethod === "card" && (
                          <span className="w-4 h-4 rounded-full bg-emerald-700 text-white grid place-items-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-950 dark:text-zinc-100">Cards</p>
                        <p className="text-[10px] text-stone-500 dark:text-zinc-400">Visa / Mastercard</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("cod");
                        setPaymentError("");
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-2 ${paymentMethod === "cod" ? "border-emerald-700 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold" : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-stone-50 dark:hover:bg-zinc-800"}`}
                    >
                      <div className="flex items-center justify-between">
                        <Truck className="w-5 h-5 text-emerald-700 dark:text-teal-400" />
                        {paymentMethod === "cod" && (
                          <span className="w-4 h-4 rounded-full bg-emerald-700 text-white grid place-items-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-950 dark:text-zinc-100">Pay on Delivery</p>
                        <p className="text-[10px] text-stone-500 dark:text-zinc-400">Cash / QR</p>
                      </div>
                    </button>
                  </div>

                  {/* Payment Input Forms */}
                  {paymentMethod === "upi" && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 dark:text-zinc-100">
                          Instant UPI & Escrow
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowQrCode(!showQrCode)}
                          className="text-xs text-emerald-700 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                        >
                          {showQrCode ? "Enter UPI VPA" : "Show Instant QR Code"}
                        </button>
                      </div>

                      {showQrCode ? (
                        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50/50 dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-zinc-700 space-y-2">
                          <div className="p-3 bg-white rounded-xl shadow-md border border-gray-200">
                            <QrCode className="w-24 h-24 text-emerald-950" />
                          </div>
                          <p className="text-[11px] font-bold text-emerald-900 dark:text-zinc-300">
                            Scan using GPay, PhonePe, Paytm or any UPI App
                          </p>
                          <span className="text-[10px] text-gray-500 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border">
                            Amount: ₹{(cartTotalPrice + deliveryFee).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block">
                            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                              UPI VPA Handle *
                            </span>
                            <Input
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. buyer@okaxis"
                              className="border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 mt-1"
                            />
                          </label>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-gray-500 font-semibold">Fast Select:</span>
                            {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                              <button
                                key={app}
                                type="button"
                                onClick={() => {
                                  setSelectedUpiApp(app);
                                  setUpiId(`ramesh.kumar@${app.toLowerCase()}`);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${selectedUpiApp === app ? "bg-emerald-700 text-white border-emerald-700" : "bg-stone-100 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 border-stone-300 dark:border-zinc-600"}`}
                              >
                                {app}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 space-y-3">
                      <label className="block">
                        <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                          Cardholder Name *
                        </span>
                        <Input
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 mt-1"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                          Card Number *
                        </span>
                        <Input
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 mt-1"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                            Expiry Date *
                          </span>
                          <Input
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            placeholder="MM/YY"
                            className="border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 mt-1"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                            CVV *
                          </span>
                          <Input
                            type="password"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 mt-1"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800/90 border border-amber-200 dark:border-zinc-700 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                        <Truck className="w-4 h-4 text-amber-700" />
                        <span>Pay cash upon farm produce verification</span>
                      </div>
                      <p className="text-stone-600 dark:text-zinc-300 leading-relaxed">
                        Pay cash or scan rider&apos;s UPI QR code at your doorstep after inspecting crate weight and crop freshness. Note: COD orders incur a nominal ₹20 cash handling charge.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutStep(2)}
                      className="border-stone-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={continueFromPayment}
                      className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Review Order <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {checkoutStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-emerald-950 dark:text-zinc-100">
                      Review your order
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">
                      One last check before we notify the farmers.
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 p-4 text-sm space-y-1">
                    <p className="font-bold text-emerald-950 dark:text-zinc-100">
                      {cart.length} item{cart.length === 1 ? "" : "s"} ·{" "}
                      {cartTotalItems.toLocaleString()} kg
                    </p>
                    <p className="text-xs text-stone-600 dark:text-zinc-300">
                      {deliveryAddress.fullName}, {deliveryAddress.addressLine1}
                      , {deliveryAddress.city}, {deliveryAddress.state} —{" "}
                      {deliveryAddress.pincode}
                    </p>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 pt-1">
                      {deliveryMode === "self"
                        ? "Self pickup (free)"
                        : `${chosenPartner?.name} · ${chosenRider?.name} (★ ${chosenRider?.rating}) · ${chosenPartner?.eta}`}
                    </p>
                    <div className="pt-1.5 flex items-center gap-1.5">
                      <span className="text-xs text-stone-500 dark:text-zinc-400">Payment:</span>
                      {paymentMethod === "cod" ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black">
                          💵 Pay cash on delivery (+₹20 COD fee)
                        </span>
                      ) : paymentMethod === "card" ? (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" /> Credit / Debit Card
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" /> Instant UPI Escrow ({selectedUpiApp})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#0b3b20] dark:bg-zinc-950 border border-emerald-800 dark:border-zinc-800 p-4 text-white space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-200 dark:text-zinc-400">
                        Farm produce
                      </span>
                      <span className="font-semibold">
                        ₹{cartTotalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-200 dark:text-zinc-400">
                          Logistics delivery
                        </span>
                        <span className="font-semibold">₹{deliveryFee}</span>
                      </div>
                    )}
                    {paymentMethod === "cod" && (
                      <div className="flex justify-between text-sm text-amber-300">
                        <span>COD handling charge</span>
                        <span className="font-semibold">₹20</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between text-lg font-black border-t border-emerald-800 dark:border-zinc-800 pt-2">
                      <span>Total</span>
                      <span className="text-amber-300">
                        ₹
                        {(cartTotalPrice + deliveryFee + (paymentMethod === "cod" ? 20 : 0)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutStep(3)}
                      className="border-stone-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleProceedCartCheckout}
                      disabled={isCheckingOutCart}
                      className="bg-[#ffd814] hover:bg-[#f7ca00] font-black text-emerald-950 shadow-md cursor-pointer"
                    >
                      {isCheckingOutCart ? "Placing..." : "Place order"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. ORDER TRACKING */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 flex items-center justify-center text-3xl mx-auto shadow-sm border border-green-300 dark:border-green-800">
              🎉
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Multi-Farmer Order Placed!
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Order Ref:{" "}
                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                  {placedOrder.orderId}
                </span>
              </p>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-200 dark:border-green-900 text-xs space-y-1.5">
              <div className="flex justify-between text-green-900 dark:text-green-300 font-bold">
                <span>Total Aggregated Produce:</span>
                <span>{placedOrder.totalKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-green-900 dark:text-green-300 font-bold">
                <span>Total Escrow Amount:</span>
                <span>₹{placedOrder.totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-green-800 dark:text-green-400 pt-1 border-t border-green-200 dark:border-green-900">
                🌱 Farmers have been notified for pre-dawn batch packaging.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800/80">
              <div className="grid grid-cols-5 gap-1 p-3 text-center text-[9px] font-bold text-emerald-950 dark:text-zinc-200">
                {[
                  "Order Placed",
                  "Picked Up",
                  "In Transit",
                  "Out for Delivery",
                  "Delivered",
                ].map((status, index) => (
                  <div key={status}>
                    <span
                      className={`mx-auto grid size-6 place-items-center rounded-full ${index === 0 ? "bg-emerald-700 text-white" : "bg-stone-200 dark:bg-zinc-700 text-stone-500 dark:text-zinc-400"}`}
                    >
                      {index === 0 ? <Check className="size-3" /> : index + 1}
                    </span>
                    <p className="mt-1 leading-tight">{status}</p>
                    <p className="font-normal text-stone-500 dark:text-zinc-400">
                      {new Date(
                        placedOrder.placedAt.getTime() +
                          [0, 10, 30, 45, 90][index] * 60000,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-emerald-100 dark:bg-emerald-950/60">
                <div className="h-full w-1/5 bg-emerald-600" />
              </div>
              <iframe
                title="Farm pickup and delivery map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.12%2C28.58%2C77.28%2C28.68&amp;layer=mapnik&amp;marker=28.6139%2C77.209"
                className="h-36 w-full border-0 opacity-90"
                loading="lazy"
              />
            </div>
            {placedOrder.partner && (
              <div className="rounded-xl bg-amber-50 dark:bg-zinc-800/90 border border-amber-200 dark:border-zinc-700 p-3 text-xs text-emerald-950 dark:text-zinc-200">
                <p className="font-black">
                  {placedOrder.partner.name} · ★ {placedOrder.partner.rating}
                </p>
                {placedOrder.rider && (
                  <>
                    <p className="mt-1 font-bold">
                      Your rider: {placedOrder.rider.name} · ★{" "}
                      {placedOrder.rider.rating}
                    </p>
                    <p className="text-gray-600 dark:text-zinc-400">
                      {placedOrder.rider.vehicle} · {placedOrder.rider.capacity}{" "}
                      · {placedOrder.rider.completedTrips} completed trips
                    </p>
                    <a
                      className="mt-1 inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400"
                      href={`tel:${placedOrder.rider.phone}`}
                    >
                      <Phone className="size-3" />
                      Call {placedOrder.rider.name}
                    </a>
                  </>
                )}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setPlacedOrder(null)}
                className="flex-1 bg-[#002f34] dark:bg-teal-600 text-white text-xs font-bold"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}



      {/* 8. OLX DETAIL MODAL + MULTI-SELLER COMPARISON VIEW */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-glass-backdrop flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/70 dark:bg-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase bg-[#002f34] dark:bg-teal-700 text-white px-2.5 py-0.5 rounded">
                  {selectedListing.category}
                </span>
                <span className="text-xs text-gray-700 dark:text-zinc-200 font-bold">
                  {selectedListing.cropName}
                </span>
                <span className="text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded font-bold">
                  {selectedListing.allSellersInCrop.length} Verified Farmers
                  Selling
                </span>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-zinc-900">
              {/* Top Overview: Image + Produce Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Image */}
                <div className="md:col-span-5 space-y-3">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden relative bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <img
                      src={selectedListing.cropImage}
                      alt={selectedListing.cropName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Mandi Benchmark: ₹{selectedListing.mandiBenchmarkPrice}/kg
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {selectedListing.cropDescription}
                  </p>
                </div>

                {/* Selected Seller Snapshot & Direct Actions */}
                <div className="md:col-span-7 space-y-4">
                  {activeSellerInModal && (
                    <div className="p-4 bg-teal-50/40 dark:bg-zinc-800/80 rounded-xl border border-teal-200 dark:border-zinc-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={activeSellerInModal.farmerName}
                            className="w-12 h-12 border-2 border-teal-600 text-sm shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                                {activeSellerInModal.farmerName}
                              </h4>
                              <ShieldCheck className="w-4 h-4 text-teal-600 fill-teal-100 dark:fill-teal-950" />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                              ⭐ {activeSellerInModal.rating} ·{" "}
                              {activeSellerInModal.grade} •{" "}
                              {activeSellerInModal.totalSales}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-2xl font-black text-[#002f34] dark:text-teal-300 font-serif">
                            ₹{activeSellerInModal.pricePerKg}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-zinc-400 block">
                            / kg
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-teal-100 dark:border-zinc-700 py-2">
                        <div>
                          <span className="text-gray-500 dark:text-zinc-400 block">
                            Variety
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {activeSellerInModal.variety}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-zinc-400 block">
                            Available Stock
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {activeSellerInModal.availableStockKg.toLocaleString(
                              "en-IN",
                            )}{" "}
                            kg
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={(e) => {
                            addToCart(
                              selectedListing,
                              activeSellerInModal,
                              25,
                              e,
                            );
                          }}
                          className="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs cursor-pointer shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                          <span>Add 25kg to Cart</span>
                        </Button>
                        <Button
                          onClick={() => {
                            const listing = selectedListing;
                            const seller = activeSellerInModal;
                            setSelectedListing(null);
                            handleOpenBulkBuy(listing, seller);
                          }}
                          className="flex-1 bg-[#002f34] hover:bg-[#003d44] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs cursor-pointer"
                        >
                          📦 Buy in Bulk (Tons)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Seller Comparison Table (Compare All Farmers for this Produce) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-[#002f34] dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>
                    Compare All {selectedListing.allSellersInCrop.length}{" "}
                    Verified Farmers for {selectedListing.cropName}
                  </span>
                </h4>

                <div className="space-y-2">
                  {selectedListing.allSellersInCrop.map((seller) => {
                    const isSelected =
                      activeSellerInModal?.sellerId === seller.sellerId;
                    return (
                      <div
                        key={seller.sellerId}
                        onClick={() => setActiveSellerInModal(seller)}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-4 transition cursor-pointer ${
                          isSelected
                            ? "bg-teal-50/70 border-teal-500 dark:bg-zinc-800/90 dark:border-teal-400 shadow-xs"
                            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={seller.farmerName}
                            className="w-10 h-10 rounded-lg border border-gray-200 text-xs dark:border-zinc-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-gray-900 dark:text-white">
                                {seller.farmerName}
                              </span>
                              <span className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 px-1.5 py-0.2 rounded border border-gray-200 dark:border-zinc-700">
                                {seller.grade}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                              {seller.location} • ⭐ {seller.rating}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="text-base font-black text-[#002f34] dark:text-teal-300">
                              ₹{seller.pricePerKg} / kg
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">
                              Stock: {seller.availableStockKg.toLocaleString()}{" "}
                              kg
                            </span>
                          </div>

                          <Button
                            size="sm"
                            onClick={(e) => {
                              addToCart(selectedListing, seller, 25, e);
                            }}
                            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs cursor-pointer shadow-xs"
                          >
                            + Cart
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/90 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedListing(null)}
                className="border-gray-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Close View
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    alert(
                      `Calling Farmer ${activeSellerInModal?.farmerName} at ${activeSellerInModal?.phone}`,
                    )
                  }
                  className="text-xs flex items-center gap-1 border-teal-700 dark:border-teal-500 text-teal-800 dark:text-teal-300 dark:hover:bg-teal-950/40"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Farmer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. DIRECT SINGLE BUY MODAL */}
      {orderingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                  {orderSuccess
                    ? "🎉 Direct Farm Order Placed!"
                    : purchaseMode === "bulk"
                      ? "📦 Bulk Wholesale Procurement"
                      : "🛒 Direct Retail Purchase"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {orderingItem.listing.cropName} from{" "}
                  <strong className="text-gray-800 dark:text-zinc-200">
                    {orderingItem.seller.farmerName}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setOrderingItem(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!orderSuccess ? (
              <div className="space-y-4">
                {/* Purchase Mode Switcher */}
                <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setPurchaseMode("retail");
                      setPurchaseQuantity(25);
                    }}
                    className={`flex-1 py-1 text-xs font-bold rounded transition cursor-pointer ${
                      purchaseMode === "retail"
                        ? "bg-[#002f34] dark:bg-teal-600 text-white shadow-xs"
                        : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    🛒 Retail Buy (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPurchaseMode("bulk");
                      setPurchaseQuantity(1000);
                    }}
                    className={`flex-1 py-1 text-xs font-bold rounded transition cursor-pointer ${
                      purchaseMode === "bulk"
                        ? "bg-amber-400 text-emerald-950 shadow-xs"
                        : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    📦 Bulk Sourcing (Tons / Discounts)
                  </button>
                </div>

                {/* Seller Quick Info */}
                <div className="p-3 bg-teal-50/50 dark:bg-zinc-800/80 rounded-lg border border-teal-100 dark:border-zinc-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={orderingItem.seller.farmerName}
                      className="w-8 h-8 rounded-full border border-gray-200 text-[10px] dark:border-zinc-700"
                    />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {orderingItem.seller.farmerName}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-zinc-400">
                        {orderingItem.seller.grade} • ⭐{" "}
                        {orderingItem.seller.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-teal-800 dark:text-teal-300">
                      ₹{orderingItem.seller.pricePerKg} / kg
                    </span>
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-800 dark:text-zinc-200">
                      Quantity ({purchaseMode === "bulk" ? "in kg / Ton" : "kg"}
                      )
                    </span>
                    <span className="text-teal-700 dark:text-teal-400 font-bold">
                      {purchaseQuantity.toLocaleString("en-IN")} kg
                      {purchaseMode === "bulk" &&
                        purchaseQuantity >= 1000 &&
                        ` (${(purchaseQuantity / 1000).toFixed(1)} Tons)`}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={orderingItem.seller.availableStockKg}
                    value={purchaseQuantity}
                    onChange={(e) =>
                      setPurchaseQuantity(Number(e.target.value))
                    }
                    className="font-bold text-base bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100"
                  />

                  {/* Bulk Quick-Preset Chips */}
                  {purchaseMode === "bulk" && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <button
                        type="button"
                        onClick={() => setPurchaseQuantity(500)}
                        className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 px-2 py-1 rounded cursor-pointer"
                      >
                        500 kg (5% Off)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPurchaseQuantity(1000)}
                        className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 px-2 py-1 rounded cursor-pointer"
                      >
                        1 Ton (1,000 kg)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPurchaseQuantity(2500)}
                        className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 px-2 py-1 rounded cursor-pointer"
                      >
                        2.5 Tons
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/80 rounded-lg border border-gray-200 dark:border-zinc-700 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-zinc-300">
                    <span>Base Amount:</span>
                    <span>₹{rawPrice.toLocaleString("en-IN")}</span>
                  </div>
                  {isBulkDiscount && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                      <span>
                        Bulk Discount ({orderingItem.seller.bulkDiscountPercent}
                        %):
                      </span>
                      <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between text-amber-700 dark:text-amber-400 font-bold">
                      <span>COD Handling Fee:</span>
                      <span>+ ₹20</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 dark:border-zinc-700 pt-1.5 font-extrabold text-sm text-[#002f34] dark:text-teal-300">
                    <span>Total Direct Payable:</span>
                    <span>₹{(finalPayable + (paymentMethod === "cod" ? 20 : 0)).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Compact Payment Selector for Direct Buy */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                    Select Payment Method
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer text-xs font-bold ${paymentMethod === "upi" ? "bg-teal-50 dark:bg-zinc-800 border-teal-600 text-teal-900 dark:text-teal-300" : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-gray-100"}`}
                    >
                      📱 UPI Escrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer text-xs font-bold ${paymentMethod === "card" ? "bg-teal-50 dark:bg-zinc-800 border-teal-600 text-teal-900 dark:text-teal-300" : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-gray-100"}`}
                    >
                      💳 Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer text-xs font-bold ${paymentMethod === "cod" ? "bg-teal-50 dark:bg-zinc-800 border-teal-600 text-teal-900 dark:text-teal-300" : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-gray-100"}`}
                    >
                      💵 COD (+₹20)
                    </button>
                  </div>
                </div>

                {/* Place Order CTA */}
                <Button
                  onClick={handleConfirmOrder}
                  disabled={isOrdering || purchaseQuantity <= 0}
                  className="w-full bg-[#002f34] hover:bg-[#003d44] dark:bg-teal-600 dark:hover:bg-teal-500 text-white py-3 font-bold text-sm cursor-pointer"
                >
                  {isOrdering
                    ? "Placing Order..."
                    : "Confirm & Place Direct Order"}
                </Button>
              </div>
            ) : (
              /* Success & Logistics Screen */
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/40 rounded-lg text-xs space-y-2 border border-green-200 dark:border-green-800">
                  <div className="flex justify-between font-bold text-green-900 dark:text-green-200">
                    <span>Order Reference:</span>
                    <span className="font-mono">{orderSuccess.orderId}</span>
                  </div>
                  <div className="flex justify-between text-green-800 dark:text-green-300">
                    <span>Quantity:</span>
                    <span>{orderSuccess.quantityKg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center text-green-800 dark:text-green-300">
                    <span>Payment Mode:</span>
                    {orderSuccess.paymentMethod === "cod" ? (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black">
                        💵 Payable via COD on Delivery
                      </span>
                    ) : orderSuccess.paymentMethod === "card" ? (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" /> Paid via Credit/Debit Card
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" /> Paid via Instant UPI Escrow
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-green-800 dark:text-green-300 font-bold border-t border-green-200 dark:border-green-900 pt-1.5">
                    <span>Total Paid/Payable:</span>
                    <span>
                      ₹{orderSuccess.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Logistics Rider Dispatch */}
                {!riderInfo ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-center space-y-2.5">
                    <p className="text-xs text-blue-900 dark:text-blue-200 font-bold">
                      🛵 Need mini-truck or auto pickup from{" "}
                      {orderSuccess.seller.location}?
                    </p>
                    <Button
                      onClick={handleAssignRider}
                      disabled={isAssigningRider}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      {isAssigningRider
                        ? "Finding Nearest Vehicle..."
                        : "⚡ Dispatch Agri Logistics Rider"}
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-sm">
                      <Truck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Agri-Logistics Partner Dispatched!</span>
                    </div>
                    <div className="text-xs text-teal-800 dark:text-teal-300 space-y-1">
                      <p>
                        Driver:{" "}
                        <span className="font-bold">{riderInfo.riderName}</span>
                      </p>
                      <p>
                        Vehicle:{" "}
                        <span className="font-bold">{riderInfo.vehicle}</span>
                      </p>
                      <p>
                        Estimated Arrival:{" "}
                        <span className="font-bold">
                          {riderInfo.etaMinutes} mins
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href="/rider/deliveries" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full text-xs border-gray-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      View Logistics
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setOrderingItem(null)}
                    className="flex-1 bg-[#002f34] dark:bg-teal-600 text-white text-xs font-bold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. MY ORDERS MODAL */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 bg-glass-backdrop flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header Ribbon */}
            <div className="bg-[#002f34] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
                  <Package className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-serif text-white">
                    My FarmFresh Orders
                  </h3>
                  <p className="text-xs text-amber-300 font-medium">
                    Live dispatch status, 5-step milestone tracking & order history
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Controls */}
            <div className="flex border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/60 px-5 pt-3">
              <button
                onClick={() => setOrdersTab("active")}
                className={`pb-3 px-4 text-xs font-black transition cursor-pointer border-b-2 flex items-center gap-2 ${
                  ordersTab === "active"
                    ? "border-[#002f34] dark:border-teal-400 text-[#002f34] dark:text-teal-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400"
                }`}
              >
                <span>Active Orders</span>
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {activeOrdersCount}
                </span>
              </button>
              <button
                onClick={() => setOrdersTab("past")}
                className={`pb-3 px-4 text-xs font-black transition cursor-pointer border-b-2 flex items-center gap-2 ${
                  ordersTab === "past"
                    ? "border-[#002f34] dark:border-teal-400 text-[#002f34] dark:text-teal-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400"
                }`}
              >
                <span>Past & Delivered</span>
                <span className="bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {ordersHistory.length - activeOrdersCount}
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#f7f8f9] dark:bg-zinc-900">
              {ordersTab === "active" ? (
                ordersHistory.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-zinc-800 text-emerald-700 flex items-center justify-center text-3xl mx-auto">
                      📦
                    </div>
                    <h4 className="font-bold text-base text-gray-800 dark:text-gray-200">
                      No Active Orders Right Now
                    </h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Direct farm purchases or marketplace cart orders will show live 5-step milestone tracking here.
                    </p>
                  </div>
                ) : (
                  ordersHistory
                    .filter((o) => o.status !== "Delivered" && o.status !== "Cancelled")
                    .map((order) => {
                      const stepIndex =
                        order.status === "Confirmed"
                          ? 1
                          : order.status === "In Transit"
                          ? 3
                          : order.status === "Out for Delivery"
                          ? 4
                          : 5;

                      return (
                        <div
                          key={order.orderId}
                          className="bg-white dark:bg-zinc-800 border-2 border-emerald-800/30 dark:border-zinc-700 rounded-2xl p-4 shadow-md space-y-4"
                        >
                          {/* Card Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-700 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-[#002f34] dark:text-white font-mono">
                                  {order.orderId}
                                </span>
                                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                                  {order.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-500 block">
                                Placed on {order.placedAt.toLocaleDateString()} at {order.placedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-emerald-900 dark:text-amber-300 block">
                                ₹{order.totalPrice.toLocaleString("en-IN")}
                              </span>
                              <div className="mt-0.5">
                                {order.paymentMethod === "cod" ? (
                                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                                    💵 COD Payable on Delivery
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                                    ✓ Paid via {order.paymentMethod.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 5-Step Milestone Timeline */}
                          <div className="space-y-1 bg-stone-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-stone-200 dark:border-zinc-700">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-2">
                              Logistics Dispatch Milestone Timeline
                            </p>
                            <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
                              {[
                                "1. Placed",
                                "2. Picked Up",
                                "3. In Transit",
                                "4. Out for Delivery",
                                "5. Delivered",
                              ].map((lbl, idx) => (
                                <div key={lbl} className="space-y-1">
                                  <div
                                    className={`mx-auto grid size-6 place-items-center rounded-full text-xs font-bold ${
                                      stepIndex >= idx + 1
                                        ? "bg-emerald-700 text-white"
                                        : "bg-stone-200 dark:bg-zinc-800 text-stone-500"
                                    }`}
                                  >
                                    {stepIndex > idx + 1 ? (
                                      <Check className="size-3.5" />
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>
                                  <p className="leading-tight text-[9px]">{lbl}</p>
                                </div>
                              ))}
                            </div>
                            <div className="h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 transition-all duration-500"
                                style={{ width: `${(stepIndex / 5) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.cropName}
                                className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                              >
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={item.cropImage}
                                    alt={item.cropName}
                                    className="w-10 h-10 rounded-lg object-cover border border-amber-300"
                                  />
                                  <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">
                                      {item.cropName}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                      👨‍🌾 Farmer: {item.sellerName}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right font-bold">
                                  <span>{item.quantityKg} kg</span>
                                  <span className="text-[10px] text-gray-500 block">
                                    ₹{item.pricePerKg}/kg
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Live Dispatch Snippet with OSM Map & Rider */}
                          <div className="p-3 bg-teal-50/60 dark:bg-zinc-900 border border-teal-200 dark:border-zinc-700 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-teal-950 dark:text-teal-300 flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-teal-600" />
                                {order.deliveryPartner}
                              </span>
                              <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400">
                                ⏱️ {order.eta}
                              </span>
                            </div>

                            <iframe
                              title={`Live dispatch map for order ${order.orderId}`}
                              src="https://www.openstreetmap.org/export/embed.html?bbox=77.12%2C28.58%2C77.28%2C28.68&amp;layer=mapnik&amp;marker=28.6139%2C77.209"
                              className="h-28 w-full border border-teal-200 dark:border-zinc-700 rounded-lg opacity-90"
                              loading="lazy"
                            />

                            {order.riderInfo && (
                              <div className="flex items-center justify-between pt-1">
                                <div>
                                  <span className="font-bold text-gray-900 dark:text-white block text-[11px]">
                                    Rider: {order.riderInfo.name} (★ {order.riderInfo.rating})
                                  </span>
                                  <span className="text-[10px] text-gray-500 block">
                                    {order.riderInfo.vehicle}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`tel:${order.riderInfo.phone}`}
                                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>Call Rider</span>
                                  </a>
                                  <button
                                    onClick={() => handleCancelOrder(order.orderId)}
                                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-[10px] cursor-pointer"
                                  >
                                    Cancel Order
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                )
              ) : (
                /* Past Orders Tab */
                ordersHistory.filter((o) => o.status === "Delivered" || o.status === "Cancelled").length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 flex items-center justify-center text-3xl mx-auto">
                      📜
                    </div>
                    <h4 className="font-bold text-base text-gray-800 dark:text-gray-200">
                      No Past Order History
                    </h4>
                  </div>
                ) : (
                  ordersHistory
                    .filter((o) => o.status === "Delivered" || o.status === "Cancelled")
                    .map((order) => (
                      <div
                        key={order.orderId}
                        className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 shadow-sm space-y-3"
                      >
                        <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-700 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-gray-900 dark:text-white font-mono">
                                {order.orderId}
                              </span>
                              {order.status === "Delivered" ? (
                                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Delivered
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded">
                                  Cancelled
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 block mt-0.5">
                              {order.eta}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-gray-900 dark:text-white block">
                              ₹{order.totalPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                              {order.totalKg} kg total
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.cropName}
                              className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 dark:bg-zinc-900"
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.cropImage}
                                  alt={item.cropName}
                                  className="w-10 h-10 rounded-lg object-cover border border-amber-300"
                                />
                                <div>
                                  <span className="font-bold text-gray-900 dark:text-white block">
                                    {item.cropName}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    👨‍🌾 Farmer: {item.sellerName}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right font-bold">
                                <span>{item.quantityKg} kg</span>
                                {order.status === "Delivered" && (
                                  <button
                                    onClick={() => handleOpenRating(item.cropName, item.sellerName)}
                                    className="text-[10px] text-amber-700 dark:text-amber-400 underline block font-bold cursor-pointer mt-0.5"
                                  >
                                    ⭐ Rate Produce
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Actions: Buy Again */}
                        <div className="pt-2 border-t border-gray-100 dark:border-zinc-700 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleBuyAgain(order)}
                            className="bg-[#002f34] hover:bg-[#003d44] dark:bg-teal-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Buy Again</span>
                          </Button>
                        </div>
                      </div>
                    ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* RATE PRODUCE POPUP MODAL */}
      {ratingModalItem && (
        <div className="fixed inset-0 z-[70] bg-glass-backdrop flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-2xl mx-auto shadow-xs">
              ⭐
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Rate Produce Quality
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                How fresh were <strong>{ratingModalItem.cropName}</strong> from{" "}
                <strong>{ratingModalItem.sellerName}</strong>?
              </p>
            </div>

            {/* 5-Star Selector */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="p-1 cursor-pointer hover:scale-110 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingStars
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setRatingModalItem(null)}
                className="flex-1 text-xs border-gray-300 dark:border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs cursor-pointer"
              >
                Submit Rating
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      {reAddToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#002f34] text-amber-300 text-xs font-black px-4 py-3 rounded-full shadow-2xl border border-amber-400 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>{reAddToast}</span>
        </div>
      )}

      {ratingSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white text-xs font-black px-4 py-3 rounded-full shadow-2xl border border-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>{ratingSuccessToast}</span>
        </div>
      )}

      {/* 10. FOOTER */}
      <Footer />
    </div>
  );
}
