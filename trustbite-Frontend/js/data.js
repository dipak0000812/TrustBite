// Dummy Data for TrustBite Platform

const messData = [
    {
        id: 1,
        name: "Annapurna Mess",
        location: "Kothrud, Pune",
        address: "Shop 5, Karve Road, Kothrud, Pune - 411038",
        latitude: 18.5074,
        longitude: 73.8077,
        distance: 0.8,
        foodType: "veg",
        mealTypes: ["lunch", "dinner"],
        pricing: {
            monthly: 3200,
            weekly: 850,
            daily: 50
        },
        trustScore: 85,
        hygieneScore: 92,
        rating: 4.5,
        reviewCount: 120,
        subscriberCount: 150,
        capacity: 200,
        experience: 10,
        verified: true,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        images: [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"
        ],
        description: "We serve authentic Gujarati homestyle meals with focus on hygiene and taste. Running since 2018, we have 150+ happy subscribers from nearby colleges.",
        tags: ["Gujarati", "Home-style", "Hygienic"],
        menu: [
            {
                day: "Monday",
                breakfast: ["Poha", "Tea"],
                lunch: ["Roti", "Dal", "Rice", "Sabji", "Salad"],
                dinner: ["Roti", "Paneer Curry", "Rice", "Sweet"]
            },
            {
                day: "Tuesday",
                breakfast: ["Upma", "Tea"],
                lunch: ["Roti", "Sambar", "Rice", "Sabji"],
                dinner: ["Roti", "Mix Veg", "Rice", "Raita"]
            },
            {
                day: "Wednesday",
                breakfast: ["Paratha", "Curd", "Tea"],
                lunch: ["Roti", "Rajma", "Rice", "Aloo Sabji"],
                dinner: ["Roti", "Dal Fry", "Rice", "Papad"]
            },
            {
                day: "Thursday",
                breakfast: ["Idli", "Sambar", "Tea"],
                lunch: ["Roti", "Chole", "Rice", "Bhindi"],
                dinner: ["Roti", "Kadhi", "Rice", "Pakoda"]
            },
            {
                day: "Friday",
                breakfast: ["Dosa", "Chutney", "Tea"],
                lunch: ["Roti", "Dal Tadka", "Rice", "Gobi"],
                dinner: ["Roti", "Paneer Butter Masala", "Rice"]
            },
            {
                day: "Saturday",
                breakfast: ["Poha", "Tea"],
                lunch: ["Roti", "Palak Paneer", "Rice", "Aloo"],
                dinner: ["Roti", "Mix Dal", "Rice", "Gulab Jamun"]
            },
            {
                day: "Sunday",
                breakfast: ["Upma", "Tea"],
                lunch: ["Puri", "Chole", "Halwa", "Rice"],
                dinner: ["Roti", "Special Thali", "Rice", "Kheer"]
            }
        ],
        facilities: ["AC Dining", "Free WiFi", "RO Water", "Parcel Available", "Sanitized", "Wheelchair Access"],
        timings: [
            { meal: "Breakfast", time: "8:00 AM - 10:00 AM" },
            { meal: "Lunch", time: "12:00 PM - 2:30 PM" },
            { meal: "Dinner", time: "7:00 PM - 10:00 PM" }
        ],
        owner: {
            name: "Ramesh Patel",
            phone: "+91 98765 43210",
            email: "annapurna@gmail.com"
        },
        reviews: [
            {
                id: 1,
                userName: "Priya Sharma",
                userInitials: "PS",
                rating: 5,
                date: "2 months ago",
                verified: true,
                comment: "Excellent food quality and hygiene. The Gujarati thali reminds me of home cooking.",
                detailedRatings: { food: 5, hygiene: 5, service: 4, value: 5 },
                helpful: 24
            },
            {
                id: 2,
                userName: "Rahul Verma",
                userInitials: "RV",
                rating: 4,
                date: "1 month ago",
                verified: true,
                comment: "Good food and reasonable prices. Portion sizes could be slightly better.",
                detailedRatings: { food: 4, hygiene: 5, service: 4, value: 4 },
                helpful: 12
            }
        ]
    },
    {
        id: 2,
        name: "Krishna Mess",
        location: "Shivaji Nagar, Pune",
        address: "Lane 3, Shivaji Nagar, Pune - 411005",
        latitude: 18.5304,
        longitude: 73.8567,
        distance: 1.2,
        foodType: "both",
        mealTypes: ["breakfast", "lunch", "dinner"],
        pricing: {
            monthly: 3500,
            weekly: 900,
            daily: 55
        },
        trustScore: 78,
        hygieneScore: 85,
        rating: 4.2,
        reviewCount: 95,
        subscriberCount: 120,
        capacity: 150,
        experience: 8,
        verified: true,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        images: [
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800"
        ],
        description: "Serving delicious North Indian and South Indian meals with both veg and non-veg options.",
        tags: ["North Indian", "South Indian", "Both Veg & Non-Veg"],
        menu: [],
        facilities: ["Free WiFi", "RO Water", "Parking", "Sanitized"],
        timings: [
            { meal: "Breakfast", time: "7:00 AM - 10:00 AM" },
            { meal: "Lunch", time: "12:00 PM - 3:00 PM" },
            { meal: "Dinner", time: "7:00 PM - 10:30 PM" }
        ],
        owner: {
            name: "Suresh Kumar",
            phone: "+91 98765 43211",
            email: "krishna@gmail.com"
        },
        reviews: []
    },
    {
        id: 3,
        name: "Sagar Tiffin Service",
        location: "Aundh, Pune",
        address: "Plot 12, Aundh, Pune - 411007",
        latitude: 18.5579,
        longitude: 73.8106,
        distance: 2.5,
        foodType: "veg",
        mealTypes: ["lunch", "dinner"],
        pricing: {
            monthly: 2800,
            weekly: 750,
            daily: 45
        },
        trustScore: 88,
        hygieneScore: 90,
        rating: 4.6,
        reviewCount: 85,
        subscriberCount: 100,
        capacity: 120,
        experience: 12,
        verified: true,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
        images: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800"],
        description: "Budget-friendly vegetarian tiffin service with home-style cooking.",
        tags: ["Vegetarian", "Budget-Friendly", "Home-style"],
        menu: [],
        facilities: ["Parcel Available", "RO Water", "Sanitized"],
        timings: [
            { meal: "Lunch", time: "12:00 PM - 2:00 PM" },
            { meal: "Dinner", time: "7:30 PM - 9:30 PM" }
        ],
        owner: {
            name: "Amit Desai",
            phone: "+91 98765 43212",
            email: "sagar@gmail.com"
        },
        reviews: []
    },
    {
        id: 4,
        name: "Maharaja Meals",
        location: "Karve Nagar, Pune",
        address: "Survey No 45, Karve Nagar, Pune - 411052",
        latitude: 18.4867,
        longitude: 73.8207,
        distance: 1.8,
        foodType: "non-veg",
        mealTypes: ["lunch", "dinner"],
        pricing: {
            monthly: 4200,
            weekly: 1100,
            daily: 65
        },
        trustScore: 72,
        hygieneScore: 78,
        rating: 4.0,
        reviewCount: 68,
        subscriberCount: 80,
        capacity: 100,
        experience: 5,
        verified: false,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
        images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"],
        description: "Non-vegetarian specialties with chicken, mutton, and fish preparations.",
        tags: ["Non-Vegetarian", "Chicken", "Mutton"],
        menu: [],
        facilities: ["AC Dining", "Parking", "RO Water"],
        timings: [
            { meal: "Lunch", time: "12:30 PM - 3:00 PM" },
            { meal: "Dinner", time: "8:00 PM - 11:00 PM" }
        ],
        owner: {
            name: "Vikram Singh",
            phone: "+91 98765 43213",
            email: "maharaja@gmail.com"
        },
        reviews: []
    },
    {
        id: 5,
        name: "Pure Veg Delight",
        location: "Kothrud, Pune",
        address: "Lane 7, Kothrud, Pune - 411038",
        latitude: 18.5074,
        longitude: 73.8077,
        distance: 0.5,
        foodType: "veg",
        mealTypes: ["breakfast", "lunch", "dinner"],
        pricing: {
            monthly: 3000,
            weekly: 800,
            daily: 48
        },
        trustScore: 90,
        hygieneScore: 94,
        rating: 4.7,
        reviewCount: 145,
        subscriberCount: 180,
        capacity: 200,
        experience: 15,
        verified: true,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"],
        description: "Premium vegetarian meals with organic ingredients and traditional recipes.",
        tags: ["Vegetarian", "Organic", "Traditional"],
        menu: [],
        facilities: ["AC Dining", "Free WiFi", "RO Water", "Wheelchair Access", "Parcel Available"],
        timings: [
            { meal: "Breakfast", time: "7:30 AM - 10:00 AM" },
            { meal: "Lunch", time: "12:00 PM - 2:30 PM" },
            { meal: "Dinner", time: "7:00 PM - 10:00 PM" }
        ],
        owner: {
            name: "Rajesh Kulkarni",
            phone: "+91 98765 43214",
            email: "pureveg@gmail.com"
        },
        reviews: []
    },
    {
        id: 6,
        name: "Student's Choice Mess",
        location: "Pimpri, Pune",
        address: "Near College Square, Pimpri, Pune - 411018",
        latitude: 18.6298,
        longitude: 73.8057,
        distance: 3.2,
        foodType: "both",
        mealTypes: ["lunch", "dinner"],
        pricing: {
            monthly: 2500,
            weekly: 680,
            daily: 42
        },
        trustScore: 65,
        hygieneScore: 70,
        rating: 3.8,
        reviewCount: 52,
        subscriberCount: 60,
        capacity: 80,
        experience: 3,
        verified: false,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        images: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"],
        description: "Affordable mess service popular among college students with flexible meal plans.",
        tags: ["Budget-Friendly", "Student Special", "Flexible"],
        menu: [],
        facilities: ["WiFi", "Late Night Service"],
        timings: [
            { meal: "Lunch", time: "1:00 PM - 3:00 PM" },
            { meal: "Dinner", time: "8:00 PM - 11:00 PM" }
        ],
        owner: {
            name: "Ganesh Patil",
            phone: "+91 98765 43215",
            email: "studentschoice@gmail.com"
        },
        reviews: []
    }
];

// User Data (for localStorage)
const sampleUser = {
    id: 1,
    name: "Rahul Kumar",
    email: "rahul@email.com",
    phone: "+91 98765 43210",
    location: "Kothrud, Pune",
    role: "student",
    college: "Pune University"
};