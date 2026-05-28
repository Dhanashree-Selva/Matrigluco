export const DOCTORS = [
    {
        id: 1,
        name: "Dr. Sarah Mitchell",
        specialization: "Gynecologist & OB-GYN",
        rating: "4.9",
        reviews: "248",
        image: "https://i.pravatar.cc/150?img=45",
        experience: "15 yrs",
        price: "$60",
        availability: "Available Tomorrow",
        status: "Online"
    },
    {
        id: 2,
        name: "Dr. James Wilson",
        specialization: "Endocrinologist",
        rating: "4.8",
        reviews: "182",
        image: "https://i.pravatar.cc/150?img=11",
        experience: "12 yrs",
        price: "$75",
        availability: "Available Today",
        status: "Busy"
    },
    {
        id: 3,
        name: "Dr. Elena Rodriguez",
        specialization: "Maternal Health Specialist",
        rating: "5.0",
        reviews: "310",
        image: "https://i.pravatar.cc/150?img=32",
        experience: "18 yrs",
        price: "$90",
        availability: "Available Mon, 10 AM",
        status: "Online"
    },
    {
        id: 4,
        name: "Dr. Robert Chen",
        specialization: "General Physician",
        rating: "4.7",
        reviews: "156",
        image: "https://i.pravatar.cc/150?img=13",
        experience: "10 yrs",
        price: "$45",
        availability: "Available Today",
        status: "Offline"
    }
];

export const UPCOMING_APPOINTMENTS = [
    {
        id: 1,
        docName: "Dr. James Wilson",
        specialization: "Endocrinologist",
        date: "Tomorrow, 10:00 AM",
        type: "Video",
        status: "upcoming",
        img: "https://i.pravatar.cc/150?img=11"
    },
    {
        id: 2,
        docName: "Dr. Sarah Mitchell",
        specialization: "Gynecologist",
        date: "Aug 22, 2026, 02:30 PM",
        type: "Chat",
        status: "reschedule",
        img: "https://i.pravatar.cc/150?img=45"
    },
    {
        id: 3,
        docName: "Dr. Elena Rodriguez",
        specialization: "Health Specialist",
        date: "Aug 15, 2026, 11:00 AM",
        type: "In-Person",
        status: "completed",
        img: "https://i.pravatar.cc/150?img=32"
    }
];

export const APPOINTMENTS = [
    {
        id: 1,
        doctor: "Dr. James Wilson",
        specialty: "Endocrinologist",
        type: "Video Call",
        date: "Tomorrow",
        time: "10:00 AM",
        status: "upcoming",
        doctorImage: "https://i.pravatar.cc/150?img=11"
    },
    {
        id: 2,
        doctor: "Dr. Sarah Mitchell",
        specialty: "Gynecologist",
        type: "In-Person",
        date: "Aug 22, 2026",
        time: "02:30 PM",
        status: "reschedule",
        doctorImage: "https://i.pravatar.cc/150?img=45"
    },
    {
        id: 3,
        doctor: "Dr. Elena Rodriguez",
        specialty: "Health Specialist",
        type: "Video Call",
        date: "Aug 15, 2026",
        time: "11:00 AM",
        status: "completed",
        doctorImage: "https://i.pravatar.cc/150?img=32"
    }
];

export const MOCK_CHATS = [
    { id: 1, sender: 'doc', text: "Hello! I've reviewed your fasting glucose logs from this week. They look stable.", time: "09:30 AM" },
    { id: 2, sender: 'user', text: "That's a relief. I was concerned about the spike after breakfast yesterday.", time: "09:32 AM" },
    { id: 3, sender: 'user', text: "It was 162 mg/dL. Should I adjust my insulin dose?", time: "09:33 AM" },
    { id: 4, sender: 'doc', text: "For now, let's keep the dosage the same. Try adding more fiber to your breakfast and monitor for 2 more days.", time: "09:35 AM" },
    { id: 5, sender: 'user', text: "Okay, I'll add more spinach and oats. And what about my prenatal vitamins?", time: "09:36 AM" },
    { id: 6, sender: 'doc', text: "Keep taking them. The iron content is important for your hemoglobin levels right now.", time: "09:38 AM" },
];

export const PRESCRIPTIONS = [
    {
        id: 1,
        date: "Aug 15, 2026",
        doctor: "Dr. James Wilson",
        hospital: "City Maternity Center",
        items: [
            { name: "Metformin 500mg", instruction: "Take 1 tablet twice daily with meals" },
            { name: "Prenatal Vitamins", instruction: "1 capsule daily after breakfast" }
        ],
    },
    {
        id: 2,
        date: "July 28, 2026",
        doctor: "Dr. Sarah Mitchell",
        hospital: "Grace Women's Clinic",
        items: [
            { name: "Iron Supplement 65mg", instruction: "Take on empty stomach for better absorption" },
            { name: "Vitamin D3 2000 IU", instruction: "1 softgel daily" }
        ],
    }
];
