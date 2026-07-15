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
  }),
});

export const collections = { stories, podcast, journal, graceNotes, events, settings };
