import type { ContentType } from '@/lib/types';

interface GenerateParams {
  type: ContentType;
  prompt: string;
  tone?: string;
  platform?: string;
}

const BARBERSHOP_CONTEXT = `You are the marketing engine for "Crown Cuts," a luxury barbershop that offers premium grooming services including classic haircuts, skin fades, beard sculpts, royal straight-razor shaves, and executive packages. The brand voice is sophisticated, confident, and refined — think old-world craftsmanship meets modern style.`;

function generateText(prompt: string, tone: string): string {
  const tones: Record<string, string> = {
    luxurious: `Step into a world of refined grooming at Crown Cuts. ${prompt} Our master barbers blend timeless craftsmanship with contemporary precision to deliver an experience that transcends the ordinary. From the moment you settle into our leather chair, you're not just a client — you're a connoisseur of fine grooming. Book your appointment today and discover why discerning gentlemen choose us for their signature look.`,
    energetic: `Ready to level up your look? ${prompt} At Crown Cuts, we don't just cut hair — we craft confidence. Our expert barbers are masters of the fade, the sculpt, and the clean line-up. Walk in, get sharp, walk out feeling unstoppable. Your next great look is one appointment away. Let's make it happen!`,
    professional: `Crown Cuts offers exceptional grooming services tailored to the modern professional. ${prompt} Our experienced barbers provide precision cuts, beard sculpting, and traditional shaves in a refined atmosphere. We understand that your appearance is an investment in your personal brand. Schedule your visit and experience the difference that expert craftsmanship makes.`,
    casual: `Hey there — looking sharp starts here. ${prompt} Whether you need a fresh cut, a beard tidy-up, or just some time in the chair, Crown Cuts has you covered. No fuss, no frills — just great grooming from people who genuinely care about how you look. Come by, grab a coffee, and let's get you sorted.`,
  };

  return tones[tone] || tones.luxurious;
}

function generateEmail(prompt: string, tone: string): string {
  const subject = `Your Next Appointment at Crown Cuts`;
  const body = `Dear Valued Client,

${generateText(prompt, tone)}

As one of our preferred clients, we'd like to remind you that your grooming experience includes:
- A complimentary consultation with your barber
- Hot towel treatment with every service
- Our signature scalp massage
- A precision finish tailored to your style

To schedule your next visit, simply reply to this email or book online through our website. We have openings this week that would be perfect for you.

Warm regards,
Crown Cuts Team
${new Date().getFullYear()}`;

  return `Subject: ${subject}\n\n${body}`;
}

function generateCode(prompt: string): string {
  return `<!-- Crown Cuts - Marketing Banner -->
<!-- Prompt: ${prompt} -->
<div class="gilded-blade-banner">
  <div class="banner-content">
    <h2 class="banner-title">Crown Cuts</h2>
    <p class="banner-subtitle">Premium Grooming for the Modern Gentleman</p>
    <p class="banner-text">${prompt}</p>
    <a href="#booking" class="banner-cta">Book Your Appointment</a>
  </div>
  <style>
    .gilded-blade-banner {
      background: linear-gradient(135deg, #1E1E24 0%, #0A0A0D 100%);
      border: 1px solid rgba(196, 154, 46, 0.3);
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      color: #FDFBF7;
      font-family: 'Inter', sans-serif;
    }
    .banner-title {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(to right, #E8D49B, #D4A93E, #A87E22);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .banner-subtitle {
      font-size: 1.1rem;
      color: #DDBD66;
      margin-bottom: 24px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .banner-text {
      font-size: 1rem;
      line-height: 1.6;
      color: #C9C9CE;
      max-width: 500px;
      margin: 0 auto 32px;
    }
    .banner-cta {
      display: inline-block;
      background: linear-gradient(to right, #D4A93E, #A87E22);
      color: #0A0A0D;
      font-weight: 600;
      padding: 14px 36px;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .banner-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(196, 154, 46, 0.3);
    }
  </style>
</div>`;
}

function generateImagePrompt(prompt: string): string {
  const base = `Ultra-realistic luxury barbershop scene, dramatic cinematic lighting, warm golden tones, dark charcoal background, premium leather barber chair, vintage brass fixtures, polished wood accents, sophisticated atmosphere`;
  const variations = [
    `Close-up of a master barber's hands using a straight razor with precision, steam from hot towel rising, shallow depth of field, ${prompt}`,
    `Wide shot of an elegant barbershop interior, moody atmosphere, a gentleman getting a fresh fade, warm amber lighting, ${prompt}`,
    `Portrait of a well-groomed man with a sharp skin fade and sculpted beard, confident expression, dramatic side lighting, dark background, ${prompt}`,
    `Detail shot of premium grooming tools laid out on a marble counter — straight razor, scissors, beard oil, comb — arranged with care, ${prompt}`,
  ];

  return `${base}\n\nVariations:\n\n1. ${variations[0]}\n\n2. ${variations[1]}\n\n3. ${variations[2]}\n\n4. ${variations[3]}\n\nStyle: Photorealistic, editorial photography, 4K, high detail, luxury aesthetic, warm color grading`;
}

export function generateContent(params: GenerateParams): string {
  const { type, prompt, tone = 'luxurious' } = params;
  const fullPrompt = `${BARBERSHOP_CONTEXT}\n\nRequest: ${prompt}`;

  switch (type) {
    case 'text':
      return generateText(prompt, tone);
    case 'email':
      return generateEmail(prompt, tone);
    case 'code':
      return generateCode(prompt);
    case 'image':
      return generateImagePrompt(prompt);
    default:
      return generateText(prompt, tone);
  }
}

export const TONE_OPTIONS = [
  { value: 'luxurious', label: 'Luxurious' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  text: 'Marketing Text',
  email: 'Email Campaign',
  code: 'HTML Banner',
  image: 'Image Prompt',
};
