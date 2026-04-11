import type { Template, Profile } from "./types";

const demoDesigner: Profile = {
  id: "demo-designer-1",
  user_id: "demo-user-1",
  full_name: "Alex Rivera",
  role: "designer",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

const demoDesigner2: Profile = {
  id: "demo-designer-2",
  user_id: "demo-user-2",
  full_name: "Sarah Chen",
  role: "designer",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export const SAMPLE_TEMPLATES: Template[] = [
  {
    id: "tpl-restaurant-1",
    designer_id: "demo-user-1",
    name: "Bella Cucina",
    niche: "Restaurant",
    description:
      "A warm, inviting restaurant template with hero section, menu highlights, location map, and reservation CTA. Perfect for Italian restaurants, bistros, and fine dining.",
    preview_image_url: "https://placehold.co/800x500/6366F1/white?text=Bella+Cucina",
    html_content: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{BUSINESS_NAME}}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Georgia',serif;color:#333}
.hero{background:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('{{HERO_IMAGE}}') center/cover;height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;color:white}
.hero h1{font-size:3.5rem;margin-bottom:1rem;letter-spacing:2px}
.hero p{font-size:1.2rem;opacity:0.9;max-width:600px;margin:0 auto 2rem}
.btn{background:{{COLOR_PRIMARY}};color:white;padding:14px 32px;border:none;font-size:1rem;cursor:pointer;letter-spacing:1px;text-transform:uppercase;text-decoration:none;display:inline-block}
.btn:hover{opacity:0.9}
.section{padding:80px 20px;max-width:1100px;margin:0 auto}
.section h2{font-size:2rem;text-align:center;margin-bottom:3rem;color:{{COLOR_PRIMARY}}}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem}
.feature{text-align:center;padding:2rem}
.feature h3{font-size:1.3rem;margin:1rem 0 0.5rem}
.feature p{color:#666;line-height:1.6}
.about{background:#f9f7f4;padding:80px 20px}
.about-inner{max-width:800px;margin:0 auto;text-align:center}
.about-inner p{font-size:1.1rem;line-height:1.8;color:#555}
.contact{background:{{COLOR_PRIMARY}};color:white;padding:60px 20px;text-align:center}
.contact h2{color:white;margin-bottom:1rem}
.contact p{opacity:0.9;margin-bottom:0.5rem;font-size:1.1rem}
footer{background:#1a1a1a;color:#999;padding:30px 20px;text-align:center;font-size:0.9rem}
</style>
</head>
<body>
<div class="hero">
<div>
<h1>{{BUSINESS_NAME}}</h1>
<p>{{TAGLINE}}</p>
<a href="tel:{{PHONE}}" class="btn">Reserve a Table</a>
</div>
</div>
<div class="section">
<h2>Our Specialties</h2>
<div class="features">
<div class="feature">
<div style="font-size:3rem">🍝</div>
<h3>Handmade Pasta</h3>
<p>Fresh pasta made daily with traditional recipes passed down through generations.</p>
</div>
<div class="feature">
<div style="font-size:3rem">🥩</div>
<h3>Prime Cuts</h3>
<p>Premium quality meats, grilled to perfection and served with seasonal sides.</p>
</div>
<div class="feature">
<div style="font-size:3rem">🍷</div>
<h3>Fine Wines</h3>
<p>Curated wine selection from the finest vineyards around the world.</p>
</div>
</div>
</div>
<div class="about">
<div class="about-inner">
<h2 style="font-size:2rem;margin-bottom:2rem;color:#333">About Us</h2>
<p>{{ABOUT_TEXT}}</p>
</div>
</div>
<div class="contact">
<h2>Visit Us</h2>
<p>📍 {{ADDRESS}}</p>
<p>📞 {{PHONE}}</p>
<p>🕐 {{HOURS}}</p>
</div>
<footer>
<p>&copy; 2024 {{BUSINESS_NAME}}. All rights reserved.</p>
</footer>
</body>
</html>`,
    fields: [
      { key: "BUSINESS_NAME", label: "Business name", type: "text", required: true },
      { key: "TAGLINE", label: "Tagline / Subtitle", type: "text", required: false },
      { key: "PHONE", label: "Phone number", type: "text", required: true },
      { key: "ADDRESS", label: "Address", type: "text", required: true },
      { key: "HOURS", label: "Opening hours", type: "text", required: false },
      { key: "COLOR_PRIMARY", label: "Primary color", type: "color", required: false },
      { key: "HERO_IMAGE", label: "Hero background image", type: "image", required: false },
      { key: "ABOUT_TEXT", label: "About description", type: "textarea", required: false },
    ],
    price: 0,
    is_active: true,
    downloads: 234,
    rating: 4.8,
    created_at: "2024-01-15T00:00:00Z",
    designer: demoDesigner,
  },
  {
    id: "tpl-dentist-1",
    designer_id: "demo-user-2",
    name: "BrightSmile Pro",
    niche: "Dentist",
    description:
      "Clean, professional dental practice template with service highlights, team section, testimonials, and appointment booking CTA.",
    preview_image_url: "https://placehold.co/800x500/6366F1/white?text=BrightSmile+Pro",
    html_content: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{BUSINESS_NAME}}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;color:#333}
.hero{background:linear-gradient(135deg,{{COLOR_PRIMARY}} 0%,#2563eb 100%);padding:100px 20px;text-align:center;color:white}
.hero h1{font-size:3rem;margin-bottom:1rem}
.hero p{font-size:1.2rem;opacity:0.9;max-width:600px;margin:0 auto 2rem}
.btn{background:white;color:{{COLOR_PRIMARY}};padding:14px 32px;border:none;font-size:1rem;cursor:pointer;border-radius:8px;font-weight:600;text-decoration:none;display:inline-block}
.section{padding:80px 20px;max-width:1100px;margin:0 auto}
.section h2{font-size:2rem;text-align:center;margin-bottom:3rem}
.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem}
.service{background:white;border:1px solid #e5e7eb;border-radius:12px;padding:2rem;text-align:center}
.service h3{margin:1rem 0 0.5rem;font-size:1.2rem}
.service p{color:#666;line-height:1.6;font-size:0.95rem}
.cta-section{background:#f0f9ff;padding:60px 20px;text-align:center}
.cta-section h2{margin-bottom:1rem}
.cta-section p{color:#666;margin-bottom:2rem}
.cta-btn{background:{{COLOR_PRIMARY}};color:white;padding:14px 32px;border:none;font-size:1rem;border-radius:8px;cursor:pointer;text-decoration:none;display:inline-block}
footer{background:#1a1a1a;color:#999;padding:30px 20px;text-align:center;font-size:0.9rem}
</style>
</head>
<body>
<div class="hero">
<h1>{{BUSINESS_NAME}}</h1>
<p>{{TAGLINE}}</p>
<a href="tel:{{PHONE}}" class="btn">Book Appointment</a>
</div>
<div class="section">
<h2>Our Services</h2>
<div class="services">
<div class="service"><div style="font-size:2.5rem">🦷</div><h3>General Dentistry</h3><p>Comprehensive dental exams, cleanings, and preventive care for the whole family.</p></div>
<div class="service"><div style="font-size:2.5rem">✨</div><h3>Cosmetic Dentistry</h3><p>Teeth whitening, veneers, and smile makeovers to give you the perfect smile.</p></div>
<div class="service"><div style="font-size:2.5rem">🔧</div><h3>Restorative Care</h3><p>Crowns, bridges, implants, and dentures to restore your dental health.</p></div>
<div class="service"><div style="font-size:2.5rem">👶</div><h3>Pediatric Dentistry</h3><p>Gentle, friendly dental care specially designed for children of all ages.</p></div>
</div>
</div>
<div class="cta-section">
<h2>Ready for a Brighter Smile?</h2>
<p>📍 {{ADDRESS}} &nbsp; | &nbsp; 📞 {{PHONE}}</p>
<a href="tel:{{PHONE}}" class="cta-btn">Call Now</a>
</div>
<footer><p>&copy; 2024 {{BUSINESS_NAME}}. All rights reserved.</p></footer>
</body>
</html>`,
    fields: [
      { key: "BUSINESS_NAME", label: "Practice name", type: "text", required: true },
      { key: "TAGLINE", label: "Tagline", type: "text", required: false },
      { key: "PHONE", label: "Phone number", type: "text", required: true },
      { key: "ADDRESS", label: "Address", type: "text", required: true },
      { key: "COLOR_PRIMARY", label: "Primary color", type: "color", required: false },
    ],
    price: 9.99,
    is_active: true,
    downloads: 187,
    rating: 4.6,
    created_at: "2024-02-10T00:00:00Z",
    designer: demoDesigner2,
  },
  {
    id: "tpl-gym-1",
    designer_id: "demo-user-1",
    name: "IronForge Fitness",
    niche: "Gym",
    description:
      "Bold, high-energy gym template with membership plans, class schedules, trainer spotlights, and strong CTAs.",
    preview_image_url: "https://placehold.co/800x500/0f172a/white?text=IronForge+Fitness",
    html_content: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{BUSINESS_NAME}}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Arial',sans-serif;color:#fff;background:#111}
.hero{background:linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('{{HERO_IMAGE}}') center/cover;height:90vh;display:flex;align-items:center;justify-content:center;text-align:center}
.hero h1{font-size:4rem;text-transform:uppercase;letter-spacing:3px;margin-bottom:1rem}
.hero p{font-size:1.3rem;opacity:0.8;margin-bottom:2rem}
.btn{background:{{COLOR_PRIMARY}};color:white;padding:16px 40px;border:none;font-size:1.1rem;cursor:pointer;text-transform:uppercase;letter-spacing:2px;font-weight:bold;text-decoration:none;display:inline-block}
.section{padding:80px 20px;max-width:1100px;margin:0 auto}
.section h2{font-size:2.5rem;text-transform:uppercase;text-align:center;margin-bottom:3rem;color:{{COLOR_PRIMARY}}}
.plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem}
.plan{background:#1a1a1a;border:2px solid #333;padding:2.5rem;text-align:center;border-radius:4px}
.plan h3{font-size:1.5rem;margin-bottom:1rem;text-transform:uppercase}
.plan .price{font-size:2.5rem;color:{{COLOR_PRIMARY}};font-weight:bold;margin-bottom:1rem}
.plan ul{list-style:none;margin-bottom:2rem}
.plan li{padding:8px 0;border-bottom:1px solid #333;color:#aaa}
.contact{background:#1a1a1a;padding:60px 20px;text-align:center}
.contact p{color:#aaa;margin-bottom:0.5rem;font-size:1.1rem}
footer{padding:30px 20px;text-align:center;color:#666;font-size:0.9rem}
</style>
</head>
<body>
<div class="hero">
<div>
<h1>{{BUSINESS_NAME}}</h1>
<p>{{TAGLINE}}</p>
<a href="tel:{{PHONE}}" class="btn">Start Today</a>
</div>
</div>
<div class="section">
<h2>Membership Plans</h2>
<div class="plans">
<div class="plan"><h3>Basic</h3><div class="price">€29/mo</div><ul><li>Gym Access</li><li>Locker Room</li><li>Free WiFi</li></ul><a href="tel:{{PHONE}}" class="btn" style="width:100%;text-align:center">Join Now</a></div>
<div class="plan" style="border-color:{{COLOR_PRIMARY}}"><h3>Pro</h3><div class="price">€49/mo</div><ul><li>Everything in Basic</li><li>Group Classes</li><li>Nutrition Plan</li></ul><a href="tel:{{PHONE}}" class="btn" style="width:100%;text-align:center">Join Now</a></div>
<div class="plan"><h3>Elite</h3><div class="price">€79/mo</div><ul><li>Everything in Pro</li><li>Personal Trainer</li><li>Sauna & Spa</li></ul><a href="tel:{{PHONE}}" class="btn" style="width:100%;text-align:center">Join Now</a></div>
</div>
</div>
<div class="contact">
<h2 style="color:{{COLOR_PRIMARY}};font-size:2rem;margin-bottom:1.5rem;text-transform:uppercase">Visit Us</h2>
<p>📍 {{ADDRESS}}</p>
<p>📞 {{PHONE}}</p>
</div>
<footer><p>&copy; 2024 {{BUSINESS_NAME}}</p></footer>
</body>
</html>`,
    fields: [
      { key: "BUSINESS_NAME", label: "Gym name", type: "text", required: true },
      { key: "TAGLINE", label: "Tagline", type: "text", required: false },
      { key: "PHONE", label: "Phone number", type: "text", required: true },
      { key: "ADDRESS", label: "Address", type: "text", required: true },
      { key: "COLOR_PRIMARY", label: "Primary color", type: "color", required: false },
      { key: "HERO_IMAGE", label: "Hero image", type: "image", required: false },
    ],
    price: 14.99,
    is_active: true,
    downloads: 156,
    rating: 4.5,
    created_at: "2024-03-01T00:00:00Z",
    designer: demoDesigner,
  },
  {
    id: "tpl-salon-1",
    designer_id: "demo-user-2",
    name: "Luxe Salon",
    niche: "Hair Salon",
    description: "Elegant hair salon template with service menu, gallery, booking CTA, and stylist profiles.",
    preview_image_url: "https://placehold.co/800x500/7c3aed/white?text=Luxe+Salon",
    html_content: `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{BUSINESS_NAME}}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Georgia',serif;color:#333}
.hero{background:linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url('{{HERO_IMAGE}}') center/cover;height:70vh;display:flex;align-items:center;justify-content:center;text-align:center;color:white}
.hero h1{font-size:3rem;letter-spacing:3px;text-transform:uppercase;margin-bottom:1rem}
.hero p{font-size:1.1rem;opacity:0.9;margin-bottom:2rem}
.btn{background:{{COLOR_PRIMARY}};color:white;padding:14px 32px;border:none;font-size:1rem;cursor:pointer;letter-spacing:1px;text-decoration:none;display:inline-block}
.section{padding:80px 20px;max-width:1000px;margin:0 auto;text-align:center}
.section h2{font-size:2rem;margin-bottom:3rem;color:{{COLOR_PRIMARY}}}
.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem}
.service-item{padding:1.5rem;border:1px solid #e5e7eb;border-radius:8px}
.service-item h3{margin-bottom:0.5rem}
.service-item .price{color:{{COLOR_PRIMARY}};font-weight:bold;font-size:1.1rem}
.cta{background:{{COLOR_PRIMARY}};color:white;padding:60px 20px;text-align:center}
.cta h2{color:white;margin-bottom:1rem}
footer{background:#1a1a1a;color:#999;padding:30px 20px;text-align:center;font-size:0.9rem}
</style></head><body>
<div class="hero"><div><h1>{{BUSINESS_NAME}}</h1><p>{{TAGLINE}}</p><a href="tel:{{PHONE}}" class="btn">Book Now</a></div></div>
<div class="section"><h2>Our Services</h2><div class="services">
<div class="service-item"><h3>Haircut & Style</h3><p class="price">From €45</p></div>
<div class="service-item"><h3>Color & Highlights</h3><p class="price">From €85</p></div>
<div class="service-item"><h3>Blowout</h3><p class="price">From €35</p></div>
<div class="service-item"><h3>Hair Treatment</h3><p class="price">From €55</p></div>
</div></div>
<div class="cta"><h2>Book Your Appointment</h2><p style="opacity:0.9;margin-bottom:0.5rem">📍 {{ADDRESS}}</p><p style="opacity:0.9;margin-bottom:2rem">📞 {{PHONE}}</p><a href="tel:{{PHONE}}" class="btn" style="background:white;color:{{COLOR_PRIMARY}}">Call Now</a></div>
<footer><p>&copy; 2024 {{BUSINESS_NAME}}</p></footer>
</body></html>`,
    fields: [
      { key: "BUSINESS_NAME", label: "Salon name", type: "text", required: true },
      { key: "TAGLINE", label: "Tagline", type: "text", required: false },
      { key: "PHONE", label: "Phone number", type: "text", required: true },
      { key: "ADDRESS", label: "Address", type: "text", required: true },
      { key: "COLOR_PRIMARY", label: "Primary color", type: "color", required: false },
      { key: "HERO_IMAGE", label: "Hero image", type: "image", required: false },
    ],
    price: 12.99,
    is_active: true,
    downloads: 98,
    rating: 4.7,
    created_at: "2024-03-15T00:00:00Z",
    designer: demoDesigner2,
  },
  {
    id: "tpl-realestate-1",
    designer_id: "demo-user-1",
    name: "PrimeProperties",
    niche: "Real Estate",
    description: "Professional real estate agent template with property showcase, about section, and contact form.",
    preview_image_url: "https://placehold.co/800x500/0ea5e9/white?text=PrimeProperties",
    html_content: `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{BUSINESS_NAME}}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;color:#333}
.hero{background:{{COLOR_PRIMARY}};padding:100px 20px;text-align:center;color:white}
.hero h1{font-size:3rem;margin-bottom:1rem}.hero p{font-size:1.2rem;opacity:0.9;margin-bottom:2rem}
.btn{background:white;color:{{COLOR_PRIMARY}};padding:14px 32px;border:none;font-size:1rem;cursor:pointer;border-radius:6px;font-weight:600;text-decoration:none;display:inline-block}
.section{padding:80px 20px;max-width:1100px;margin:0 auto}.section h2{font-size:2rem;text-align:center;margin-bottom:3rem}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;text-align:center;margin-bottom:3rem}
.stat-num{font-size:2.5rem;font-weight:bold;color:{{COLOR_PRIMARY}}}
.stat-label{color:#666;margin-top:0.5rem}
.about{background:#f8fafc;padding:80px 20px}.about-inner{max-width:800px;margin:0 auto;text-align:center}
.about-inner p{font-size:1.1rem;line-height:1.8;color:#555}
.contact{padding:60px 20px;text-align:center}
.contact p{color:#666;margin-bottom:0.5rem;font-size:1.1rem}
footer{background:#1a1a1a;color:#999;padding:30px 20px;text-align:center;font-size:0.9rem}
</style></head><body>
<div class="hero"><h1>{{BUSINESS_NAME}}</h1><p>{{TAGLINE}}</p><a href="tel:{{PHONE}}" class="btn">Get in Touch</a></div>
<div class="section"><h2>Why Work With Me</h2><div class="stats">
<div><div class="stat-num">500+</div><div class="stat-label">Homes Sold</div></div>
<div><div class="stat-num">15+</div><div class="stat-label">Years Experience</div></div>
<div><div class="stat-num">98%</div><div class="stat-label">Client Satisfaction</div></div>
</div></div>
<div class="about"><div class="about-inner"><h2 style="margin-bottom:2rem">About</h2><p>{{ABOUT_TEXT}}</p></div></div>
<div class="contact"><h2 style="margin-bottom:1.5rem">Contact</h2><p>📍 {{ADDRESS}}</p><p>📞 {{PHONE}}</p></div>
<footer><p>&copy; 2024 {{BUSINESS_NAME}}</p></footer>
</body></html>`,
    fields: [
      { key: "BUSINESS_NAME", label: "Agent / Agency name", type: "text", required: true },
      { key: "TAGLINE", label: "Tagline", type: "text", required: false },
      { key: "PHONE", label: "Phone number", type: "text", required: true },
      { key: "ADDRESS", label: "Office address", type: "text", required: true },
      { key: "COLOR_PRIMARY", label: "Primary color", type: "color", required: false },
      { key: "ABOUT_TEXT", label: "About description", type: "textarea", required: false },
    ],
    price: 19.99,
    is_active: true,
    downloads: 312,
    rating: 4.9,
    created_at: "2024-01-20T00:00:00Z",
    designer: demoDesigner,
  },
  {
    id: "tpl-law-1",
    designer_id: "demo-user-2",
    name: "JusticeFirst",
    niche: "Law Firm",
    description: "Authoritative law firm template with practice areas, attorney profiles, and consultation CTA.",
    preview_image_url: "https://placehold.co/800x500/1e293b/white?text=JusticeFirst",
    html_content: `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{BUSINESS_NAME}}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Georgia',serif;color:#333}
.hero{background:linear-gradient(135deg,#1e293b 0%,{{COLOR_PRIMARY}} 100%);padding:100px 20px;text-align:center;color:white}
.hero h1{font-size:3rem;margin-bottom:1rem;letter-spacing:2px}.hero p{font-size:1.2rem;opacity:0.9;margin-bottom:2rem}
.btn{background:{{COLOR_PRIMARY}};color:white;padding:14px 32px;border:none;font-size:1rem;cursor:pointer;letter-spacing:1px;text-decoration:none;display:inline-block}
.section{padding:80px 20px;max-width:1100px;margin:0 auto}.section h2{font-size:2rem;text-align:center;margin-bottom:3rem}
.areas{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem}
.area{border:1px solid #e5e7eb;padding:2rem;border-radius:4px;border-top:3px solid {{COLOR_PRIMARY}}}
.area h3{margin-bottom:0.5rem;font-size:1.2rem}.area p{color:#666;line-height:1.6;font-size:0.95rem}
.cta{background:#f8fafc;padding:60px 20px;text-align:center}
footer{background:#1e293b;color:#94a3b8;padding:30px 20px;text-align:center;font-size:0.9rem}
</style></head><body>
<div class="hero"><h1>{{BUSINESS_NAME}}</h1><p>{{TAGLINE}}</p><a href="tel:{{PHONE}}" class="btn">Free Consultation</a></div>
<div class="section"><h2>Practice Areas</h2><div class="areas">
<div class="area"><h3>Family Law</h3><p>Divorce, custody, adoption, and domestic relations matters.</p></div>
<div class="area"><h3>Personal Injury</h3><p>Auto accidents, slip & fall, medical malpractice claims.</p></div>
<div class="area"><h3>Business Law</h3><p>Contracts, formation, disputes, and compliance.</p></div>
</div></div>
<div class="cta"><h2 style="margin-bottom:1rem">Schedule a Consultation</h2><p style="color:#666;margin-bottom:0.5rem">📍 {{ADDRESS}}</p><p style="color:#666;margin-bottom:2rem">📞 {{PHONE}}</p><a href="tel:{{PHONE}}" class="btn">Call Now</a></div>
<footer><p>&copy; 2024 {{BUSINESS_NAME}}</p></footer>
</body></html>`,
    fields: [
      { key: "BUSINESS_NAME", label: "Firm name", type: "text", required: true },
      { key: "TAGLINE", label: "Tagline", type: "text", required: false },
      { key: "PHONE", label: "Phone number", type: "text", required: true },
      { key: "ADDRESS", label: "Office address", type: "text", required: true },
      { key: "COLOR_PRIMARY", label: "Primary color", type: "color", required: false },
    ],
    price: 24.99,
    is_active: true,
    downloads: 145,
    rating: 4.4,
    created_at: "2024-02-20T00:00:00Z",
    designer: demoDesigner2,
  },
];
