export interface BarbershopPhoto {
  url: string;
  alt: string;
  photographer: string;
  category: 'fade' | 'shave' | 'portrait' | 'interior' | 'tools';
}

export const BARBERSHOP_PHOTOS: BarbershopPhoto[] = [
  // Fade / haircut
  { url: 'https://images.pexels.com/photos/12074386/pexels-photo-12074386.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Rear view close-up of a man with a fresh haircut showcasing a sharp fade', photographer: 'Ali Aliev', category: 'fade' },
  { url: 'https://images.pexels.com/photos/12464837/pexels-photo-12464837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Close-up of a barber giving a modern haircut with a straight razor', photographer: 'izzet çakallı', category: 'fade' },
  { url: 'https://images.pexels.com/photos/34702982/pexels-photo-34702982.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'A barber skillfully trims a young man\'s hair in a modern salon', photographer: 'Daniel Cosma', category: 'fade' },
  { url: 'https://images.pexels.com/photos/12464841/pexels-photo-12464841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Close-up of a barber expertly using a razor for a precise fade haircut', photographer: 'izzet çakallı', category: 'fade' },
  { url: 'https://images.pexels.com/photos/4625632/pexels-photo-4625632.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Back view of a man receiving a haircut with clipper in a barber shop', photographer: 'Antoni Shkraba', category: 'fade' },
  { url: 'https://images.pexels.com/photos/9971240/pexels-photo-9971240.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'A barber precisely cuts hair with a trimmer and comb', photographer: 'Kevin Bidwell', category: 'fade' },

  // Shave
  { url: 'https://images.pexels.com/photos/10775081/pexels-photo-10775081.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Detailed black and white image of a man shaving with a straight razor', photographer: 'Vitaly Gorbachev', category: 'shave' },
  { url: 'https://images.pexels.com/photos/36150782/pexels-photo-36150782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'A traditional barber giving a straight razor shave', photographer: 'Uriel Lu', category: 'shave' },
  { url: 'https://images.pexels.com/photos/9315046/pexels-photo-9315046.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'A barber carefully shaves a relaxed client using a straight razor', photographer: 'Clark Enzzo', category: 'shave' },
  { url: 'https://images.pexels.com/photos/7697481/pexels-photo-7697481.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Close-up of a barber using a straight razor for precise grooming', photographer: 'RDNE Stock project', category: 'shave' },
  { url: 'https://images.pexels.com/photos/8867486/pexels-photo-8867486.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'A professional barber shaving a client\'s beard with a straight razor', photographer: 'Los Muertos Crew', category: 'shave' },

  // Portrait / style
  { url: 'https://images.pexels.com/photos/1485994/pexels-photo-1485994.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Close-up of a fashionable man with styled hair and beard', photographer: 'Nitin Khajotia', category: 'portrait' },
  { url: 'https://images.pexels.com/photos/12706272/pexels-photo-12706272.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Close-up shot of a man\'s stylish haircut and beard', photographer: 'iam luisao', category: 'portrait' },
  { url: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Close-up portrait of a bearded man in a stylish jacket', photographer: 'Andrea Piacquadio', category: 'portrait' },
  { url: 'https://images.pexels.com/photos/11091241/pexels-photo-11091241.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Side profile of a bearded man in a contemplative pose', photographer: 'Rupinder Singh', category: 'portrait' },

  // Interior / action
  { url: 'https://images.pexels.com/photos/4625620/pexels-photo-4625620.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'A modern barbershop interior with a barber trimming a bearded man\'s hair', photographer: 'Antoni Shkraba', category: 'interior' },
  { url: 'https://images.pexels.com/photos/3998403/pexels-photo-3998403.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'A bearded barber skillfully trims a client\'s hair in a modern barbershop', photographer: 'cottonbro studio', category: 'interior' },
  { url: 'https://images.pexels.com/photos/7447140/pexels-photo-7447140.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Barber skillfully using a razor to shave a client\'s beard with precision', photographer: 'Gustavo Fring', category: 'interior' },
  { url: 'https://images.pexels.com/photos/4625619/pexels-photo-4625619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bearded man sitting in a modern barbershop for a haircut and styling session', photographer: 'Antoni Shkraba', category: 'interior' },
  { url: 'https://images.pexels.com/photos/3998408/pexels-photo-3998408.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'A barber meticulously grooming a bearded man in a stylish barbershop', photographer: 'cottonbro studio', category: 'interior' },
];

const KEYWORD_MAP: Record<string, BarbershopPhoto['category']> = {
  fade: 'fade',
  haircut: 'fade',
  cut: 'fade',
  clipper: 'fade',
  trim: 'fade',
  shave: 'shave',
  razor: 'shave',
  beard: 'shave',
  portrait: 'portrait',
  man: 'portrait',
  style: 'portrait',
  hairstyle: 'portrait',
  interior: 'interior',
  shop: 'interior',
  barbershop: 'interior',
  chair: 'interior',
  tools: 'tools',
};

export function getPhotosForPrompt(prompt: string, count = 6): BarbershopPhoto[] {
  const lower = prompt.toLowerCase();
  const matchedCategories = new Set<BarbershopPhoto['category']>();

  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      matchedCategories.add(category);
    }
  }

  if (matchedCategories.size === 0) {
    matchedCategories.add('fade');
    matchedCategories.add('portrait');
  }

  const matched = BARBERSHOP_PHOTOS.filter((p) => matchedCategories.has(p.category));

  if (matched.length >= count) return matched.slice(0, count);

  const remaining = BARBERSHOP_PHOTOS.filter((p) => !matchedCategories.has(p.category));
  return [...matched, ...remaining].slice(0, count);
}
