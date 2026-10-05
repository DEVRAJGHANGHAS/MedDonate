# MedDonate

**Give medicine a second life.**

MedDonate is a web platform that connects people who have unused, unexpired medicine with verified NGOs and clinics that can put it to use — reducing medicine waste, easing unsafe disposal of expired drugs, and improving access to medicine for people who can't afford it.

---

## The Problem

- Households and pharmacies regularly throw away unexpired, usable medicine.
- Many people cannot afford essential medicines.
- Expired medicines are often disposed of unsafely (flushed, binned, or burned), polluting water and soil.

## The Solution

A simple two-sided platform:

- **Donors** list unused, unexpired medicine with photo proof and location.
- **NGOs / Clinics** (verified) browse nearby listings and accept or reject them.
- Accepted donations move both parties into a private chat to coordinate pickup.

---

## Features

### Donor
- Sign up and log in via mobile OTP
- Basic profile: name, age, location
- List a medicine: name, expiry date, batch number, front & back photos, quantity, location
- Automatic block on expired medicine at submission
- Track listing status: Pending / Accepted / Rejected (with reason)
- Chat with the accepting NGO/clinic once a donation is accepted

### NGO / Clinic
- Sign up via mobile OTP **and** email verification
- Submit organisation details: name, registration/license number, address, premises photo, license document, contact person, category
- Goes under **admin verification** before appearing to donors
- Verified badge once approved
- Dashboard with a **service range** setting (e.g. within 10 km / 25 km / entire city)
- Browse incoming donation listings filtered by range
- Accept or reject listings — rejection requires a reason, visible to the donor
- Chat with the donor after accepting, plus a **call** option (NGO/clinic side only)

### Platform-wide
- Location-based matching between donors and NGOs/clinics
- Expiry-date validation on every listing
- Admin review queue for NGO/clinic verification
- In-app notifications on accept/reject

---

## Why This Beats Offline Donation Drives

| Factor | Offline | MedDonate |
|---|---|---|
| Reach | Limited to one neighbourhood or NGO's contacts | Connects donors and NGOs across a whole city/region |
| Verification | Hard to confirm an NGO is genuine | NGOs/clinics verified once, shown with a trust badge |
| Speed | Manual calls and visits take days | Listings can be matched within minutes |
| Tracking | No record of what was donated or to whom | Every donation is logged |
| Disposal guidance | People guess or don't bother | Clear guidance available anytime |
| Cost | Collection drives cost money and volunteers | Scales with near-zero marginal cost |

---

## Tech Stack (suggested)

| Layer | Tools |
|---|---|
| Frontend (Web) | React or HTML/CSS/JS |
| Mobile (future) | React Native or Flutter |
| Backend | Node.js (Express) or Python (Django/Flask) |
| Database | Firebase Firestore or MongoDB |
| Authentication | Firebase Auth (mobile OTP + email verification) |
| Image storage | Firebase Storage or AWS S3 |
| Location / distance | Google Maps Geocoding API + Haversine formula, or Firestore geohashing |
| Chat | Firebase Realtime Database or Socket.io |
| Calling | Twilio Voice / Exotel (number masking) |
| Hosting | Vercel/Netlify (frontend) + Render/Railway (backend) |

---

## Project Status

This repository currently contains the **frontend prototype**, including:
- Homepage with donor/NGO role selection
- Donor sign-up, profile, dashboard, and medicine-listing flow
- NGO/clinic sign-up, verification flow, and review dashboard
- In-app chat with NGO-only calling

Backend, database, and real OTP/SMS integration are not yet implemented — see [Tech Stack](#tech-stack-suggested) for the intended approach.

## Getting Started

## Roadmap

- [ ] Backend API and database integration
- [ ] Real OTP (SMS) and email verification
- [ ] Admin panel for NGO/clinic verification
- [ ] Location-based geo-matching
- [ ] Real-time chat and masked calling
- [ ] AI chatbot for safe disposal of expired medicine
- [ ] Native mobile app


## Author

Capstone project by **Devraj ghanghas and lakshya rathee**.
