export const orders = [
  {
    _id: "662ce5a1e4b0a1b2c3d4e5f0",
    userId: "662ce5a1e4b0a1b2c3d4e5a1", // Example User ObjectId
    status: "delivered",
    items: [
      {
        productId: "662ce5a1e4b0a1b2c3d4e5p1", // Example Product ObjectId
        productTitle: "Essence Mascara Lash Princess",
        quantity: 2,
        price: 9.99,
        images: ["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp"]
      }
    ],
    totalAmount: 19.98,
    shippingAddress: {
      address: "626 Main Street",
      city: "Phoenix",
      state: "Mississippi",
      stateCode: "MS",
      postalCode: "29112",
      coordinates: {
        lat: -77.16213,
        lng: -92.084824
      },
      country: "United States"
    },
    shippingInstructions: "Please leave at the front door.",
    paymentMethod: "Credit Card",
    paymentStatus: "completed",
    transactionId: "TXN_123456789",
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-22T14:30:00Z"
  },
  {
    _id: "662ce5a1e4b0a1b2c3d4e5f1",
    userId: "662ce5a1e4b0a1b2c3d4e5a1",
    status: "shipped",
    items: [
      {
        productId: "662ce5a1e4b0a1b2c3d4e5p2",
        productTitle: "Eyeshadow Palette with Mirror",
        quantity: 1,
        price: 19.99,
        images: ["https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp"]
      }
    ],
    totalAmount: 19.99,
    shippingAddress: {
      address: "626 Main Street",
      city: "Phoenix",
      state: "Mississippi",
      stateCode: "MS",
      postalCode: "29112",
      coordinates: {
        lat: -77.16213,
        lng: -92.084824
      },
      country: "United States"
    },
    paymentMethod: "PayPal",
    paymentStatus: "completed",
    createdAt: "2026-04-25T08:15:00Z",
    updatedAt: "2026-04-25T11:00:00Z"
  },
  {
    _id: "662ce5a1e4b0a1b2c3d4e5f2",
    userId: "662ce5a1e4b0a1b2c3d4e5a2", // Different User
    status: "pending",
    items: [
      {
        productId: "662ce5a1e4b0a1b2c3d4e5p3",
        productTitle: "Powder Canister",
        quantity: 1,
        price: 14.99,
        images: ["https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"]
      }
    ],
    totalAmount: 14.99,
    shippingAddress: {
      address: "385 Fifth Street",
      city: "Houston",
      state: "Alabama",
      stateCode: "AL",
      postalCode: "38807",
      coordinates: {
        lat: 22.815468,
        lng: 115.608581
      },
      country: "United States"
    },
    paymentMethod: "Cash on Delivery",
    paymentStatus: "pending",
    createdAt: "2026-04-27T09:00:00Z",
    updatedAt: "2026-04-27T09:00:00Z"
  }
];
