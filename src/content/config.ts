import { defineCollection, z } from 'astro:content';

const stories = defineCollection({
  type: 'content',
  schema: z.object({
      title: z.string(),
      excerpt: z.string(),
      cover: z.string().optional(),
      coverAlt: z.string().optional(),
      authorName: z.string().optional(),
      isAnonymous: z.boolean().default(false),
      publishDate: z.date(),
      featured: z.boolean().default(false),
      isSample: z.boolean().default(false),
    }),
});

const podcast = defineCollection({
  type: 'content',
  schema: z.object({
      title: z.string(),
      episodeNumber: z.number(),
      description: z.string(),
      publishDate: z.date(),
      spotifyEmbedUrl: z.string().optional(),
      appleUrl: z.string().optional(),
      youtubeUrl: z.string().optional(),
      cover: z.string().optional(),
      coverAlt: z.string().optional(),
      isSample: z.boolean().default(false),
    }),
});

const journal = defineCollection({
  type: 'content',
  schema: z.object({
      title: z.string(),
      category: z.enum(['Hope', 'Healing', 'Faith', 'Community', 'Wellness']),
      excerpt: z.string(),
      cover: z.string().optional(),
      coverAlt: z.string().optional(),
      publishDate: z.date(),
      isSample: z.boolean().default(false),
    }),
});

const graceNotes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    isSample: z.boolean().default(false),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      format: z.enum(['Online', 'In person']),
      locationOrLink: z.string().optional(),
      registrationUrl: z.string().optional(),
      capacityNote: z.string().optional(),
      recordingUrl: z.string().optional(),
      gallery: z.array(z.string()).optional(),
      isSample: z.boolean().default(false),
    }),
});

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    price: z.number().int().positive(),
    summary: z.string(),
    images: z.array(z.string()).default([]),
    imageAlt: z.string().optional(),
    sizes: z.array(z.string()).default([]),
    inStock: z.boolean().default(true),
    featured: z.boolean().default(false),
    sortOrder: z.number().default(100),
  }),
});

const settings = defineCollection({
  type: 'data',
  schema: z.object({
    tagline: z.string(),
    heroDescription: z.string(),
    communityJoinUrl: z.string(),
    spotifyUrl: z.string().optional(),
    appleUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    contactEmail: z.string(),
    partnerBlurb: z.string(),
    wellnessDisclaimer: z.string(),
    deliveryFee: z.number().int().nonnegative().default(0),
    deliveryNote: z.string().optional(),
    paymentMode: z.enum(['manual_mpesa', 'paystack']).default('manual_mpesa'),
    mpesaMethod: z.enum(['Pochi la Biashara', 'Till (Buy Goods)', 'Send Money']).default('Pochi la Biashara'),
    mpesaNumber: z.string().optional(),
    mpesaAccountName: z.string().optional(),
  }),
});

export const collections = { stories, podcast, journal, graceNotes, events, products, settings };
